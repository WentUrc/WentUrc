<template>
  <div class="background-music" :class="{ collapsed: isCollapsed }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="content">
      <!-- Minimal controls 始终显示，包含标题和媒体控件 -->
      <div class="minimal-controls">
        <div class="card-title">音乐喵✨</div>
        <div class="media-controls">
          <button @click="togglePlay" class="play-btn">
            {{ isPlaying ? '暂停' : '播放' }}
          </button>
          <div class="volume-control">
            <label>音量: {{ volume }}%</label>
            <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" />
          </div>
        </div>
      </div>
      <!-- 仅在展开状态下显示额外控件 -->
      <div class="full-controls" v-if="!isCollapsed">
        <div class="controls">
          <button @click="prevTrack" class="track-btn">上一首</button>
          <button @click="nextTrack" class="track-btn">下一首</button>
          <button @click="toggleRandomMode" class="track-btn">
            随机播放: {{ randomMode ? 'ON' : 'OFF' }}
          </button>
        </div>
      </div>
      <!-- audio 元素始终存在 -->
      <audio ref="bgMusic" loop style="display:none">
        <source :src="currentTrack" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
    <!-- 折叠/展开按钮始终显示 -->
    <button class="collapse-btn" @click="toggleCollapse">
      {{ isCollapsed ? '展开' : '折叠' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'BackgroundMusic',
  data() {
    return {
      isPlaying: false,
      isMuted: false,
      volume: 50,
      playlist: [], // 初始为空
      currentTrackIndex: 0,
      isHovered: false, // 记录悬停状态
      randomMode: false, // 控制随机播放
      isCollapsed: true // 默认折叠
    };
  },
  created() {
    // 假定 this.$playlistData 已包含播放列表数据
    this.playlist = this.$playlistData;
  },
  computed: {
    currentTrack() {
      return this.playlist[this.currentTrackIndex];
    }
  },
  mounted() {
    this.audio = this.$refs.bgMusic;
    this.audio.volume = this.volume / 100;
    const rangeInput = this.$el.querySelector('.volume-control input[type="range"]');
    rangeInput.addEventListener('touchmove', e => { e.stopPropagation(); }, { passive: false });
  },
  methods: {
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
        let newIndex;
        if (this.playlist.length > 1) {
          do {
            newIndex = Math.floor(Math.random() * this.playlist.length);
          } while (newIndex === this.currentTrackIndex);
        } else {
          newIndex = 0;
        }
        this.currentTrackIndex = newIndex;
      } else {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
      }
      this.reloadAudio();
    },
    prevTrack() {
      if (this.randomMode) {
        let newIndex;
        if (this.playlist.length > 1) {
          do {
            newIndex = Math.floor(Math.random() * this.playlist.length);
          } while (newIndex === this.currentTrackIndex);
        } else {
          newIndex = 0;
        }
        this.currentTrackIndex = newIndex;
      } else {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
      }
      this.reloadAudio();
    },
    toggleRandomMode() {
      this.randomMode = !this.randomMode;
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    reloadAudio() {
      this.audio.src = this.currentTrack;
      if (this.isPlaying) {
        this.audio.play().catch(err => { console.error('播放失败:', err); });
      }
    }
  }
};
</script>

<style scoped>
.background-music {
  position: fixed;
  top: 50%;           /* 固定在底部 */
  left: 20px;
  width: 150px;
  /* 默认展开高度 */
  height: 260px;
  transform-origin: top center; /* 动画原点在顶部 */
  background: 
    linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box,
    linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) border-box;
  padding: 10px;
  border: 2px solid #ccc;
  z-index: 9999;
  border-radius: 10px;
  overflow: hidden;
  /* 初始自动向左隐藏 */
  transform: translateX(-160px);
  transition: transform 0.4s ease, height 0.4s ease, background 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease;
  opacity: 0.5;
}
.background-music:hover {
  /* 悬停时自动滑回左边，显示完整 */
  transform: translateX(0) scale(1.02);
  border: 2px solid transparent;
  border-radius: 10px;
  background:
    linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box,
    linear-gradient(to right, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc) border-box;
  box-shadow: 0 0 15px rgba(91,81,200,0.502);
  opacity: 1;
}
/* 折叠状态下高度变小，但展开时仍保持自动靠左隐藏 */
.background-music.collapsed {
  height: 140px;
}
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
/* Minimal controls： 保证标题和按钮自动靠左 */
.minimal-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;  /* 自动靠左 */
}
.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #5e60ce;
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
}
.media-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.play-btn,
.volume-control {
  width: 100%;
  text-align: center;
}
.full-controls {
  margin-top: 10px;
}
.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.controls button,
.play-btn,
.track-btn {
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 8px 16px;
  border: none;
  background-color: #5e60ce;
  color: #fff;
  border-radius: 6px; /* 圆角增加2px */
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  z-index: 1;
}
.controls button::before,
.play-btn::before,
.track-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, #5e60ce, #8490d7);
  transition: transform 0.3s ease-in-out;
  z-index: -1;
}
.controls button:hover::before,
.play-btn:hover::before,
.track-btn:hover::before {
  transform: translateX(50%);
}
.volume-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.volume-control label {
  font-size: 14px;
  color: #333;
}
.volume-control input[type="range"] {
  -webkit-appearance: none;
  width: 100px;
  height: 4px;
  background: #ddd;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}
.volume-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #5e60ce;
  border-radius: 50%;
}
.collapse-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: 1px solid #5e60ce;
  color: #5e60ce;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s ease;
  z-index: 2;
}
.collapse-btn:hover {
  background: #5e60ce;
  color: #fff;
}
@media (max-width: 1024px) {
  .background-music {
    opacity: 0.5;
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
@media (max-width:768px) {
  .background-music {
    display: none;
  }
}
</style>