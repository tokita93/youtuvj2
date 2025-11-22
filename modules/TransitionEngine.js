/**
 * TransitionEngine.js
 * 動画切り替え時のトランジションエフェクトを管理
 */

class TransitionEngine {
  constructor(container) {
    this.container = container;
    this.transitions = {};
    this.defaultTransition = 'fade';
    this.effectOverlay = null;

    this.registerDefaultTransitions();
    this.createEffectOverlay();
  }

  /**
   * エフェクト用のオーバーレイを作成
   */
  createEffectOverlay() {
    this.effectOverlay = document.createElement('div');
    this.effectOverlay.id = 'effect-overlay';
    this.effectOverlay.className = 'effect-overlay';
    this.container.appendChild(this.effectOverlay);
  }

  /**
   * デフォルトのトランジションを登録
   */
  registerDefaultTransitions() {
    // フェードトランジション
    this.registerTransition('fade', (fromEl, toEl) => {
      return new Promise((resolve) => {
        if (fromEl) fromEl.style.opacity = '1';
        if (toEl) {
          toEl.style.opacity = '0';
          toEl.style.display = 'block';
        }

        requestAnimationFrame(() => {
          if (fromEl) fromEl.style.transition = 'opacity 0.5s ease';
          if (toEl) toEl.style.transition = 'opacity 0.5s ease';

          if (fromEl) fromEl.style.opacity = '0';
          if (toEl) toEl.style.opacity = '1';

          setTimeout(() => {
            if (fromEl) fromEl.style.display = 'none';
            if (fromEl) fromEl.style.transition = '';
            if (toEl) toEl.style.transition = '';
            resolve();
          }, 500);
        });
      });
    });

    // グリッチトランジション
    this.registerTransition('glitch', (fromEl, toEl) => {
      return new Promise((resolve) => {
        if (toEl) toEl.style.display = 'block';

        let glitchCount = 0;
        const maxGlitches = 8;
        const glitchInterval = setInterval(() => {
          if (fromEl) fromEl.style.opacity = Math.random() > 0.5 ? '1' : '0';
          if (toEl) toEl.style.opacity = Math.random() > 0.5 ? '1' : '0';
          if (fromEl) fromEl.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;

          glitchCount++;
          if (glitchCount >= maxGlitches) {
            clearInterval(glitchInterval);
            if (fromEl) {
              fromEl.style.display = 'none';
              fromEl.style.opacity = '1';
              fromEl.style.transform = '';
            }
            if (toEl) {
              toEl.style.opacity = '1';
              toEl.style.transform = '';
            }
            resolve();
          }
        }, 50);
      });
    });

    // スライドトランジション
    this.registerTransition('slide', (fromEl, toEl) => {
      return new Promise((resolve) => {
        const direction = Math.random() > 0.5 ? 1 : -1;

        if (toEl) {
          toEl.style.display = 'block';
          toEl.style.transform = `translateX(${direction * 100}%)`;
          toEl.style.transition = 'transform 0.6s ease-out';
        }

        if (fromEl) {
          fromEl.style.transition = 'transform 0.6s ease-out';
          fromEl.style.transform = `translateX(${-direction * 100}%)`;
        }

        requestAnimationFrame(() => {
          if (toEl) toEl.style.transform = 'translateX(0)';

          setTimeout(() => {
            if (fromEl) {
              fromEl.style.display = 'none';
              fromEl.style.transform = '';
              fromEl.style.transition = '';
            }
            if (toEl) {
              toEl.style.transform = '';
              toEl.style.transition = '';
            }
            resolve();
          }, 600);
        });
      });
    });
  }

  /**
   * トランジションを登録
   */
  registerTransition(name, transitionFunction) {
    this.transitions[name] = transitionFunction;
  }

  /**
   * トランジションを実行
   */
  async executeTransition(type, fromIndex, toIndex) {
    const transitionType = type || this.defaultTransition;
    const transition = this.transitions[transitionType];

    if (!transition) {
      console.warn(`Transition type '${transitionType}' not found, using default`);
      return this.executeTransition(this.defaultTransition, fromIndex, toIndex);
    }

    const fromEl = this.container.querySelector(`#player-${fromIndex}`);
    const toEl = this.container.querySelector(`#player-${toIndex}`);

    await transition(fromEl, toEl);
  }

  /**
   * デフォルトトランジションを設定
   */
  setDefaultTransition(type) {
    if (this.transitions[type]) {
      this.defaultTransition = type;
      console.log(`Default transition set to: ${type}`);
    } else {
      console.warn(`Transition type '${type}' not found`);
    }
  }

  /**
   * グリッチエフェクトをトリガー
   */
  triggerGlitchEffect() {
    this.effectOverlay.className = 'effect-overlay glitch-effect';
    setTimeout(() => {
      this.effectOverlay.className = 'effect-overlay';
    }, 500);
  }

  /**
   * フラッシュエフェクトをトリガー
   */
  triggerFlashEffect() {
    this.effectOverlay.className = 'effect-overlay flash-effect';
    setTimeout(() => {
      this.effectOverlay.className = 'effect-overlay';
    }, 200);
  }

  /**
   * カラーシフトエフェクトをトリガー
   */
  triggerColorShift() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    this.effectOverlay.style.backgroundColor = randomColor;
    this.effectOverlay.className = 'effect-overlay color-shift-effect';

    setTimeout(() => {
      this.effectOverlay.className = 'effect-overlay';
      this.effectOverlay.style.backgroundColor = '';
    }, 300);
  }

  /**
   * ブラックアウトエフェクト
   */
  triggerBlackout(duration = 1000) {
    return new Promise((resolve) => {
      this.effectOverlay.style.backgroundColor = '#000000';
      this.effectOverlay.className = 'effect-overlay blackout-effect active';

      setTimeout(() => {
        this.effectOverlay.className = 'effect-overlay';
        this.effectOverlay.style.backgroundColor = '';
        resolve();
      }, duration);
    });
  }

  /**
   * ホワイトアウトエフェクト
   */
  triggerWhiteout(duration = 1000) {
    return new Promise((resolve) => {
      this.effectOverlay.style.backgroundColor = '#ffffff';
      this.effectOverlay.className = 'effect-overlay whiteout-effect active';

      setTimeout(() => {
        this.effectOverlay.className = 'effect-overlay';
        this.effectOverlay.style.backgroundColor = '';
        resolve();
      }, duration);
    });
  }

  /**
   * カスタムトランジションを追加
   */
  addCustomTransition(name, transitionFunction) {
    this.registerTransition(name, transitionFunction);
    console.log(`Custom transition '${name}' added`);
  }

  /**
   * 利用可能なトランジションのリストを取得
   */
  getAvailableTransitions() {
    return Object.keys(this.transitions);
  }

  /**
   * ランダムなトランジションタイプを取得
   */
  getRandomTransition() {
    const types = this.getAvailableTransitions();
    return types[Math.floor(Math.random() * types.length)];
  }
}

export default TransitionEngine;
