/**
 * ControlPanel.js
 * 設定パネルUIを管理
 */

class ControlPanel {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.isCollapsed = false;
    this.onChange = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.render();
    this.attachEventListeners();
    this.setupDragging();
  }

  /**
   * パネルをレンダリング
   */
  render() {
    const panelHTML = `
      <div class="control-panel">
        <div class="panel-header">
          <h2>VJ Control</h2>
          <button id="toggle-panel" class="btn-toggle">−</button>
        </div>

        <div class="panel-content">
          <!-- 動画設定セクション -->
          <section class="panel-section">
            <h3>YouTube Videos</h3>
            <div class="video-inputs">
              ${this.renderVideoInputs()}
            </div>
          </section>

          <!-- テキストオーバーレイセクション -->
          <section class="panel-section">
            <h3>Text Overlays</h3>
            <div class="text-inputs">
              ${this.renderTextInputs()}
            </div>
          </section>

          <!-- トランジション設定セクション -->
          <section class="panel-section">
            <h3>Transition Settings</h3>
            <div class="transition-settings">
              ${this.renderTransitionSettings()}
            </div>
          </section>

          <!-- コントロールボタン -->
          <section class="panel-section">
            <h3>Controls</h3>
            <div class="control-buttons">
              <div class="button-group-primary">
                <button id="save-config" class="btn btn-primary">Save</button>
                <button id="load-config" class="btn btn-secondary">Load</button>
              </div>
              <div class="button-group-secondary">
                <button id="export-config" class="btn btn-secondary">Export</button>
                <button id="import-config" class="btn btn-secondary">Import</button>
                <button id="reset-config" class="btn btn-danger">Reset</button>
              </div>
              <input type="file" id="import-file" accept=".json" style="display: none;">
            </div>
          </section>

          <!-- ステータス表示 -->
          <div class="status-bar">
            <span id="status-message">Ready</span>
            <span id="auto-mode-indicator" class="indicator">AUTO</span>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = panelHTML;
  }

  /**
   * 動画入力フィールドをレンダリング
   */
  renderVideoInputs() {
    return this.config.videos.map((video, index) => `
      <div class="input-group">
        <label for="video-${index}">Video ${index + 1}</label>
        <input
          type="text"
          id="video-${index}"
          class="video-url-input"
          data-index="${index}"
          placeholder="https://www.youtube.com/watch?v=..."
          value="${video.url || ''}"
        >
        <button class="btn-test" data-index="${index}">Test</button>
      </div>
    `).join('');
  }

  /**
   * テキスト入力フィールドをレンダリング
   */
  renderTextInputs() {
    return this.config.texts.map((text, index) => `
      <div class="text-input-group">
        <div class="input-group">
          <label for="text-${index}">Text ${index + 1}</label>
          <input
            type="text"
            id="text-${index}"
            class="text-content-input"
            data-index="${index}"
            placeholder="Enter text to display..."
            value="${text.content || ''}"
          >
        </div>

        <div class="text-params">
          <div class="param-group">
            <label for="text-animation-${index}">Animation</label>
            <select id="text-animation-${index}" class="text-animation-select" data-index="${index}">
              <option value="scroll" ${text.animation === 'scroll' ? 'selected' : ''}>Scroll</option>
              <option value="vertical" ${text.animation === 'vertical' ? 'selected' : ''}>Vertical</option>
              <option value="rotate" ${text.animation === 'rotate' ? 'selected' : ''}>Rotate</option>
              <option value="blink" ${text.animation === 'blink' ? 'selected' : ''}>Blink</option>
              <option value="neon" ${text.animation === 'neon' ? 'selected' : ''}>Neon</option>
              <option value="wave" ${text.animation === 'wave' ? 'selected' : ''}>Wave</option>
              <option value="glitch" ${text.animation === 'glitch' ? 'selected' : ''}>⚡ Glitch</option>
              <option value="randomMove" ${text.animation === 'randomMove' ? 'selected' : ''}>🎲 Random Move</option>
              <option value="zoom" ${text.animation === 'zoom' ? 'selected' : ''}>🔍 Zoom Pulse</option>
              <option value="rainbow" ${text.animation === 'rainbow' ? 'selected' : ''}>🌈 Rainbow</option>
              <option value="chaos" ${text.animation === 'chaos' ? 'selected' : ''}>💥 Chaos</option>
              <option value="3dRotate" ${text.animation === '3dRotate' ? 'selected' : ''}>🔄 3D Rotate</option>
              <option value="spiral" ${text.animation === 'spiral' ? 'selected' : ''}>🌀 Spiral</option>
            </select>
          </div>

          <div class="param-group">
            <label for="text-speed-${index}">Speed</label>
            <input
              type="range"
              id="text-speed-${index}"
              class="text-speed-input"
              data-index="${index}"
              min="0.1"
              max="5"
              step="0.1"
              value="${text.params.speed || 1}"
            >
            <span class="value-display">${text.params.speed || 1}</span>
          </div>

          <div class="param-group">
            <label for="text-color-${index}">Color</label>
            <input
              type="color"
              id="text-color-${index}"
              class="text-color-input"
              data-index="${index}"
              value="${text.params.color || '#ffffff'}"
            >
          </div>

          <div class="param-group">
            <label for="text-size-${index}">Size (px)</label>
            <input
              type="number"
              id="text-size-${index}"
              class="text-size-input"
              data-index="${index}"
              min="12"
              max="200"
              value="${parseInt(text.params.fontSize) || 48}"
            >
          </div>

          <div class="param-group">
            <label for="text-position-${index}">Position</label>
            <select id="text-position-${index}" class="text-position-select" data-index="${index}">
              <option value="top" ${text.params.position === 'top' ? 'selected' : ''}>Top</option>
              <option value="center" ${text.params.position === 'center' ? 'selected' : ''}>Center</option>
              <option value="bottom" ${text.params.position === 'bottom' ? 'selected' : ''}>Bottom</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * トランジション設定をレンダリング
   */
  renderTransitionSettings() {
    const { interval, autoMode, defaultTransition } = this.config.transitions;

    return `
      <div class="transition-params">
        <div class="param-group">
          <label for="transition-type">Default Transition</label>
          <select id="transition-type" class="transition-type-select">
            <option value="fade" ${defaultTransition === 'fade' ? 'selected' : ''}>Fade</option>
            <option value="glitch" ${defaultTransition === 'glitch' ? 'selected' : ''}>Glitch</option>
            <option value="slide" ${defaultTransition === 'slide' ? 'selected' : ''}>Slide</option>
          </select>
        </div>

        <div class="param-group">
          <label>
            <input type="checkbox" id="auto-mode" ${autoMode ? 'checked' : ''}>
            Auto Mode
          </label>
        </div>

        <div class="param-group">
          <label for="interval-min">Interval Min (ms)</label>
          <input
            type="number"
            id="interval-min"
            class="interval-input"
            min="1000"
            max="30000"
            step="100"
            value="${interval.min}"
          >
        </div>

        <div class="param-group">
          <label for="interval-max">Interval Max (ms)</label>
          <input
            type="number"
            id="interval-max"
            class="interval-input"
            min="1000"
            max="30000"
            step="100"
            value="${interval.max}"
          >
        </div>
      </div>
    `;
  }

  /**
   * イベントリスナーをアタッチ
   */
  attachEventListeners() {
    // パネルの折りたたみ
    const toggleBtn = document.getElementById('toggle-panel');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.togglePanel());
    }

    // セクションの折りたたみ
    document.querySelectorAll('.panel-section h3').forEach(header => {
      header.addEventListener('click', (e) => {
        const section = e.target.closest('.panel-section');
        section.classList.toggle('collapsed');
      });
    });

    // 動画URL入力
    document.querySelectorAll('.video-url-input').forEach(input => {
      input.addEventListener('change', (e) => this.handleVideoUrlChange(e));
    });

    // テキスト入力
    document.querySelectorAll('.text-content-input').forEach(input => {
      input.addEventListener('input', (e) => this.handleTextChange(e));
    });

    document.querySelectorAll('.text-animation-select').forEach(select => {
      select.addEventListener('change', (e) => this.handleTextParamChange(e));
    });

    document.querySelectorAll('.text-speed-input').forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleTextParamChange(e);
        // 値表示を更新
        const valueDisplay = e.target.nextElementSibling;
        if (valueDisplay) valueDisplay.textContent = e.target.value;
      });
    });

    document.querySelectorAll('.text-color-input, .text-size-input, .text-position-select').forEach(input => {
      input.addEventListener('change', (e) => this.handleTextParamChange(e));
    });

    // トランジション設定
    const transitionTypeSelect = document.getElementById('transition-type');
    if (transitionTypeSelect) {
      transitionTypeSelect.addEventListener('change', (e) => this.handleTransitionChange(e));
    }

    const autoModeCheckbox = document.getElementById('auto-mode');
    if (autoModeCheckbox) {
      autoModeCheckbox.addEventListener('change', (e) => this.handleAutoModeChange(e));
    }

    document.querySelectorAll('.interval-input').forEach(input => {
      input.addEventListener('change', (e) => this.handleIntervalChange(e));
    });

    // コントロールボタン
    this.attachControlButtonListeners();
  }

  /**
   * コントロールボタンのイベントリスナー
   */
  attachControlButtonListeners() {
    const saveBtn = document.getElementById('save-config');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSave());
    }

    const loadBtn = document.getElementById('load-config');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.handleLoad());
    }

    const exportBtn = document.getElementById('export-config');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }

    const importBtn = document.getElementById('import-config');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        document.getElementById('import-file').click();
      });
    }

    const importFile = document.getElementById('import-file');
    if (importFile) {
      importFile.addEventListener('change', (e) => this.handleImport(e));
    }

    const resetBtn = document.getElementById('reset-config');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset());
    }
  }

  /**
   * パネルの折りたたみ切り替え
   */
  togglePanel() {
    this.isCollapsed = !this.isCollapsed;
    const panel = this.container.querySelector('.control-panel');
    const toggleBtn = document.getElementById('toggle-panel');

    if (this.isCollapsed) {
      panel.classList.add('collapsed');
      toggleBtn.textContent = '+';
    } else {
      panel.classList.remove('collapsed');
      toggleBtn.textContent = '−';
    }
  }

  /**
   * ドラッグ機能のセットアップ
   */
  setupDragging() {
    const panel = this.container.querySelector('.control-panel');
    const header = this.container.querySelector('.panel-header');

    if (!panel || !header) return;

    header.addEventListener('mousedown', (e) => {
      // トグルボタンのクリックは無視
      if (e.target.id === 'toggle-panel') return;

      this.isDragging = true;
      const rect = panel.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      panel.style.cursor = 'grabbing';
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      e.preventDefault();

      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;

      // ビューポート内に制限
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;

      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));

      panel.style.left = `${boundedX}px`;
      panel.style.top = `${boundedY}px`;
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        panel.style.cursor = 'move';
        header.style.cursor = 'move';
      }
    });
  }

  /**
   * 動画URL変更ハンドラー
   */
  handleVideoUrlChange(event) {
    const index = parseInt(event.target.dataset.index);
    const url = event.target.value;
    this.config.videos[index].url = url;

    if (this.onChange) {
      this.onChange('video', index, url);
    }
  }

  /**
   * テキスト変更ハンドラー
   */
  handleTextChange(event) {
    const index = parseInt(event.target.dataset.index);
    const content = event.target.value;
    this.config.texts[index].content = content;

    if (this.onChange) {
      this.onChange('text', index, this.config.texts[index]);
    }
  }

  /**
   * テキストパラメータ変更ハンドラー
   */
  handleTextParamChange(event) {
    const index = parseInt(event.target.dataset.index);
    const text = this.config.texts[index];

    // アニメーションタイプ
    const animationSelect = document.getElementById(`text-animation-${index}`);
    if (animationSelect) {
      text.animation = animationSelect.value;
    }

    // パラメータ
    const speedInput = document.getElementById(`text-speed-${index}`);
    const colorInput = document.getElementById(`text-color-${index}`);
    const sizeInput = document.getElementById(`text-size-${index}`);
    const positionSelect = document.getElementById(`text-position-${index}`);

    if (speedInput) text.params.speed = parseFloat(speedInput.value);
    if (colorInput) text.params.color = colorInput.value;
    if (sizeInput) text.params.fontSize = `${sizeInput.value}px`;
    if (positionSelect) text.params.position = positionSelect.value;

    if (this.onChange) {
      this.onChange('text', index, text);
    }
  }

  /**
   * トランジション変更ハンドラー
   */
  handleTransitionChange(event) {
    this.config.transitions.defaultTransition = event.target.value;

    if (this.onChange) {
      this.onChange('transition', null, this.config.transitions);
    }
  }

  /**
   * オートモード変更ハンドラー
   */
  handleAutoModeChange(event) {
    this.config.transitions.autoMode = event.target.checked;

    const indicator = document.getElementById('auto-mode-indicator');
    if (indicator) {
      indicator.textContent = event.target.checked ? 'AUTO' : 'MANUAL';
      indicator.className = event.target.checked ? 'indicator active' : 'indicator';
    }

    if (this.onChange) {
      this.onChange('autoMode', null, event.target.checked);
    }
  }

  /**
   * インターバル変更ハンドラー
   */
  handleIntervalChange() {
    const minInput = document.getElementById('interval-min');
    const maxInput = document.getElementById('interval-max');

    if (minInput && maxInput) {
      this.config.transitions.interval.min = parseInt(minInput.value);
      this.config.transitions.interval.max = parseInt(maxInput.value);

      if (this.onChange) {
        this.onChange('interval', null, this.config.transitions.interval);
      }
    }
  }

  /**
   * 保存ハンドラー
   */
  handleSave() {
    if (this.onChange) {
      this.onChange('save', null, null);
    }
    this.showStatus('Configuration saved!', 'success');
  }

  /**
   * 読み込みハンドラー
   */
  handleLoad() {
    if (this.onChange) {
      this.onChange('load', null, null);
    }
    this.showStatus('Configuration loaded!', 'success');
  }

  /**
   * エクスポートハンドラー
   */
  handleExport() {
    if (this.onChange) {
      this.onChange('export', null, null);
    }
    this.showStatus('Configuration exported!', 'success');
  }

  /**
   * インポートハンドラー
   */
  async handleImport(event) {
    const file = event.target.files[0];
    if (file) {
      if (this.onChange) {
        this.onChange('import', null, file);
      }
      event.target.value = ''; // リセット
    }
  }

  /**
   * リセットハンドラー
   */
  handleReset() {
    if (confirm('Reset all settings to default?')) {
      if (this.onChange) {
        this.onChange('reset', null, null);
      }
      this.showStatus('Configuration reset!', 'success');
    }
  }

  /**
   * ステータスメッセージを表示
   */
  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `status-${type}`;

      setTimeout(() => {
        statusEl.textContent = 'Ready';
        statusEl.className = '';
      }, 3000);
    }
  }

  /**
   * 変更コールバックを設定
   */
  setOnChange(callback) {
    this.onChange = callback;
  }

  /**
   * 現在アクティブな動画を更新
   */
  setActiveVideo(index) {
    document.querySelectorAll('.input-group').forEach((group, i) => {
      if (i === index) {
        group.classList.add('active');
      } else {
        group.classList.remove('active');
      }
    });
  }

  /**
   * テキストのアクティブ状態を更新
   */
  setTextActive(index, isActive) {
    const textGroups = document.querySelectorAll('.text-input-group');
    if (textGroups[index]) {
      if (isActive) {
        textGroups[index].classList.add('active');
      } else {
        textGroups[index].classList.remove('active');
      }
    }
  }

  /**
   * すべてのテキストのアクティブ状態を更新
   */
  updateTextStates(textStates) {
    textStates.forEach((isActive, index) => {
      this.setTextActive(index, isActive);
    });
  }

  /**
   * パネルを更新
   */
  updatePanel(config) {
    this.config = config;
    this.render();
    this.attachEventListeners();
    this.setupDragging();
  }
}

export default ControlPanel;
