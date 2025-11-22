/**
 * KeyboardController.js
 * キーボード操作を管理
 */

class KeyboardController {
  constructor() {
    this.keyMappings = {};
    this.enabled = true;
    this.helpVisible = false;
    this.helpElement = null;

    this.initializeDefaultMappings();
    this.setupEventListeners();
    this.createHelpOverlay();
  }

  /**
   * デフォルトのキーマッピングを初期化
   */
  initializeDefaultMappings() {
    this.defaultMappings = {
      // 動画制御
      '1': { action: 'switchVideo', param: 0, description: '動画1に切り替え' },
      '2': { action: 'switchVideo', param: 1, description: '動画2に切り替え' },
      '3': { action: 'switchVideo', param: 2, description: '動画3に切り替え' },
      '4': { action: 'switchVideo', param: 3, description: '動画4に切り替え' },
      ' ': { action: 'randomSwitch', description: 'ランダム切り替え' },
      'Enter': { action: 'nextVideo', description: '次の動画へ' },

      // エフェクト
      'q': { action: 'glitchEffect', description: 'グリッチエフェクト' },
      'w': { action: 'flashEffect', description: 'フラッシュエフェクト' },
      'e': { action: 'colorShift', description: 'カラーシフト' },

      // テキスト制御
      'a': { action: 'toggleText', param: 0, description: 'テキスト1 表示/非表示' },
      's': { action: 'toggleText', param: 1, description: 'テキスト2 表示/非表示' },
      'd': { action: 'toggleText', param: 2, description: 'テキスト3 表示/非表示' },
      'r': { action: 'resetAnimations', description: 'アニメーションリセット' },

      // システム
      'm': { action: 'toggleMode', description: 'オート/マニュアル切替' },
      'f': { action: 'toggleFullscreen', description: 'フルスクリーン切替' },
      'h': { action: 'toggleHelp', description: 'ヘルプ表示' },
      'x': { action: 'blackout', description: 'ブラックアウト' },
      'c': { action: 'whiteout', description: 'ホワイトアウト' },

      // 速度調整
      'ArrowUp': { action: 'increaseSpeed', description: '切り替え速度アップ' },
      'ArrowDown': { action: 'decreaseSpeed', description: '切り替え速度ダウン' },
      'ArrowLeft': { action: 'decreaseTextSpeed', description: 'テキスト速度ダウン' },
      'ArrowRight': { action: 'increaseTextSpeed', description: 'テキスト速度アップ' }
    };

    this.keyMappings = { ...this.defaultMappings };
  }

  /**
   * イベントリスナーのセットアップ
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  /**
   * キー押下時の処理
   */
  handleKeyPress(event) {
    if (!this.enabled) return;

    // 入力フィールドにフォーカスがある場合は無視
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key;
    const mapping = this.keyMappings[key];

    if (mapping) {
      event.preventDefault();

      console.log(`Key pressed: ${key} - Action: ${mapping.action}`);

      // アクションコールバックを実行
      if (this.actionCallbacks && this.actionCallbacks[mapping.action]) {
        this.actionCallbacks[mapping.action](mapping.param);
      }
    }
  }

  /**
   * キーを登録
   */
  registerKey(key, action, param, description) {
    this.keyMappings[key] = {
      action,
      param,
      description
    };
    console.log(`Key registered: ${key} -> ${action}`);
  }

  /**
   * アクションコールバックを設定
   */
  setActionCallbacks(callbacks) {
    this.actionCallbacks = callbacks;
  }

  /**
   * キーボードを有効化
   */
  enableKeyboard() {
    this.enabled = true;
    console.log('Keyboard enabled');
  }

  /**
   * キーボードを無効化
   */
  disableKeyboard() {
    this.enabled = false;
    console.log('Keyboard disabled');
  }

  /**
   * キーマッピングを更新
   */
  updateMapping(mappings) {
    this.keyMappings = {
      ...this.defaultMappings,
      ...mappings
    };
    console.log('Key mappings updated');
  }

  /**
   * デフォルトのキーマッピングにリセット
   */
  resetToDefault() {
    this.keyMappings = { ...this.defaultMappings };
    console.log('Key mappings reset to default');
  }

  /**
   * ヘルプオーバーレイを作成
   */
  createHelpOverlay() {
    this.helpElement = document.createElement('div');
    this.helpElement.id = 'keyboard-help';
    this.helpElement.className = 'keyboard-help';
    this.helpElement.style.display = 'none';

    document.body.appendChild(this.helpElement);
    this.updateHelpContent();
  }

  /**
   * ヘルプ内容を更新
   */
  updateHelpContent() {
    const categories = {
      '動画制御': ['1', '2', '3', '4', ' ', 'Enter'],
      'エフェクト': ['q', 'w', 'e', 'x', 'c'],
      'テキスト': ['a', 's', 'd', 'r'],
      'システム': ['m', 'f', 'h'],
      '速度調整': ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    };

    let helpHTML = '<div class="help-header"><h2>キーボードショートカット</h2><p>Press H to close</p></div>';
    helpHTML += '<div class="help-content">';

    for (const [category, keys] of Object.entries(categories)) {
      helpHTML += `<div class="help-category"><h3>${category}</h3><ul>`;

      keys.forEach(key => {
        const mapping = this.keyMappings[key];
        if (mapping) {
          const displayKey = this.getDisplayKey(key);
          helpHTML += `<li><span class="key">${displayKey}</span><span class="desc">${mapping.description}</span></li>`;
        }
      });

      helpHTML += '</ul></div>';
    }

    helpHTML += '</div>';
    this.helpElement.innerHTML = helpHTML;
  }

  /**
   * キーの表示名を取得
   */
  getDisplayKey(key) {
    const displayNames = {
      ' ': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Enter': 'Enter'
    };

    return displayNames[key] || key.toUpperCase();
  }

  /**
   * ヘルプの表示/非表示を切り替え
   */
  toggleHelp() {
    this.helpVisible = !this.helpVisible;

    if (this.helpVisible) {
      this.helpElement.style.display = 'block';
      setTimeout(() => {
        this.helpElement.classList.add('visible');
      }, 10);
    } else {
      this.helpElement.classList.remove('visible');
      setTimeout(() => {
        this.helpElement.style.display = 'none';
      }, 300);
    }
  }

  /**
   * 全てのキーマッピングを取得
   */
  getAllMappings() {
    return { ...this.keyMappings };
  }

  /**
   * 特定のアクションに割り当てられたキーを取得
   */
  getKeysForAction(action) {
    return Object.entries(this.keyMappings)
      .filter(([_, mapping]) => mapping.action === action)
      .map(([key, _]) => key);
  }

  /**
   * クリーンアップ
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyPress);
    if (this.helpElement && this.helpElement.parentNode) {
      this.helpElement.parentNode.removeChild(this.helpElement);
    }
  }
}

export default KeyboardController;
