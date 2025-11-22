/**
 * VideoManager.js
 * YouTube動画の読み込み・切り替え・再生管理を担当
 */

class VideoManager {
  constructor(container, configManager) {
    this.container = container;
    this.configManager = configManager;
    this.players = [];
    this.currentIndex = 0;
    this.isYouTubeAPIReady = false;
    this.videoConfigs = [];
    this.onSwitchCallbacks = [];

    this.initYouTubeAPI();
  }

  /**
   * YouTube IFrame APIの初期化
   */
  initYouTubeAPI() {
    // YouTube APIスクリプトが既に読み込まれているかチェック
    if (window.YT && window.YT.Player) {
      this.isYouTubeAPIReady = true;
      return;
    }

    // グローバルコールバックを設定
    window.onYouTubeIframeAPIReady = () => {
      this.isYouTubeAPIReady = true;
      console.log('YouTube IFrame API ready');

      // API準備完了後、動画を初期化
      if (this.videoConfigs.length > 0) {
        this.loadVideos(this.videoConfigs);
      }
    };

    // YouTube APIスクリプトを読み込み
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  /**
   * 動画プレーヤーの初期化
   */
  async initialize(videoConfigs) {
    this.videoConfigs = videoConfigs;

    if (this.isYouTubeAPIReady) {
      this.loadVideos(videoConfigs);
    }
    // API未準備の場合はonYouTubeIframeAPIReadyで自動的に読み込まれる
  }

  /**
   * 4つの動画をロード
   */
  loadVideos(videoConfigs) {
    // 既存のプレーヤーをクリア
    this.players.forEach(player => {
      if (player) player.destroy();
    });
    this.players = [];

    // 動画プレーヤーのみを削除（テキストやエフェクトは保持）
    const existingPlayers = this.container.querySelectorAll('.video-player');
    existingPlayers.forEach(player => player.remove());

    // 各動画のプレーヤーを作成
    videoConfigs.forEach((config, index) => {
      const videoId = this.configManager.extractVideoId(config.url);

      // プレーヤー用のdivを作成
      const playerDiv = document.createElement('div');
      playerDiv.id = `player-${index}`;
      playerDiv.className = 'video-player';
      playerDiv.style.display = index === 0 ? 'block' : 'none';

      // エフェクトオーバーレイやテキストの前に挿入（z-indexを保つため）
      const firstOverlay = this.container.querySelector('.effect-overlay, .text-overlay');
      if (firstOverlay) {
        this.container.insertBefore(playerDiv, firstOverlay);
      } else {
        this.container.appendChild(playerDiv);
      }

      if (videoId) {
        const player = new YT.Player(`player-${index}`, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            loop: 1,
            playlist: videoId // loopを有効にするために必要
          },
          events: {
            onReady: (event) => this.onPlayerReady(event, index),
            onStateChange: (event) => this.onPlayerStateChange(event, index)
          }
        });
        this.players[index] = player;
      } else {
        // 無効なURLの場合はプレースホルダー
        this.players[index] = null;
        playerDiv.innerHTML = `<div class="placeholder">Video ${index + 1}<br>Invalid URL</div>`;
      }
    });
  }

  /**
   * プレーヤー準備完了時の処理
   */
  onPlayerReady(event, index) {
    console.log(`Player ${index} ready`);
    event.target.mute(); // パフォーマンスのためミュート

    // 最初に表示される動画もランダムな位置から開始
    if (index === this.currentIndex) {
      const duration = event.target.getDuration();
      if (duration && duration > 0) {
        const randomPosition = Math.random() * (duration * 0.9);
        event.target.seekTo(randomPosition, true);
        console.log(`Initial video ${index} starts at ${randomPosition.toFixed(1)}s`);
      }
    }

    event.target.playVideo();
  }

  /**
   * プレーヤー状態変更時の処理
   */
  onPlayerStateChange(event, index) {
    // 動画終了時にループ再生
    if (event.data === YT.PlayerState.ENDED) {
      event.target.playVideo();
    }
  }

  /**
   * 特定の動画に切り替え
   */
  switchVideo(index) {
    if (index < 0 || index >= this.players.length) {
      console.warn(`Invalid video index: ${index}`);
      return;
    }

    if (!this.players[index]) {
      console.warn(`Player ${index} not available`);
      return;
    }

    const previousIndex = this.currentIndex;
    this.currentIndex = index;

    // ランダムな位置から再生を開始
    this.seekToRandomPosition(index);

    // 全てのプレーヤーを非表示
    const playerDivs = this.container.querySelectorAll('.video-player');
    playerDivs.forEach((div, i) => {
      div.style.display = i === index ? 'block' : 'none';
    });

    // 切り替えコールバックを実行
    this.onSwitchCallbacks.forEach(callback => {
      callback(previousIndex, index);
    });

    console.log(`Switched to video ${index}`);
  }

  /**
   * 動画をランダムな位置にシーク
   */
  seekToRandomPosition(index) {
    const player = this.players[index];
    if (!player) return;

    try {
      // プレーヤーの状態をチェック
      const playerState = player.getPlayerState();

      // プレーヤーが準備完了している場合のみシーク
      if (playerState !== -1) { // -1 = unstarted
        const duration = player.getDuration();

        if (duration && duration > 0) {
          // 動画の長さの0%〜90%のランダムな位置にシーク
          // （最後の10%は避ける）
          const randomPosition = Math.random() * (duration * 0.9);
          player.seekTo(randomPosition, true);

          console.log(`Seeked video ${index} to ${randomPosition.toFixed(1)}s / ${duration.toFixed(1)}s`);
        }
      }

      // 再生を確実にする
      player.playVideo();
    } catch (error) {
      console.warn(`Failed to seek video ${index}:`, error);
      // エラーが発生しても続行
    }
  }

  /**
   * ランダムな動画に切り替え
   */
  randomSwitch() {
    const availablePlayers = this.players
      .map((player, index) => player ? index : null)
      .filter(index => index !== null && index !== this.currentIndex);

    if (availablePlayers.length === 0) {
      console.warn('No other videos available for random switch');
      return;
    }

    const randomIndex = availablePlayers[
      Math.floor(Math.random() * availablePlayers.length)
    ];

    this.switchVideo(randomIndex);
  }

  /**
   * 次の動画に順番に切り替え
   */
  nextVideo() {
    let nextIndex = (this.currentIndex + 1) % this.players.length;
    let attempts = 0;

    // 有効なプレーヤーを見つけるまでループ
    while (!this.players[nextIndex] && attempts < this.players.length) {
      nextIndex = (nextIndex + 1) % this.players.length;
      attempts++;
    }

    if (this.players[nextIndex]) {
      this.switchVideo(nextIndex);
    } else {
      console.warn('No valid video found for next switch');
    }
  }

  /**
   * 現在の動画インデックスを取得
   */
  getCurrentVideo() {
    return this.currentIndex;
  }

  /**
   * 現在の動画プレーヤーを取得
   */
  getCurrentPlayer() {
    return this.players[this.currentIndex];
  }

  /**
   * 全ての動画をミュート
   */
  muteAll() {
    this.players.forEach(player => {
      if (player && player.mute) {
        player.mute();
      }
    });
  }

  /**
   * 全ての動画をアンミュート（特定の動画のみ）
   */
  unmuteVideo(index) {
    if (this.players[index] && this.players[index].unMute) {
      this.muteAll(); // まず全てミュート
      this.players[index].unMute();
    }
  }

  /**
   * 動画切り替え時のコールバックを登録
   */
  onSwitch(callback) {
    this.onSwitchCallbacks.push(callback);
  }

  /**
   * 特定の動画をリロード
   */
  reloadVideo(index, url) {
    const videoId = this.configManager.extractVideoId(url);
    if (!videoId) {
      console.warn(`Invalid URL for video ${index}`);
      return;
    }

    const player = this.players[index];
    if (player && player.loadVideoById) {
      player.loadVideoById(videoId);
      console.log(`Reloaded video ${index}`);
    }
  }

  /**
   * 全プレーヤーを破棄
   */
  destroy() {
    this.players.forEach(player => {
      if (player && player.destroy) {
        player.destroy();
      }
    });
    this.players = [];
    this.container.innerHTML = '';
  }
}

export default VideoManager;
