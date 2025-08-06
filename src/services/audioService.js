/**
 * 全局音频播放服务
 * 独立于 Vue 组件的音频播放管理
 */
import Hls from 'hls.js';
import eventBus from '../utils/eventBus.js';

class AudioService {
  constructor() {
    this.audio = null;
    this.hls = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 50;
    this.currentTrackIndex = 0;
    this.playlist = [];
    this.playlistInfo = [];
    this.currentTime = 0;
    this.duration = 0;
    this.progress = 0;
    this.randomMode = false;
    this.isHLSSupported = false;
    this.streamingBaseUrl = 'https://hls.wenturc.com';
    this.playlistLoaded = false;
    this.loadingError = null;
    this.hlsRetryCount = 0;
    
    // 成就相关
    this.achievementTriggered = false;
    this.completedTracks = new Set();
    this.musicConnoisseurUnlocked = false;
    
    // 初始化
    this.init();
  }
  
  init() {
    // 创建音频元素
    this.audio = new Audio();
    this.audio.volume = this.volume / 100;
    
    // 绑定音频事件
    this.audio.addEventListener('ended', this.handleTrackEnded.bind(this));
    this.audio.addEventListener('timeupdate', this.updateProgress.bind(this));
    this.audio.addEventListener('loadedmetadata', this.loadMetadata.bind(this));
    this.audio.addEventListener('error', (e) => {
      console.error('❌ 音频播放错误:', e);
      console.error('❌ 音频错误详情:', this.audio.error);
    });
    
    // 初始化 HLS
    this.initializeHLS();
    
    // 加载播放列表
    this.loadPlaylist();
    
    // 加载已完成的歌曲数据
    this.loadCompletedTracks();
    
    // 检查成就
    this.checkMusicConnoisseurAchievement();
    
    console.log('🎵 全局音频服务已初始化');
  }
  
  // 初始化 HLS 支持
  initializeHLS() {
    this.isHLSSupported = Hls.isSupported();
    
    if (this.isHLSSupported) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 300,
        maxMaxBufferLength: 600,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 4,
        fragLoadingRetryDelay: 1000,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000
      });
      
      this.hls.attachMedia(this.audio);
      
      // HLS 事件监听
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('🔗 HLS 已连接到音频元素');
        const currentUrl = this.getCurrentTrack();
        if (currentUrl) {
          console.log('🚀 自动加载 HLS 源:', currentUrl);
          this.hls.loadSource(currentUrl);
        }
      });
      
      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('📋 HLS 清单解析完成');
        const targetDuration = data.levels[0]?.details?.targetduration;
        const segmentCount = data.levels[0]?.details?.fragments?.length;
        
        if (!targetDuration || targetDuration === 0 || !segmentCount || segmentCount === 0) {
          console.error('💥 无效的 HLS 文件，需要重新转换！');
          this.showHLSError('HLS 文件格式无效，请检查音频转换');
          return;
        }
      });
      
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('⚠️ HLS 错误:', data);
        if (data.fatal) {
          this.handleHLSError(data);
        }
      });
      
      console.log('✅ HLS 专业流媒体支持已启用');
    } else {
      console.error('❌ 浏览器不支持 HLS');
      this.showHLSError('浏览器不支持 HLS 流媒体播放');
    }
  }
  
  // 异步加载播放列表
  async loadPlaylist() {
    try {
      console.log('📡 从 HLS 服务器加载播放列表...');
      const response = await fetch(`${this.streamingBaseUrl}/playlist.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.playlist = data.tracks || [];
      this.playlistInfo = this.playlist;
      this.playlistLoaded = true;
      
      if (this.playlist.length > 0) {
        this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        console.log(`选择初始歌曲: ${this.getCurrentTrackName()}`);
      }
      
      console.log(`✅ 成功加载 ${this.playlist.length} 首歌曲`);
      
      // 通知组件更新
      this.emitStateChange();
    } catch (error) {
      console.error('❌ 播放列表加载失败:', error);
      this.loadingError = error.message;
      this.playlist = [];
      this.playlistInfo = [];
      this.emitStateChange();
    }
  }
  
  // 获取当前音轨URL
  getCurrentTrack() {
    if (!this.playlistInfo[this.currentTrackIndex]) return null;
    
    const track = this.playlistInfo[this.currentTrackIndex];
    
    if (this.isHLSSupported && track.hasHLS && track.hlsUrl) {
      return `${this.streamingBaseUrl}${track.hlsUrl}`;
    }
    
    if (track.originalFile) {
      console.error('🚨 只支持 HLS 流媒体播放！');
      this.showHLSError('音频文件需要转换为 HLS 格式');
      return null;
    }
    
    return null;
  }
  
  // 获取当前音轨名称
  getCurrentTrackName() {
    const track = this.playlistInfo[this.currentTrackIndex];
    if (!track) return '未知歌曲';
    
    let title = track.title;
    let artist = track.artist;
    
    if (!title || !artist) {
      const filename = track.filename || track.originalFile || '';
      const nameWithoutExt = filename.replace(/\.(flac|mp3|wav)$/i, '');
      
      if (nameWithoutExt.includes(' - ')) {
        const parts = nameWithoutExt.split(' - ');
        if (!artist) artist = parts[0];
        if (!title) title = parts.slice(1).join(' - ');
      } else {
        if (!title) title = nameWithoutExt;
        if (!artist) artist = '未知艺术家';
      }
    }
    
    return `${title} - ${artist}`;
  }
  
  // 播放/暂停
  togglePlay() {
    if (!this.playlistLoaded) {
      console.warn('⚠️ 播放列表尚未加载完成');
      return;
    }
    
    if (!this.isHLSSupported) {
      this.showHLSError('浏览器不支持 HLS 流媒体播放');
      return;
    }
    
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      console.log('⏸️ 暂停播放');
    } else {
      console.log('▶️ 开始 HLS 流媒体播放:', this.getCurrentTrackName());
      
      const hlsUrl = this.getCurrentTrack();
      if (!hlsUrl) {
        this.showHLSError('没有可用的 HLS 流媒体源');
        return;
      }
      
      // 确保 HLS 源已加载
      if (this.hls && this.audio.src !== hlsUrl) {
        console.log('🔄 重新加载 HLS 源...');
        this.hls.loadSource(hlsUrl);
      }
      
      this.audio.play()
        .then(() => { 
          this.isPlaying = true;
          console.log('✅ HLS 流媒体播放成功');
          
          this.hlsRetryCount = 0;
          
          if (!this.achievementTriggered) {
            eventBus.emit('music-played');
            this.achievementTriggered = true;
          }
        })
        .catch(err => { 
          console.error('❌ HLS 流媒体播放失败:', err);
          this.showHLSError('HLS 流媒体播放失败: ' + err.message);
        });
    }
    
    this.emitStateChange();
  }
  
  // 切换静音
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.emitStateChange();
  }
  
  // 调整音量
  setVolume(volume) {
    this.volume = volume;
    this.audio.volume = this.volume / 100;
    if (this.isMuted && this.volume > 0) {
      this.isMuted = false;
      this.audio.muted = false;
    }
    this.emitStateChange();
  }
  
  // 下一首
  nextTrack() {
    if (!this.playlist || this.playlist.length === 0) {
      console.warn('⚠️ 播放列表为空，无法切换下一首');
      return;
    }
    
    if (this.randomMode) {
      this.currentTrackIndex = this.getRandomTrack();
    } else {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    }
    this.reloadAudio();
  }
  
  // 上一首
  prevTrack() {
    if (!this.playlist || this.playlist.length === 0) {
      console.warn('⚠️ 播放列表为空，无法切换上一首');
      return;
    }
    
    if (this.randomMode) {
      this.currentTrackIndex = this.getRandomTrack();
    } else {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    }
    this.reloadAudio();
  }
  
  // 获取随机音轨
  getRandomTrack() {
    if (!this.playlist || this.playlist.length <= 1) {
      return 0;
    }
    
    const availableTracks = Array.from(
      {length: this.playlist.length},
      (_, i) => i
    ).filter(i => i !== this.currentTrackIndex);
    
    if (availableTracks.length === 0) {
      return 0;
    }
    
    const randomIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
    return randomIndex;
  }
  
  // 切换随机模式
  toggleRandomMode() {
    this.randomMode = !this.randomMode;
    this.emitStateChange();
  }
  
  // 重新加载音频
  reloadAudio() {
    const trackUrl = this.getCurrentTrack();
    if (!trackUrl) {
      console.warn('⚠️ 没有可播放的 HLS 音频源');
      this.showHLSError('没有可用的 HLS 流媒体源');
      return;
    }
    
    if (!this.isHLSSupported || !this.hls) {
      this.showHLSError('HLS 播放器未初始化');
      return;
    }
    
    console.log(`🔄 重新加载 HLS 流媒体: ${this.getCurrentTrackName()}`);
    
    if (this.hls.url) {
      this.hls.stopLoad();
    }
    
    try {
      this.hls.loadSource(trackUrl);
      
      if (this.isPlaying) {
        const playWhenReady = () => {
          this.audio.play().catch(err => { 
            console.error('❌ HLS 重新播放失败:', err);
            this.showHLSError('HLS 重新播放失败: ' + err.message);
          });
        };
        
        this.hls.once(Hls.Events.MANIFEST_PARSED, playWhenReady);
        
        if (this.audio.readyState >= 3) {
          playWhenReady();
        }
      }
    } catch (error) {
      console.error('❌ HLS 源加载失败:', error);
      this.showHLSError('HLS 源加载失败: ' + error.message);
    }
    
    this.emitStateChange();
  }
  
  // 跳转到指定时间
  seek(percentage) {
    if (this.audio) {
      const newTime = (percentage / 100) * this.duration;
      this.audio.currentTime = newTime;
      this.updateProgress();
    }
  }
  
  // 更新进度
  updateProgress() {
    this.currentTime = this.audio.currentTime;
    this.progress = (this.currentTime / this.duration) * 100 || 0;
    this.emitStateChange();
  }
  
  // 加载元数据
  loadMetadata() {
    if (this.audio && !isNaN(this.audio.duration)) {
      this.duration = this.audio.duration;
    } else {
      this.duration = 0;
    }
    this.emitStateChange();
  }
  
  // 格式化时间
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
  
  // 处理音轨结束
  handleTrackEnded() {
    if (!this.completedTracks.has(this.currentTrackIndex)) {
      this.completedTracks.add(this.currentTrackIndex);
      this.checkMusicConnoisseurAchievement();
      this.saveCompletedTracks();
    }
    
    this.nextTrack();
  }
  
  // 检查音乐鉴赏家成就
  checkMusicConnoisseurAchievement() {
    if (this.completedTracks.size >= 5 && !this.musicConnoisseurUnlocked) {
      this.musicConnoisseurUnlocked = true;
      eventBus.emit('achievement-unlocked', 'music-connoisseur');
      localStorage.setItem('music-connoisseur-unlocked', 'true');
    }
  }
  
  // 保存已完成的歌曲
  saveCompletedTracks() {
    localStorage.setItem('music-completed-tracks', JSON.stringify(Array.from(this.completedTracks)));
  }
  
  // 加载已完成的歌曲
  loadCompletedTracks() {
    try {
      const saved = localStorage.getItem('music-completed-tracks');
      if (saved) {
        const tracks = JSON.parse(saved);
        this.completedTracks = new Set(tracks);
      }
      
      const achievementUnlocked = localStorage.getItem('music-connoisseur-unlocked') === 'true';
      this.musicConnoisseurUnlocked = achievementUnlocked;
    } catch (e) {
      console.error('加载已完成的歌曲数据失败:', e);
    }
  }
  
  // 显示 HLS 错误
  showHLSError(message) {
    this.loadingError = message;
    console.error('🚨 HLS 错误:', message);
    this.emitStateChange();
  }
  
  // HLS 错误处理
  handleHLSError(data) {
    console.error('💥 HLS 错误:', data);
    
    switch(data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.log('🌐 网络错误，智能重试...');
        this.retryHLSLoad(data);
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.log('🎵 媒体错误，尝试恢复...');
        this.recoverHLSMedia(data);
        break;
      case Hls.ErrorTypes.MUX_ERROR:
        console.log('🔧 多路复用错误，重新初始化...');
        this.reinitializeHLS();
        break;
      default:
        console.log('🔄 未知错误，强制重新加载流媒体...');
        this.forceReloadHLS();
        break;
    }
  }
  
  // 智能重试 HLS 加载
  retryHLSLoad(errorData) {
    if (!this.hlsRetryCount) this.hlsRetryCount = 0;
    
    if (this.hlsRetryCount < 3) {
      this.hlsRetryCount++;
      console.log(`🔄 HLS 重试 ${this.hlsRetryCount}/3...`);
      
      setTimeout(() => {
        if (this.hls) {
          this.hls.startLoad();
        }
      }, 1000 * this.hlsRetryCount);
    } else {
      console.log('🆘 HLS 重试次数已达上限，重新初始化...');
      this.reinitializeHLS();
    }
  }
  
  // 恢复 HLS 媒体播放
  recoverHLSMedia(errorData) {
    if (this.hls) {
      try {
        this.hls.recoverMediaError();
        console.log('✅ HLS 媒体错误恢复成功');
      } catch (e) {
        console.error('❌ HLS 媒体恢复失败:', e);
        this.reinitializeHLS();
      }
    }
  }
  
  // 重新初始化 HLS
  reinitializeHLS() {
    console.log('🔄 重新初始化 HLS 播放器...');
    
    if (this.hls) {
      this.hls.destroy();
    }
    
    this.hlsRetryCount = 0;
    this.initializeHLS();
    
    setTimeout(() => {
      this.reloadAudio();
    }, 100);
  }
  
  // 强制重新加载 HLS
  forceReloadHLS() {
    console.log('🚀 强制重新加载 HLS 流媒体...');
    
    const currentUrl = this.getCurrentTrack();
    if (this.hls && currentUrl) {
      this.hls.stopLoad();
      this.hls.detachMedia();
      this.hls.attachMedia(this.audio);
      this.hls.loadSource(currentUrl);
    }
  }
  
  // 获取当前状态
  getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrackIndex: this.currentTrackIndex,
      currentTime: this.currentTime,
      duration: this.duration,
      progress: this.progress,
      randomMode: this.randomMode,
      playlistLoaded: this.playlistLoaded,
      loadingError: this.loadingError,
      currentTrackName: this.getCurrentTrackName(),
      currentTrack: this.getCurrentTrack(),
      playlist: this.playlist
    };
  }
  
  // 发送状态变更事件
  emitStateChange() {
    eventBus.emit('audio-state-changed', this.getState());
  }
  
  // 销毁服务
  destroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    console.log('🎵 全局音频服务已销毁');
  }
}

// 创建单例
const audioService = new AudioService();

export default audioService;
