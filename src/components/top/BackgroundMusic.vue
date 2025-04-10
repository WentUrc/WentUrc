<template>
  <div class="background-music" :class="{ collapsed: isCollapsed }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="content">
      <!-- 第一行：标题和折叠按钮 -->
      <div class="header-row">
        <div class="card-title">音乐喵✨</div>
        <button class="collapse-btn" @click="toggleCollapse">
          <i :class="isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
        </button>
      </div>
      
      <!-- 展开状态才显示的内容 -->
      <div class="expanded-content" v-if="!isCollapsed">
        <!-- 第二行：音乐控制区域 -->
        <div class="music-control-row">
          <!-- 当前音乐信息（右上） -->
          <div class="track-info">
            <div class="now-playing">
              <div v-if="isPlaying" class="now-playing-indicator">
                <div class="now-playing-bar"></div>
                <div class="now-playing-bar"></div>
                <div class="now-playing-bar"></div>
                <div class="now-playing-bar"></div>
              </div>
              <span v-else class="not-playing">▶</span>
              <div class="track-name">{{ currentTrackName || '未知歌曲' }}</div>
            </div>
            
            <!-- 进度条和时间信息（右下） -->
            <div class="progress-container">
              <div class="progress-bar" @click="seek">
                <div class="progress" :style="{width: `${progress}%`}"></div>
                <div class="progress-thumb" :style="{left: `${progress}%`}"></div>
              </div>
              <div class="progress-info">
                <!-- 播放模式按钮带文字 -->
                <div class="play-mode" @click="toggleRandomMode">
                  <i class="play-mode-icon" :class="randomMode ? 'fas fa-random' : 'fas fa-list'"></i>
                  <span class="play-mode-text">{{ randomMode ? '随机播放' : '顺序播放' }}</span>
                </div>
                <!-- 时间信息（右下） -->
                <div class="time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 第三行：音量控制 -->
        <div class="volume-control">
          <i :class="isMuted || volume === 0 ? 'fas fa-volume-mute' : 'fas fa-volume-up'" 
            @click="toggleMute" class="volume-icon"></i>
          <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" />
        </div>
      </div>
      
      <!-- 第四行：音乐播放控制按钮 (展开和折叠状态都显示) -->
      <div class="media-controls" :class="{ 'collapsed-controls': isCollapsed, 'expanded-controls': !isCollapsed }">
        <div class="primary-controls">
          <button @click="prevTrack" class="control-btn">
            <i class="fas fa-step-backward"></i>
          </button>
          <button @click="togglePlay" class="play-btn">
            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
          <button @click="nextTrack" class="control-btn">
            <i class="fas fa-step-forward"></i>
          </button>
        </div>
      </div>
      
      <!-- 音频可视化 - 移到底部，无论是否播放都显示 -->
      <div class="visualizer" v-if="!isCollapsed">
        <div class="visualizer-bar" 
            v-for="(bar, index) in 12" 
            :key="index" 
            :class="{ 'animated': isPlaying }"
            :style="{ height: `${getVisualizerHeight(index)}px` }">
        </div>
      </div>
      
      <!-- audio 元素始终存在 -->
      <audio ref="bgMusic" @ended="handleTrackEnded" @timeupdate="updateProgress" @loadedmetadata="loadMetadata">
        <source :src="currentTrack" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </div>
</template>

<script>
// 直接导入播放列表数据
import playlistData from '../../assets/data/playlist.json';

export default {
  name: 'BackgroundMusic',
  data() {
    return {
      isPlaying: false,
      isMuted: false,
      volume: 50,
      playlist: [], 
      playlistInfo: [],
      currentTrackIndex: 0,
      isHovered: false, 
      randomMode: false,
      isCollapsed: true, 
      currentTime: 0,
      duration: 0,
      progress: 0,
      visualizerData: []
    };
  },
  created() {
    // 从导入的JSON文件初始化播放列表
    this.playlist = playlistData;
    
    // 从文件名提取歌曲信息
    this.playlistInfo = this.playlist.map(path => {
      const fileName = path.split('/').pop();
      const parts = fileName.replace('.mp3', '').split('-');
      
      if (parts.length >= 2) {
        return {
          name: parts[0].trim(),
          artist: parts[1].trim()
        };
      } else {
        return {
          name: fileName.replace('.mp3', ''),
          artist: '未知艺术家'
        };
      }
    });
    
    // 随机选择一首歌作为初始歌曲
    if (this.playlist.length > 0) {
      this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
    }
  },
  computed: {
    currentTrack() {
      return this.playlist[this.currentTrackIndex];
    },
    currentTrackName() {
      const info = this.playlistInfo[this.currentTrackIndex];
      if (!info) return '未知歌曲';
      return `${info.name} - ${info.artist}`;
    }
  },
  mounted() {
    this.audio = this.$refs.bgMusic;
    this.audio.volume = this.volume / 100;
    
    // 安全地初始化音量控制
    this.$nextTick(() => {
      this.initVolumeControl();
    });
    
    // 设置播放器更新频率
    setInterval(() => {
      this.updateVisualizer();
    }, 100);
  },
  methods: {
    // 初始化音量控制，安全处理
    initVolumeControl() {
      const rangeInput = this.$el.querySelector('.volume-control input[type="range"]');
      if (rangeInput) {
        rangeInput.addEventListener('touchmove', e => { 
          e.stopPropagation();
        }, { passive: false });
      }
    },
    togglePlay() {
      if (window.innerWidth <= 1024 && !this.isHovered) return;
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      } else {
        this.audio.play()
          .then(() => { this.isPlaying = true; })
          .catch(err => { console.error('播放失败:', err); });
      }
    },
    toggleMute() {
      if (window.innerWidth <= 1024 && !this.isHovered) return;
      this.isMuted = !this.isMuted;
      this.audio.muted = this.isMuted;
    },
    changeVolume() {
      this.audio.volume = this.volume / 100;
      if (this.isMuted && this.volume > 0) {
        this.isMuted = false;
        this.audio.muted = false;
      }
    },
    nextTrack() {
      if (this.randomMode) {
        this.currentTrackIndex = this.getRandomTrack();
      } else {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
      }
      this.reloadAudio();
    },
    prevTrack() {
      if (this.randomMode) {
        this.currentTrackIndex = this.getRandomTrack();
      } else {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
      }
      this.reloadAudio();
    },
    getRandomTrack() {
      if (this.playlist.length <= 1) return 0;
      
      // 避免连续播放相同歌曲
      const availableTracks = Array.from(
        {length: this.playlist.length},
        (_, i) => i
      ).filter(i => i !== this.currentTrackIndex);
      
      return availableTracks[Math.floor(Math.random() * availableTracks.length)];
    },
    toggleRandomMode() {
      this.randomMode = !this.randomMode;
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      
      // 切换到展开状态时，确保音量控制初始化
      if (!this.isCollapsed) {
        this.$nextTick(() => {
          this.initVolumeControl();
        });
      }
    },
    reloadAudio() {
      this.audio.src = this.currentTrack;
      if (this.isPlaying) {
        this.audio.play().catch(err => { console.error('播放失败:', err); });
      }
    },
    updateProgress() {
      this.currentTime = this.audio.currentTime;
      this.progress = (this.currentTime / this.duration) * 100 || 0;
    },
    loadMetadata() {
      this.duration = this.audio.duration;
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    },
    seek(event) {
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const newProgress = (offsetX / rect.width) * 100;
      const newTime = (newProgress / 100) * this.duration;
      
      if (this.audio) {
        this.audio.currentTime = newTime;
        this.updateProgress();
      }
    },
    handleTrackEnded() {
      this.nextTrack();
    },
    getVisualizerHeight(index) {
      if (this.isPlaying) {
        return Math.floor(Math.random() * 30) + 5;
      } 
      else {
        const heights = [8, 12, 10, 15, 9, 13, 7, 16, 10, 14, 8, 11];
        return heights[index % heights.length];
      }
    },
    getRandomHeight() {
      return this.getVisualizerHeight(0);
    },
    updateVisualizer() {
      if (this.isPlaying) {
        this.visualizerData = Array(12).fill().map(() => Math.floor(Math.random() * 30) + 5);
      }
    }
  }
};
</script>

<style scoped>
.background-music {
  position: relative;
  width: 100%;
  transform-origin: top center;
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg, rgba(255, 255, 255, 0.8))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  padding: 15px;
  border: 4px solid transparent;
  border-radius: 16px;
  overflow: hidden;
  transform: none;
  transition: height 0.4s ease, background 0.4s ease, box-shadow 0.4s ease;
  opacity: 1;
  height: 320px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.background-music:hover {
  transform: translateX(0) scale(1.02);
  border: 4px solid transparent;
  border-radius: 16px;
  background:
    linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.95)), var(--card-bg-hover, rgba(255, 255, 255, 0.95))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(91, 81, 200, 0.25));
  opacity: 1;
}

.background-music.collapsed {
  height: 150px;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 第一行：标题和折叠按钮 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 5px; /* 减少下方间距 */
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--icon-primary, #5e60ce);
  text-align: left;
}

.collapse-btn {
  background: transparent;
  border: 1px solid var(--icon-primary, #5e60ce);
  color: var(--icon-primary, #5e60ce);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.collapse-btn:hover {
  background: var(--icon-primary, #5e60ce);
  color: white;
}

/* 展开内容区域 */
.expanded-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 第二行：音乐控制区域 */
.music-control-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.track-info {
  width: 100%;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 12px; /* 增加音乐信息与进度条的间距 */
}

.now-playing-indicator {
  display: flex;
  gap: 2px;
  height: 16px;
  align-items: flex-end;
}

.now-playing-bar {
  width: 3px;
  background: var(--icon-primary, #5e60ce);
  animation: sound-wave 0.5s infinite alternate;
  transform-origin: bottom;
}

.now-playing-bar:nth-child(1) { height: 60%; animation-delay: 0.0s; }
.now-playing-bar:nth-child(2) { height: 80%; animation-delay: 0.1s; }
.now-playing-bar:nth-child(3) { height: 40%; animation-delay: 0.2s; }
.now-playing-bar:nth-child(4) { height: 100%; animation-delay: 0.3s; }

.not-playing {
  color: var(--icon-primary, #5e60ce);
  font-size: 14px;
}

.track-name {
  font-size: 14px;
  color: var(--text-color, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
  margin-left: auto;
}

/* 进度条和时间信息 */
.progress-container {
  width: 100%;
  position: relative;
}

.progress-bar {
  width: 100%;
  height: 5px;
  background: var(--divider-color, #ddd);
  border-radius: 3px;
  overflow: visible;
  cursor: pointer;
  margin-bottom: 10px; /* 增加进度条与播放模式/时间的间距 */
  position: relative;
}

.progress {
  height: 100%;
  background: var(--primary-gradient, linear-gradient(to right, #5e60ce, #6930c3));
  border-radius: 3px;
}

/* 进度条上的圆形控制点 */
.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: var(--icon-primary, #5e60ce);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* 进度信息行（包含播放模式图标和时间） */
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 播放模式按钮的容器 */
.play-mode {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

/* 播放模式图标 */
.play-mode-icon {
  font-size: 12px;
  color: var(--text-color, #666);
  transition: color 0.2s ease;
}

/* 播放模式文本 */
.play-mode-text {
  font-size: 12px;
  color: var(--text-color, #666);
  transition: color 0.2s ease;
}

/* 播放模式悬停效果 */
.play-mode:hover .play-mode-icon,
.play-mode:hover .play-mode-text {
  color: var(--icon-primary, #5e60ce);
}

.time {
  font-size: 12px;
  color: var(--text-color, #666);
  text-align: right;
}

/* 第三行：音量控制 */
.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
}

.volume-icon {
  cursor: pointer;
  color: var(--icon-primary, #5e60ce);
}

.volume-control input[type="range"] {
  -webkit-appearance: none;
  flex-grow: 1;
  height: 5px;
  background: var(--divider-color, #ddd);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--icon-primary, #5e60ce);
  border-radius: 50%;
}

/* 第四行：媒体控制按钮 */
.media-controls {
  margin-top: auto; /* 将控件推到底部 */
}

/* 展开状态下减少与上方音量控制的间距 */
.expanded-controls {
  margin-top: -5px; /* 负间距让控制按钮向上移动 */
}

/* 折叠状态下的控制按钮间距调整 */
.collapsed-controls {
  margin-top: 5px; /* 折叠状态减少上边距 */
}

.primary-controls {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.control-btn {
  background: var(--button-hover, #f0f0f0);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--icon-primary, #5e60ce);
}

.play-btn {
  width: 48px;
  height: 48px;
  background: var(--icon-primary, #5e60ce);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover, .play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px var(--card-shadow, rgba(94, 96, 206, 0.3));
}

/* 可视化效果 - 移到底部 */
.visualizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 30px;
  width: 100%;
  margin-top: auto;
  margin-bottom: 5px;
}

.visualizer-bar {
  flex: 1;
  background: var(--primary-gradient, linear-gradient(to top, #5e60ce, #d1ecf9));
  border-radius: 2px;
  min-height: 2px;
  transform-origin: bottom;
  transition: height 0.5s ease; 
}

.visualizer-bar.animated {
  transition: height 0.1s ease; 
  animation: sound-wave 0.5s infinite alternate;
}

@keyframes sound-wave {
  from { transform: scaleY(0.8); }
  to { transform: scaleY(1.2); }
}

@media (max-width: 1024px) {
  .background-music {
    opacity: 1;
  }
  .background-music:hover {
    opacity: 1;
  }
  .background-music .content {
    pointer-events: none;
  }
  .background-music:hover .content {
    pointer-events: auto;
  }
}

@media (max-width: 768px) {
  .background-music {
    display: block; 
  }
}
</style>