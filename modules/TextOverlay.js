/**
 * TextOverlay.js
 * テキストオーバーレイとアニメーションを管理
 */

class TextOverlay {
  constructor(container) {
    this.container = container;
    this.textElements = [];
    this.animationFrames = [];
    this.isAnimating = [];
    this.randomOffsets = []; // ランダムオフセット用

    this.initializeTextLayers();
  }

  /**
   * テキストレイヤーの初期化
   */
  initializeTextLayers() {
    for (let i = 0; i < 3; i++) {
      const textEl = document.createElement('div');
      textEl.className = `text-overlay text-layer-${i}`;
      textEl.style.display = 'none';
      this.container.appendChild(textEl);

      this.textElements[i] = textEl;
      this.isAnimating[i] = false;

      // 各テキストにユニークなランダムオフセット
      this.randomOffsets[i] = {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        scale: Math.random() * Math.PI * 2
      };
    }
  }

  /**
   * スムーズなイージング関数
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * ランダムな浮遊を計算
   */
  calculateFloating(time, offsetX, offsetY, amplitude = 15) {
    const x = Math.sin(time + offsetX) * amplitude;
    const y = Math.cos(time * 0.7 + offsetY) * amplitude;
    return { x, y };
  }

  /**
   * 派手な浮遊を計算（より大きな動き）
   */
  calculateDynamicFloating(time, offsetX, offsetY, amplitude = 80) {
    // 複数の波を重ねて複雑でダイナミックな動きに
    const x = Math.sin(time + offsetX) * amplitude +
              Math.sin(time * 2.3 + offsetY) * (amplitude * 0.4) +
              Math.cos(time * 0.5) * (amplitude * 0.3);
    const y = Math.cos(time * 0.7 + offsetY) * amplitude +
              Math.cos(time * 1.8 + offsetX) * (amplitude * 0.4) +
              Math.sin(time * 0.3) * (amplitude * 0.3);
    return { x, y };
  }

  /**
   * テキストを追加/更新
   */
  addText(index, content, animation, params = {}) {
    if (index < 0 || index >= this.textElements.length) {
      console.warn(`Invalid text index: ${index}`);
      return;
    }

    const textEl = this.textElements[index];
    textEl.textContent = content;

    // パラメータを適用
    this.applyTextParams(index, params);

    if (content) {
      textEl.style.display = 'block';
      this.setAnimation(index, animation, params);
    } else {
      textEl.style.display = 'none';
      this.stopAnimation(index);
    }
  }

  /**
   * テキストパラメータを適用
   */
  applyTextParams(index, params) {
    const textEl = this.textElements[index];

    if (params.fontSize) {
      textEl.style.fontSize = params.fontSize;
    }
    if (params.color) {
      textEl.style.color = params.color;
    }
    if (params.position) {
      this.setPosition(index, params.position);
    }
  }

  /**
   * テキスト位置を設定
   */
  setPosition(index, position) {
    const textEl = this.textElements[index];

    // 既存の位置クラスを削除
    textEl.classList.remove('pos-top', 'pos-center', 'pos-bottom');

    switch (position) {
      case 'top':
        textEl.classList.add('pos-top');
        break;
      case 'center':
        textEl.classList.add('pos-center');
        break;
      case 'bottom':
        textEl.classList.add('pos-bottom');
        break;
    }
  }

  /**
   * テキスト内容を更新
   */
  updateText(index, content) {
    if (index < 0 || index >= this.textElements.length) {
      console.warn(`Invalid text index: ${index}`);
      return;
    }

    this.textElements[index].textContent = content;
  }

  /**
   * テキストの表示/非表示を切り替え
   */
  toggleText(index) {
    if (index < 0 || index >= this.textElements.length) {
      console.warn(`Invalid text index: ${index}`);
      return false;
    }

    const textEl = this.textElements[index];
    const isNowVisible = textEl.style.display === 'none';

    if (isNowVisible) {
      textEl.style.display = 'block';
      // アニメーションを再開
      const animation = textEl.dataset.animation;
      if (animation) {
        this.setAnimation(index, animation, JSON.parse(textEl.dataset.params || '{}'));
      }
    } else {
      textEl.style.display = 'none';
      this.stopAnimation(index);
    }

    return isNowVisible;
  }

  /**
   * テキストが表示されているか確認
   */
  isTextVisible(index) {
    if (index < 0 || index >= this.textElements.length) {
      return false;
    }
    const textEl = this.textElements[index];
    return textEl && textEl.style.display !== 'none';
  }

  /**
   * アニメーションを設定
   */
  setAnimation(index, type, params = {}) {
    if (index < 0 || index >= this.textElements.length) {
      console.warn(`Invalid text index: ${index}`);
      return;
    }

    // 既存のアニメーションを停止
    this.stopAnimation(index);
    // 前のスタイルをリセット（残留シャドウや変形を防ぐ）
    this.resetAnimationStyles(index);

    const textEl = this.textElements[index];
    textEl.dataset.animation = type;
    textEl.dataset.params = JSON.stringify(params);

    // アニメーションクラスをリセット
    textEl.className = `text-overlay text-layer-${index}`;

    switch (type) {
      case 'scroll':
        this.startScrollAnimation(index, params);
        break;
      case 'vertical':
        this.startVerticalAnimation(index, params);
        break;
      case 'rotate':
        this.startRotateAnimation(index, params);
        break;
      case 'blink':
        this.startBlinkAnimation(index, params);
        break;
      case 'neon':
        this.startNeonAnimation(index, params);
        break;
      case 'wave':
        this.startWaveAnimation(index, params);
        break;
      case 'glitch':
        this.startGlitchAnimation(index, params);
        break;
      case 'randomMove':
        this.startRandomMoveAnimation(index, params);
        break;
      case 'zoom':
        this.startZoomAnimation(index, params);
        break;
      case 'rainbow':
        this.startRainbowAnimation(index, params);
        break;
      case 'chaos':
        this.startChaosAnimation(index, params);
        break;
      case '3dRotate':
        this.start3DRotateAnimation(index, params);
        break;
      case 'spiral':
        this.startSpiralAnimation(index, params);
        break;
      default:
        console.warn(`Unknown animation type: ${type}`);
    }
  }

  /**
   * 横スクロールアニメーション（派手な動き）
   */
  startScrollAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let position = window.innerWidth;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += 0.03 * speed;
      position -= speed * 3;

      if (position < -textEl.offsetWidth) {
        position = window.innerWidth;
      }

      // 派手な浮遊を追加
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 60);
      const rotation = Math.sin(time + offsets.rotation) * 15;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.3;

      textEl.style.transform = `translate(${position}px, ${floating.y}px) rotate(${rotation}deg) scale(${scale})`;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * 縦移動アニメーション（派手な動き）
   */
  startVerticalAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let position = window.innerHeight;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += 0.03 * speed;
      position -= speed * 2.5;

      if (position < -textEl.offsetHeight) {
        position = window.innerHeight;
      }

      // 派手な浮遊を追加
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 80);
      const rotation = Math.sin(time * 0.5 + offsets.rotation) * 20;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.4;

      textEl.style.transform = `translate(${floating.x}px, ${position}px) rotate(${rotation}deg) scale(${scale})`;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * 回転アニメーション（派手な動き）
   */
  startRotateAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let rotation = 0;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += 0.04 * speed;
      rotation += speed * 2;

      // 派手な浮遊する動き
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 100);
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.5;

      textEl.style.transform = `translate(${floating.x}px, ${floating.y}px) rotate(${rotation}deg) scale(${scale})`;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * 点滅アニメーション（派手な動き）
   */
  startBlinkAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.06;

      // 派手な浮遊
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 70);
      const rotation = Math.sin(time * 0.5 + offsets.rotation) * 25;
      const scale = 1 + Math.sin(time * 1.5 + offsets.scale) * 0.4;

      // スムーズな点滅（sin波を使用）
      const opacity = (Math.sin(time * 3) + 1) / 2; // 0-1の範囲

      textEl.style.transform = `translate(${floating.x}px, ${floating.y}px) rotate(${rotation}deg) scale(${scale})`;
      textEl.style.opacity = opacity.toString();

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * ネオンエフェクトアニメーション（派手な動き）
   */
  startNeonAnimation(index, params) {
    const textEl = this.textElements[index];
    const color = params.color || '#ffffff';
    const speed = params.speed || 1;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.05;

      // 派手な浮遊
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 90);
      const rotation = Math.sin(time * 0.7 + offsets.rotation) * 30;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.35;

      // 強烈なネオンパルス
      const intensity = (Math.sin(time * 1.5 + offsets.scale) + 1) / 2; // 0-1の範囲
      const blur = intensity * 40 + 20;

      textEl.style.transform = `translate(${floating.x}px, ${floating.y}px) rotate(${rotation}deg) scale(${scale})`;
      textEl.style.textShadow = `
        0 0 ${blur}px ${color},
        0 0 ${blur * 2}px ${color},
        0 0 ${blur * 3}px ${color},
        0 0 ${blur * 4}px ${color}
      `;
      textEl.style.opacity = 0.8 + intensity * 0.2;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * 波アニメーション（派手な動き）
   */
  startWaveAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.07;

      // 複数の大きな波を重ねてダイナミックに
      const y = Math.sin(time + offsets.y) * 80 + Math.sin(time * 1.5 + offsets.x) * 40 + Math.cos(time * 2.5) * 20;
      const x = Math.cos(time * 0.8 + offsets.x) * 60 + Math.sin(time * 1.2) * 30;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.6;
      const rotation = Math.sin(time * 0.7 + offsets.rotation) * 35;

      textEl.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * アニメーションで付与したインラインスタイルをリセット
   */
  resetAnimationStyles(index) {
    const textEl = this.textElements[index];
    if (!textEl) return;

    textEl.style.transform = '';
    textEl.style.opacity = '';
    textEl.style.textShadow = '';
    textEl.style.left = '';
    textEl.style.top = '';
    textEl.style.filter = '';
    textEl.style.perspective = '';
    textEl.style.transformStyle = '';
  }

  /**
   * グリッチアニメーション（より洗練された）
   */
  startGlitchAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.05;

      // 浮遊する動きをベースに
      const baseFloating = this.calculateFloating(time, offsets.x, offsets.y, 10);

      // ランダムなグリッチ発生（頻度を下げてより洗練）
      if (Math.random() < 0.05 * speed) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        const skewX = (Math.random() - 0.5) * 15;
        const rotation = (Math.random() - 0.5) * 10;

        textEl.style.transform = `translate(${baseFloating.x + offsetX}px, ${baseFloating.y + offsetY}px) skew(${skewX}deg) rotate(${rotation}deg)`;
        textEl.style.opacity = Math.random() > 0.3 ? '1' : '0.7';

        // より洗練されたRGB分離エフェクト
        const offset = Math.random() * 3;
        textEl.style.textShadow = `
          ${offset}px 0 0 rgba(255, 0, 0, 0.5),
          ${-offset}px 0 0 rgba(0, 255, 255, 0.5),
          0 0 10px rgba(255, 255, 255, 0.3)
        `;
      } else {
        const rotation = Math.sin(time + offsets.rotation) * 2;
        textEl.style.transform = `translate(${baseFloating.x}px, ${baseFloating.y}px) rotate(${rotation}deg)`;
        textEl.style.opacity = '1';
        textEl.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
      }

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * ランダム移動アニメーション（派手な動き）
   */
  startRandomMoveAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let targetX = Math.random() * (window.innerWidth * 0.9);
    let targetY = Math.random() * (window.innerHeight * 0.9);
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += 0.04 * speed;

      // 目標位置に近づく（イージング適用）
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50) {
        // 新しい目標位置を設定（より広範囲に）
        targetX = 50 + Math.random() * (window.innerWidth - 100);
        targetY = 50 + Math.random() * (window.innerHeight - 100);
      }

      // より速いイージング
      currentX += dx * 0.05 * speed;
      currentY += dy * 0.05 * speed;

      // 派手な浮遊を追加
      const microFloat = this.calculateDynamicFloating(time, offsets.x, offsets.y, 40);
      const rotation = Math.sin(time * 1.5 + offsets.rotation) * 45;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.5;

      textEl.style.left = `${currentX + microFloat.x}px`;
      textEl.style.top = `${currentY + microFloat.y}px`;
      textEl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * ズームパルスアニメーション（派手な動き）
   */
  startZoomAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.08;

      // 派手な浮遊
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 100);

      // 大きなズームとパルス
      const scale = 1 + Math.sin(time + offsets.scale) * 0.9;
      const rotation = Math.sin(time * 0.8 + offsets.rotation) * 40;

      textEl.style.transform = `translate(${floating.x}px, ${floating.y}px) scale(${scale}) rotate(${rotation}deg)`;
      textEl.style.opacity = 0.6 + Math.sin(time * 1.2) * 0.4;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * 虹色アニメーション（派手な動き）
   */
  startRainbowAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let hue = 0;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.06;
      hue = (hue + speed * 4) % 360;

      // 派手な浮遊
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 110);
      const rotation = Math.sin(time * 1.2 + offsets.rotation) * 50;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.7;

      textEl.style.transform = `translate(${floating.x}px, ${floating.y}px) rotate(${rotation}deg) scale(${scale})`;
      textEl.style.color = `hsl(${hue}, 100%, 60%)`;
      textEl.style.textShadow = `
        0 0 20px hsl(${hue}, 100%, 60%),
        0 0 40px hsl(${hue}, 100%, 60%),
        0 0 60px hsl(${hue}, 100%, 60%),
        0 0 80px hsl(${(hue + 60) % 360}, 100%, 60%)
      `;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * カオスアニメーション（超派手な複雑な動き）
   */
  startChaosAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let time = 0;
    let hue = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      time += speed * 0.08;
      hue = (hue + speed * 6) % 360;

      // 超複雑なsin/cos波を組み合わせた動き
      const x = Math.sin(time + offsets.x) * 200 +
                Math.sin(time * 2.3 + offsets.y) * 80 +
                Math.cos(time * 0.7) * 50 +
                Math.sin(time * 4.1) * 30;
      const y = Math.cos(time * 0.7 + offsets.y) * 180 +
                Math.sin(time * 1.7 + offsets.x) * 70 +
                Math.cos(time * 3) * 40 +
                Math.sin(time * 5.2) * 25;
      const rotation = Math.sin(time * 0.8 + offsets.rotation) * 360 +
                       Math.cos(time * 1.5) * 180;
      const scale = 1 + Math.sin(time * 2 + offsets.scale) * 0.8 +
                    Math.cos(time * 3.5) * 0.4;

      // グリッチエフェクト
      const glitch = Math.random() < 0.08 ? (Math.random() - 0.5) * 25 : 0;

      textEl.style.transform = `
        translate(${x + glitch}px, ${y + glitch}px)
        rotate(${rotation}deg)
        scale(${scale})
      `;

      textEl.style.color = `hsl(${hue}, 100%, ${50 + Math.sin(time * 5) * 20}%)`;

      // 超派手なシャドウ
      const shadowIntensity = 20 + Math.sin(time * 3) * 30;
      textEl.style.textShadow = `
        0 0 ${shadowIntensity}px hsl(${hue}, 100%, 60%),
        0 0 ${shadowIntensity * 2}px hsl(${(hue + 60) % 360}, 100%, 60%),
        0 0 ${shadowIntensity * 3}px hsl(${(hue + 120) % 360}, 100%, 60%),
        ${Math.sin(time * 4) * 10}px 0 0 rgba(255, 0, 0, 0.5),
        ${-Math.cos(time * 4) * 10}px 0 0 rgba(0, 255, 255, 0.5)
      `;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * 3D回転アニメーション（派手な動き）
   */
  start3DRotateAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let time = 0;
    const offsets = this.randomOffsets[index];

    textEl.style.perspective = '1000px';
    textEl.style.transformStyle = 'preserve-3d';

    const animate = () => {
      time += speed * 0.06;

      // 派手な浮遊
      const floating = this.calculateDynamicFloating(time, offsets.x, offsets.y, 120);

      const rotateX = Math.sin(time + offsets.x) * 180 + Math.cos(time * 2) * 60;
      const rotateY = Math.cos(time * 0.7 + offsets.y) * 180 + Math.sin(time * 1.5) * 60;
      const rotateZ = time * 50 + Math.sin(time * 2) * 90;
      const scale = 1 + Math.sin(time * 3 + offsets.scale) * 0.6;

      textEl.style.transform = `
        translate(${floating.x}px, ${floating.y}px)
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        rotateZ(${rotateZ}deg)
        scale(${scale})
      `;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * スパイラルアニメーション（派手な動き）
   */
  startSpiralAnimation(index, params) {
    const textEl = this.textElements[index];
    const speed = params.speed || 1;
    let angle = 0;
    let time = 0;
    const offsets = this.randomOffsets[index];

    const animate = () => {
      angle += speed * 0.1;
      time += speed * 0.05;

      // 大きく変化する半径
      const radiusBase = (Math.sin(angle * 0.3 + offsets.x) + 1) * 250;
      const radiusPulse = Math.sin(time * 2 + offsets.y) * 80 + Math.cos(time * 3) * 40;
      const radius = radiusBase + radiusPulse;

      const x = window.innerWidth / 2 + Math.cos(angle + offsets.x) * radius;
      const y = window.innerHeight / 2 + Math.sin(angle + offsets.y) * radius;

      // 激しい回転とスケール
      const rotation = angle * 57.3 + Math.sin(time * 1.5 + offsets.rotation) * 90;
      const scale = 1 + Math.sin(time * 3 + offsets.scale) * 0.7;

      textEl.style.left = `${x}px`;
      textEl.style.top = `${y}px`;
      textEl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;

      if (this.isAnimating[index]) {
        this.animationFrames[index] = requestAnimationFrame(animate);
      }
    };

    this.isAnimating[index] = true;
    animate();
  }

  /**
   * アニメーションを停止
   */
  stopAnimation(index) {
    this.isAnimating[index] = false;

    if (this.animationFrames[index]) {
      if (typeof this.animationFrames[index] === 'number' && this.animationFrames[index] > 1000) {
        // requestAnimationFrameのID
        cancelAnimationFrame(this.animationFrames[index]);
      } else {
        // setIntervalのID
        clearInterval(this.animationFrames[index]);
      }
      this.animationFrames[index] = null;
    }
  }

  /**
   * 全てのテキストをクリア
   */
  clearAll() {
    this.textElements.forEach((textEl, index) => {
      this.stopAnimation(index);
      textEl.style.display = 'none';
      textEl.textContent = '';
      textEl.style.transform = '';
      textEl.style.opacity = '1';
      textEl.style.textShadow = '';
    });
  }

  /**
   * 全てのアニメーションをリセット
   */
  resetAllAnimations() {
    this.textElements.forEach((textEl, index) => {
      if (textEl.dataset.animation) {
        const animation = textEl.dataset.animation;
        const params = JSON.parse(textEl.dataset.params || '{}');
        this.setAnimation(index, animation, params);
      }
    });
  }

  /**
   * クリーンアップ
   */
  destroy() {
    this.textElements.forEach((_, index) => {
      this.stopAnimation(index);
    });
    this.textElements = [];
    this.animationFrames = [];
    this.isAnimating = [];
  }
}

export default TextOverlay;
