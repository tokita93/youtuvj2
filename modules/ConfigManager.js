/**
 * ConfigManager.js
 * 設定の保存・読み込み・管理を担当
 */

class ConfigManager {
  constructor() {
    this.storageKey = 'youtuvj2_config';
    this.defaultConfig = this.getDefaultConfig();
  }

  /**
   * デフォルト設定を取得
   */
  getDefaultConfig() {
    return {
      videos: [
        { url: "", active: true, title: "Video 1" },
        { url: "", active: true, title: "Video 2" },
        { url: "", active: true, title: "Video 3" },
        { url: "", active: true, title: "Video 4" }
      ],
      texts: [
        {
          content: "",
          animation: "scroll",
          params: {
            speed: 1,
            color: "#ffffff",
            fontSize: "48px",
            position: "top"
          }
        },
        {
          content: "",
          animation: "vertical",
          params: {
            speed: 1,
            color: "#00ff00",
            fontSize: "36px",
            position: "center"
          }
        },
        {
          content: "",
          animation: "blink",
          params: {
            speed: 1,
            color: "#ff00ff",
            fontSize: "32px",
            position: "bottom"
          }
        }
      ],
      transitions: {
        interval: {
          min: 2000,
          max: 10000
        },
        type: "random",
        autoMode: true,
        defaultTransition: "fade"
      },
      keyboard: {
        enabled: true,
        customMappings: {}
      }
    };
  }

  /**
   * 設定をLocalStorageに保存
   */
  saveConfig(config) {
    try {
      const configString = JSON.stringify(config);
      localStorage.setItem(this.storageKey, configString);
      console.log('Config saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }

  /**
   * LocalStorageから設定を読み込み
   */
  loadConfig() {
    try {
      const configString = localStorage.getItem(this.storageKey);
      if (configString) {
        const config = JSON.parse(configString);
        console.log('Config loaded successfully');
        return this.mergeWithDefaults(config);
      }
      console.log('No saved config found, using defaults');
      return this.defaultConfig;
    } catch (error) {
      console.error('Failed to load config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * 読み込んだ設定とデフォルト設定をマージ（新しいフィールド対応）
   */
  mergeWithDefaults(config) {
    return {
      ...this.defaultConfig,
      ...config,
      videos: config.videos || this.defaultConfig.videos,
      texts: config.texts || this.defaultConfig.texts,
      transitions: {
        ...this.defaultConfig.transitions,
        ...(config.transitions || {})
      },
      keyboard: {
        ...this.defaultConfig.keyboard,
        ...(config.keyboard || {})
      }
    };
  }

  /**
   * 設定をJSON形式でエクスポート
   */
  exportConfig(config) {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `youtuvj2_config_${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    console.log('Config exported successfully');
  }

  /**
   * JSONファイルから設定をインポート
   */
  importConfig(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          const mergedConfig = this.mergeWithDefaults(config);
          resolve(mergedConfig);
          console.log('Config imported successfully');
        } catch (error) {
          console.error('Failed to parse config file:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('Failed to read config file:', error);
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  /**
   * 設定をデフォルトにリセット
   */
  resetToDefault() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Config reset to default');
      return this.defaultConfig;
    } catch (error) {
      console.error('Failed to reset config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * YouTube URLからビデオIDを抽出
   */
  extractVideoId(url) {
    if (!url) return null;

    // 様々なYouTube URL形式に対応
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * 設定の妥当性チェック
   */
  validateConfig(config) {
    const errors = [];

    // 動画URLのチェック
    if (config.videos) {
      config.videos.forEach((video, index) => {
        if (video.url && !this.extractVideoId(video.url)) {
          errors.push(`Video ${index + 1}: Invalid YouTube URL`);
        }
      });
    }

    // テキスト設定のチェック
    if (config.texts) {
      config.texts.forEach((text, index) => {
        if (text.params) {
          if (text.params.speed < 0 || text.params.speed > 10) {
            errors.push(`Text ${index + 1}: Speed must be between 0 and 10`);
          }
        }
      });
    }

    // 切り替え間隔のチェック
    if (config.transitions) {
      const { min, max } = config.transitions.interval;
      if (min >= max) {
        errors.push('Transition interval: min must be less than max');
      }
      if (min < 1000) {
        errors.push('Transition interval: min must be at least 1000ms');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ConfigManager;
