/**
 * main.js
 * youtuvj2 - メインアプリケーション統合
 */

import ConfigManager from './modules/ConfigManager.js';
import VideoManager from './modules/VideoManager.js';
import TransitionEngine from './modules/TransitionEngine.js';
import TextOverlay from './modules/TextOverlay.js';
import KeyboardController from './modules/KeyboardController.js';
import ControlPanel from './modules/ControlPanel.js';

class YouTuVJ {
  constructor() {
    this.config = null;
    this.configManager = null;
    this.videoManager = null;
    this.transitionEngine = null;
    this.textOverlay = null;
    this.keyboardController = null;
    this.controlPanel = null;
    this.autoSwitchTimer = null;

    this.initialize();
  }

  /**
   * アプリケーションの初期化
   */
  async initialize() {
    console.log('Initializing YouTuVJ...');

    // ConfigManagerを初期化
    this.configManager = new ConfigManager();
    this.config = this.configManager.loadConfig();

    // 各コンポーネントを初期化
    await this.initializeComponents();

    // キーボードコントロールをセットアップ
    this.setupKeyboardControls();

    // コントロールパネルのコールバックを設定
    this.setupControlPanelCallbacks();

    // 動画の初期化
    this.initializeVideos();

    // テキストオーバーレイの初期化
    this.initializeTexts();

    // オートモードの開始
    if (this.config.transitions.autoMode) {
      this.startAutoSwitch();
    }

    console.log('YouTuVJ initialized successfully');
  }

  /**
   * コンポーネントの初期化
   */
  async initializeComponents() {
    const videoContainer = document.getElementById('video-container');
    const controlPanelContainer = document.getElementById('control-panel');

    // VideoManagerの初期化
    this.videoManager = new VideoManager(videoContainer, this.configManager);

    // TransitionEngineの初期化
    this.transitionEngine = new TransitionEngine(videoContainer);
    this.transitionEngine.setDefaultTransition(this.config.transitions.defaultTransition);

    // TextOverlayの初期化
    this.textOverlay = new TextOverlay(videoContainer);

    // KeyboardControllerの初期化
    this.keyboardController = new KeyboardController();

    // ControlPanelの初期化
    this.controlPanel = new ControlPanel(controlPanelContainer, this.config);

    // 動画切り替え時のコールバックを登録
    this.videoManager.onSwitch((fromIndex, toIndex) => {
      this.onVideoSwitch(fromIndex, toIndex);
    });
  }

  /**
   * 動画の初期化
   */
  initializeVideos() {
    const videoConfigs = this.config.videos.filter(v => v.url && v.active);
    if (videoConfigs.length > 0) {
      this.videoManager.initialize(this.config.videos);
    }
  }

  /**
   * テキストオーバーレイの初期化
   */
  initializeTexts() {
    this.config.texts.forEach((text, index) => {
      if (text.content) {
        this.textOverlay.addText(index, text.content, text.animation, text.params);
        // UIに表示状態を反映
        const isVisible = this.textOverlay.isTextVisible(index);
        this.controlPanel.setTextActive(index, isVisible);
      }
    });
  }

  /**
   * キーボードコントロールのセットアップ
   */
  setupKeyboardControls() {
    const actions = {
      // 動画制御
      switchVideo: (index) => {
        this.switchToVideo(index);
      },
      randomSwitch: () => {
        this.randomSwitch();
      },
      nextVideo: () => {
        this.videoManager.nextVideo();
      },

      // エフェクト
      glitchEffect: () => {
        this.transitionEngine.triggerGlitchEffect();
      },
      flashEffect: () => {
        this.transitionEngine.triggerFlashEffect();
      },
      colorShift: () => {
        this.transitionEngine.triggerColorShift();
      },
      blackout: () => {
        this.transitionEngine.triggerBlackout();
      },
      whiteout: () => {
        this.transitionEngine.triggerWhiteout();
      },

      // テキスト制御
      toggleText: (index) => {
        const isVisible = this.textOverlay.toggleText(index);
        this.controlPanel.setTextActive(index, isVisible);
      },
      resetAnimations: () => {
        this.textOverlay.resetAllAnimations();
      },

      // システム
      toggleMode: () => {
        this.toggleAutoMode();
      },
      toggleFullscreen: () => {
        this.toggleFullscreen();
      },
      toggleHelp: () => {
        this.keyboardController.toggleHelp();
      },

      // 速度調整
      increaseSpeed: () => {
        this.adjustSwitchSpeed(0.8);
      },
      decreaseSpeed: () => {
        this.adjustSwitchSpeed(1.2);
      },
      increaseTextSpeed: () => {
        this.adjustTextSpeed(1.2);
      },
      decreaseTextSpeed: () => {
        this.adjustTextSpeed(0.8);
      }
    };

    this.keyboardController.setActionCallbacks(actions);
  }

  /**
   * コントロールパネルのコールバックをセットアップ
   */
  setupControlPanelCallbacks() {
    this.controlPanel.setOnChange((type, index, value) => {
      switch (type) {
        case 'video':
          this.handleVideoChange(index, value);
          break;

        case 'text':
          this.handleTextChange(index, value);
          break;

        case 'transition':
          this.transitionEngine.setDefaultTransition(value.defaultTransition);
          break;

        case 'autoMode':
          if (value) {
            this.startAutoSwitch();
          } else {
            this.stopAutoSwitch();
          }
          break;

        case 'interval':
          if (this.config.transitions.autoMode) {
            this.restartAutoSwitch();
          }
          break;

        case 'save':
          this.saveConfiguration();
          break;

        case 'load':
          this.loadConfiguration();
          break;

        case 'export':
          this.exportConfiguration();
          break;

        case 'import':
          this.importConfiguration(value);
          break;

        case 'reset':
          this.resetConfiguration();
          break;
      }
    });
  }

  /**
   * 動画変更ハンドラー
   */
  handleVideoChange(index, url) {
    if (this.configManager.extractVideoId(url)) {
      this.videoManager.reloadVideo(index, url);
    }
  }

  /**
   * テキスト変更ハンドラー
   */
  handleTextChange(index, textConfig) {
    this.textOverlay.addText(
      index,
      textConfig.content,
      textConfig.animation,
      textConfig.params
    );
  }

  /**
   * 特定の動画に切り替え
   */
  switchToVideo(index) {
    const fromIndex = this.videoManager.getCurrentVideo();
    this.videoManager.switchVideo(index);
  }

  /**
   * ランダムな動画に切り替え
   */
  randomSwitch() {
    const fromIndex = this.videoManager.getCurrentVideo();
    this.videoManager.randomSwitch();
  }

  /**
   * 動画切り替え時のコールバック
   */
  async onVideoSwitch(fromIndex, toIndex) {
    console.log(`Switching from video ${fromIndex} to ${toIndex}`);

    // UIを更新
    this.controlPanel.setActiveVideo(toIndex);

    // ランダムまたはデフォルトのトランジションを使用
    const transitionType = this.config.transitions.type === 'random'
      ? this.transitionEngine.getRandomTransition()
      : this.config.transitions.defaultTransition;

    await this.transitionEngine.executeTransition(transitionType, fromIndex, toIndex);
  }

  /**
   * オートモードの切り替え
   */
  toggleAutoMode() {
    this.config.transitions.autoMode = !this.config.transitions.autoMode;

    if (this.config.transitions.autoMode) {
      this.startAutoSwitch();
      console.log('Auto mode enabled');
    } else {
      this.stopAutoSwitch();
      console.log('Auto mode disabled');
    }

    // UIを更新
    const autoModeCheckbox = document.getElementById('auto-mode');
    if (autoModeCheckbox) {
      autoModeCheckbox.checked = this.config.transitions.autoMode;
    }

    const indicator = document.getElementById('auto-mode-indicator');
    if (indicator) {
      indicator.textContent = this.config.transitions.autoMode ? 'AUTO' : 'MANUAL';
      indicator.className = this.config.transitions.autoMode ? 'indicator active' : 'indicator';
    }
  }

  /**
   * オート切り替えを開始
   */
  startAutoSwitch() {
    this.stopAutoSwitch(); // 既存のタイマーをクリア

    const scheduleNext = () => {
      const { min, max } = this.config.transitions.interval;
      const randomInterval = Math.random() * (max - min) + min;

      this.autoSwitchTimer = setTimeout(() => {
        this.randomSwitch();
        scheduleNext();
      }, randomInterval);

      console.log(`Next auto switch in ${Math.round(randomInterval / 1000)}s`);
    };

    scheduleNext();
  }

  /**
   * オート切り替えを停止
   */
  stopAutoSwitch() {
    if (this.autoSwitchTimer) {
      clearTimeout(this.autoSwitchTimer);
      this.autoSwitchTimer = null;
    }
  }

  /**
   * オート切り替えを再起動
   */
  restartAutoSwitch() {
    if (this.config.transitions.autoMode) {
      this.startAutoSwitch();
    }
  }

  /**
   * 切り替え速度を調整
   */
  adjustSwitchSpeed(multiplier) {
    const interval = this.config.transitions.interval;
    interval.min = Math.max(1000, Math.round(interval.min * multiplier));
    interval.max = Math.max(interval.min + 1000, Math.round(interval.max * multiplier));

    console.log(`Switch speed adjusted: ${interval.min}ms - ${interval.max}ms`);

    // UIを更新
    const minInput = document.getElementById('interval-min');
    const maxInput = document.getElementById('interval-max');
    if (minInput) minInput.value = interval.min;
    if (maxInput) maxInput.value = interval.max;

    this.restartAutoSwitch();
  }

  /**
   * テキストアニメーション速度を調整
   */
  adjustTextSpeed(multiplier) {
    this.config.texts.forEach((text, index) => {
      text.params.speed = Math.max(0.1, Math.min(10, text.params.speed * multiplier));

      // アニメーションを再適用
      if (text.content) {
        this.textOverlay.setAnimation(index, text.animation, text.params);
      }

      // UIを更新
      const speedInput = document.getElementById(`text-speed-${index}`);
      const valueDisplay = speedInput?.nextElementSibling;
      if (speedInput) speedInput.value = text.params.speed;
      if (valueDisplay) valueDisplay.textContent = text.params.speed.toFixed(1);
    });

    console.log('Text speed adjusted');
  }

  /**
   * フルスクリーン切り替え
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * 設定を保存
   */
  saveConfiguration() {
    const success = this.configManager.saveConfig(this.config);
    if (success) {
      console.log('Configuration saved');
      this.controlPanel.showStatus('Configuration saved!', 'success');
    } else {
      console.error('Failed to save configuration');
      this.controlPanel.showStatus('Failed to save configuration', 'error');
    }
  }

  /**
   * 設定を読み込み
   */
  loadConfiguration() {
    this.config = this.configManager.loadConfig();
    this.controlPanel.updatePanel(this.config);
    this.initializeVideos();
    this.initializeTexts();
    this.restartAutoSwitch();
    console.log('Configuration loaded');
  }

  /**
   * 設定をエクスポート
   */
  exportConfiguration() {
    this.configManager.exportConfig(this.config);
    console.log('Configuration exported');
  }

  /**
   * 設定をインポート
   */
  async importConfiguration(file) {
    try {
      const importedConfig = await this.configManager.importConfig(file);
      this.config = importedConfig;
      this.configManager.saveConfig(this.config);
      this.controlPanel.updatePanel(this.config);
      this.initializeVideos();
      this.initializeTexts();
      this.restartAutoSwitch();
      this.controlPanel.showStatus('Configuration imported!', 'success');
      console.log('Configuration imported');
    } catch (error) {
      console.error('Failed to import configuration:', error);
      this.controlPanel.showStatus('Failed to import configuration', 'error');
    }
  }

  /**
   * 設定をリセット
   */
  resetConfiguration() {
    this.config = this.configManager.resetToDefault();
    this.controlPanel.updatePanel(this.config);
    this.textOverlay.clearAll();
    this.initializeVideos();
    this.restartAutoSwitch();
    console.log('Configuration reset');
  }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting YouTuVJ...');
  window.youtuVJ = new YouTuVJ();
});
