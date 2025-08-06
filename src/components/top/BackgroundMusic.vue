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
// 导入全局音频服务
import audioService from '../../services/audioService.js';
import eventBus from '../../utils/eventBus.js';
import silentBrowsingTracker from '../../components/other/achievements/easter-eggs/SilentBrowsingTracker.js';

export default {
  name: 'BackgroundMusic',
  data() {
    return {
      isCollapsed: false,
      isHovered: false,
      visualizerData: Array(12).fill(0),
      audioState: audioService.getState(),
      audioStateHandler: null
    };
  },
  computed: {
    isPlaying() {
      return this.audioState.isPlaying;
    },
    isMuted() {
      return this.audioState.isMuted;
    },
    volume: {
      get() {
        return this.audioState.volume;
      },
      set(value) {
        audioService.setVolume(value);
      }
    },
    currentTrackName() {
      return this.audioState.currentTrackName;
    },
    currentTime() {
      return this.audioState.currentTime;
    },
    duration() {
      return this.audioState.duration;
    },
    progress() {
      return this.audioState.progress;
    },
    randomMode() {
      return this.audioState.randomMode;
    },
    playlistLoaded() {
      return this.audioState.playlistLoaded;
    },
    loadingError() {
      return this.audioState.loadingError;
    }
  },
  mounted() {
    // 监听音频状态变化
    this.audioStateHandler = (state) => {
      this.audioState = state;
    };
    eventBus.on('audio-state-changed', this.audioStateHandler);
    
    // 安全地初始化音量控制
    this.$nextTick(() => {
      this.initVolumeControl();
    });
    
    // 设置播放器更新频率
    setInterval(() => {
      this.updateVisualizer();
    }, 100);
    
    // 初始化静音浏览跟踪器
    silentBrowsingTracker.initialize();
    
    // 设置初始静音状态
    silentBrowsingTracker.setMuteStatus(this.audioState.isMuted);
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
    
    // 播放/暂停 - 委托给全局音频服务
    togglePlay() {
      audioService.togglePlay();
    },
    
    // 静音/取消静音 - 委托给全局音频服务
    toggleMute() {
      audioService.toggleMute();
      silentBrowsingTracker.setMuteStatus(audioService.getState().isMuted);
    },
    
    // 调整音量 - 委托给全局音频服务
    changeVolume() {
      // 音量已经通过 v-model 和计算属性的 setter 处理
      if (this.audioState.isMuted && this.audioState.volume > 0) {
        audioService.toggleMute();
        silentBrowsingTracker.setMuteStatus(false);
      }
    },
    
    // 下一首 - 委托给全局音频服务
    nextTrack() {
      audioService.nextTrack();
    },
    
    // 上一首 - 委托给全局音频服务
    prevTrack() {
      audioService.prevTrack();
    },
    
    // 切换随机模式 - 委托给全局音频服务
    toggleRandomMode() {
      audioService.toggleRandomMode();
      
      // 可以添加一个简单的视觉反馈
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50); // 轻微震动反馈（移动设备）
      }
    },
    
    // 折叠/展开
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      if (!this.isCollapsed) {
        this.$nextTick(() => {
          this.initVolumeControl();
        });
      }
    },
    
    // 格式化时间
    formatTime(seconds) {
      return audioService.formatTime(seconds);
    },
    
    // 跳转 - 委托给全局音频服务
    seek(event) {
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const newProgress = (offsetX / rect.width) * 100;
      audioService.seek(newProgress);
    },
    
    // 可视化相关
    getVisualizerHeight(index) {
      if (this.audioState.isPlaying) {
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
      if (this.audioState.isPlaying) {
        this.visualizerData = Array(12).fill().map(() => Math.floor(Math.random() * 30) + 5);
      }
    }
  },
  beforeDestroy() {
    // 取消监听音频状态变化
    if (this.audioStateHandler) {
      eventBus.off('audio-state-changed', this.audioStateHandler);
    }
    
    // 清理静音浏览跟踪器
    silentBrowsingTracker.cleanup();
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
  transition: height 0.4s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
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
  box-shadow: 0 8px 20px var(--card-shadow, rgba(91, 81, 200, 0.1));
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
  margin-bottom: 5px;
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
  margin-bottom: 12px;
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
.loading, .error {
  color: var(--text-color, #666);
  font-style: italic;
}
.error {
  color: #ff6b6b;
}
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
  margin-bottom: 10px;
  position: relative;
}
.progress-fill {
  height: 100%;
  background: var(--primary-gradient, linear-gradient(to right, #5e60ce, #6930c3));
  border-radius: 3px;
}
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
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.play-mode {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.play-mode-icon {
  font-size: 12px;
  color: var(--text-color, #666);
  transition: color 0.2s ease;
}
.play-mode-text {
  font-size: 12px;
  color: var(--text-color, #666);
  transition: color 0.2s ease;
}
.play-mode:hover .play-mode-icon,
.play-mode:hover .play-mode-text {
  color: var(--icon-primary, #5e60ce);
}
.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-color, #666);
  margin-bottom: 8px;
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
.volume-btn {
  cursor: pointer;
  color: var(--icon-primary, #5e60ce);
  background: none;
  border: none;
  font-size: 16px;
}
.volume-control input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  flex-grow: 1;
  height: 5px;
  background: var(--divider-color, #ddd);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}
.volume-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--icon-primary, #5e60ce);
  border-radius: 50%;
  cursor: pointer;
}
.volume-value {
  font-size: 11px;
  color: var(--text-color, #666);
  min-width: 30px;
  text-align: right;
}
.additional-controls {
  display: flex;
  gap: 8px;
}
.shuffle-btn {
  background: transparent;
  border: 1px solid var(--icon-primary, #5e60ce);
  color: var(--icon-primary, #5e60ce);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.shuffle-btn.active {
  background: var(--icon-primary, #5e60ce);
  color: white;
}
.shuffle-btn:hover {
  background: var(--icon-primary, #5e60ce);
  color: white;
}
/* 第四行：媒体控制按钮 */
.media-controls {
  margin-top: auto;
}
.expanded-controls {
  margin-top: -5px;
}
.collapsed-controls {
  margin-top: 5px;
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
  width: 40px;
  height: 40px;
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
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}
.control-btn:hover, .play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px var(--card-shadow, rgba(94, 96, 206, 0.3));
}
/* 可视化器 */
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
