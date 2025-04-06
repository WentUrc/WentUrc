<template>
  <div class="background-music" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="content">
			<div class="card-title">音乐喵？</div>
      <audio ref="bgMusic" loop>
        <source :src="currentTrack" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
      <div class="controls">
        <button @click="togglePlay" class="play-btn">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <button @click="toggleMute" class="mute-btn">
          {{ isMuted ? '取消静音' : '静音' }}
        </button>
        <button @click="prevTrack" class="track-btn">上一首</button>
        <button @click="nextTrack" class="track-btn">下一首</button>
        <div class="volume-control">
          <label>音量: {{ volume }}%</label>
          <input type="range" min="0" max="100" v-model="volume" @input="changeVolume" />
        </div>
      </div>
    </div>
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
      playlist: [],  // 初始为空
      currentTrackIndex: 0,
      isHovered: false  // 记录悬停状态
    }
  },
  created() {
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
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
      this.reloadAudio();
    },
    prevTrack() {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
      this.reloadAudio();
    },
    reloadAudio() {
      this.audio.src = this.currentTrack;
      if (this.isPlaying) {
        this.audio.play().catch(err => { console.error('播放失败:', err); });
      }
    }
  }
}
</script>

<style scoped>
.background-music {
  position: fixed;
  bottom: 70px;
  left: 20px;
  width: 150px;
  height: 260px;
  /* 非hover状态下也用两层背景，第二层与内容背景相同 */
  background: 
    /* 内容背景 */
    linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box,
    /* 边框背景保持白色 */
    linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) border-box;
  padding: 10px;
  border: 2px solid #ccc;
  z-index: 9999;
  border-radius: 10px;
  overflow: hidden;
  transform: translateX(-160px);
  transition: background 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease;
  opacity: 0.5;
}

.background-music:hover {
  /* 外层边框宽度 */
  border: 5px solid transparent;
  border-radius: 10px; /* 保持圆角 */
  /* 分层背景：第一层是内容背景，第二层是边框渐变 */
  background: 
    /* 内容背景 */
    linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box,
    /* 渐变边框 */
    linear-gradient(to right, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc) border-box;
  transform: translateX(0) scale(1.02);
  box-shadow: 0 0 15px rgba(91, 81, 200, 0.502);
  opacity: 1;
}

/* 如果有需要，可以移除或调整原有的 media query */
@media (max-width: 1024px) {
  .background-music {
    /* 可不再需要单独处理 */
    /* transform: translateX(-160px); */
    opacity: 0.5;
  }
  .background-music:hover {
    /* transform: translateX(0); */
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
  .background-music{
    display: none;
  }
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #5e60ce;
  text-align: center;
  margin-bottom: 10px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.controls button {
  position: relative;
  overflow: hidden;
  padding: 8px 16px;
  border: none;
  background-color: #5e60ce;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  z-index: 1;
}

.controls button::before {
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

.controls button:hover::before {
  transform: translateX(50%);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
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
</style>