<template>
  <div class="profile-container" :class="{ 'image-loaded': backgroundLoaded }">
    <!-- 进度条加载指示器 -->
    <div class="github-progress-container" v-if="!backgroundLoaded && !backgroundError">
      <div class="github-progress-bar" :style="{width: loadingProgress + '%'}"></div>
    </div>
    
    <!-- 添加背景图层，实现平滑过渡 -->
    <div class="background-layer gradient-bg"></div>
    <div class="background-layer image-bg" :style="imageBackground"></div>
    
    <!-- 个人资料卡片 -->
    <div class="profile-card">
      <img :src="avatar" :alt="`用户 ${name} 的头像`" class="avatar" />
      <h2 class="name">{{ name }}</h2>
      <p class="bio">{{ bio }}</p>
      <div class="social-links">
        <a
          v-for="(link, index) in socialLinks"
          :key="index"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          :title="link.title"
          :aria-label="link.title"
        >
          <i :class="link.iconClass"></i>
        </a>
      </div>
    </div>

    <!-- 添加底部箭头 -->
    <div class="arrow-down" @click="scrollToBottom">
      <i class="fas fa-chevron-down"></i>
    </div>
  </div>
</template>

<script>
import notificationService from '../../utils/notificationService.js';

export default {
  name: 'ProfileCard',
  data() {
    return {
      avatar: 'https://avatars.githubusercontent.com/u/74816859?v=4',
      name: '冰苷晶',
      bio: '路很长，梦还在',
      socialLinks: [
        {
          url: 'https://github.com/IGCrystal',
          title: 'GitHub',
          iconClass: 'fab fa-github'
        },
        {
          url: 'https://space.bilibili.com/523637242',
          title: '哔哩哔哩',
          iconClass: 'fab fa-bilibili'
        },
        {
          url: 'mailto:tu4tu23min@outlook.com',
          title: '邮箱',
          iconClass: 'far fa-envelope'
        }
      ],
      backgroundLoaded: false,
      backgroundError: false,
      backgroundUrl: 'https://api.wenturc.com/', 
      loadingProgress: 0, 
      loadingTimer: null,
      navBarHeight: 60 // 导航栏高度
    };
  },
  computed: {
    imageBackground() {
      return {
        backgroundImage: `url(${this.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      };
    }
  },
  methods: {
    handleBackgroundLoad() {
      this.loadingProgress = 100;
      setTimeout(() => {
        this.backgroundLoaded = true;
        this.backgroundError = false;
        if (this.loadingTimer) {
          clearInterval(this.loadingTimer);
          this.loadingTimer = null;
        }
      }, 300);
    },
    handleBackgroundError() {
      this.backgroundLoaded = false;
      this.backgroundError = true;

      notificationService.error('背景图片加载失败了喵～');
      
      console.error('背景图片加载失败');
      if (this.loadingTimer) {
        clearInterval(this.loadingTimer);
        this.loadingTimer = null;
      }
    },
    scrollToBottom() {
      const profileElement = this.$el;
      const elementBottom = profileElement.offsetTop + profileElement.offsetHeight;
      window.scrollTo({
        top: elementBottom - this.navBarHeight,
        behavior: 'smooth'
      });
    },
    simulateLoadingProgress() {
      this.loadingTimer = setInterval(() => {
        if (this.loadingProgress < 90) {
          const increment = Math.max(0.5, 10 - (this.loadingProgress / 10));
          this.loadingProgress += increment;
        }
      }, 200);
    }
  },
  mounted() {
    this.simulateLoadingProgress();
    const logoElement = document.querySelector('.logo-banner');
    if (logoElement) {
      this.navBarHeight = logoElement.offsetHeight;
    }
    
    const img = new Image();
    img.onload = this.handleBackgroundLoad;
    img.onerror = this.handleBackgroundError;
    img.src = this.backgroundUrl;
  }
};
</script>

<style scoped>
/* 整体容器 */
.profile-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.github-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 99999;
  overflow: hidden;
}

.github-progress-bar {
  height: 100%;
  background: var(--primary-gradient, linear-gradient(to right, #dcbff8, #5e60ce, #6930c3));
  width: 0;
  transition: width 0.2s ease;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px var(--card-shadow, rgba(94, 96, 206, 0.5));
}

@keyframes progress-animation {
  0% {
    left: -30%;
    width: 30%;
  }
  50% {
    width: 30%;
  }
  70% {
    width: 70%;
  }
  100% {
    left: 100%;
    width: 30%;
  }
}

/* 背景层，用于平滑过渡 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 1.2s ease-in-out;
}

.gradient-bg {
  background: var(--primary-gradient, linear-gradient(45deg, #dcbff8, #d1ecf9));
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  opacity: 1;
  z-index: 0;
}

.image-bg {
  opacity: 0;
  z-index: 0;
}

/* 当图片加载完成时的状态 */
.image-loaded .gradient-bg {
  opacity: 0;
}

.image-loaded .image-bg {
  opacity: 1;
}

/* 遮罩层 */
.profile-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 1;
}

/* 个人资料卡片 */
.profile-card {
  position: relative;
  z-index: 1;
  padding: 30px;
  border-radius: 16px;
  width: 30%;
  text-align: center;
  max-width: 400px;
  opacity: 0.9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0,0,0,0.1));
  border: 4px solid transparent;
  background: 
    linear-gradient(var(--card-bg, white), var(--card-bg, white)) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
}

.profile-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px var(--card-shadow, rgba(0,0,0,0.2));
  animation: moveGradient 3s ease infinite;
}

/* 头像 */
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  z-index: 2;
  border: 4px solid transparent;
  background: 
    var(--card-bg, white) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
}

/* 用户名 */
.name {
  font-size: 1.8rem;
  color: var(--text-color, #333);
  margin-bottom: 10px;
}

/* 个人简介 */
.bio {
  font-size: 1rem;
  color: var(--text-color, #666);
  line-height: 1.5;
  margin-bottom: 20px;
}

/* 社交链接 */
.social-links a {
  color: var(--icon-primary, #5e60ce);
  font-size: 1.5rem;
  margin: 0 10px;
  transition: color 0.3s;
}

.social-links a:hover {
  color: var(--icon-accent, #6930c3);
}

/* 底部箭头 */
.arrow-down {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: var(--icon-primary, #7d7fff);
  animation: bounce 2s infinite;
  cursor: pointer;
  z-index: 4;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 渐变边框动画 */
@keyframes moveGradient {
  0% { background-position: 0% 0%, 0% 50%; }
  50% { background-position: 0% 0%, 100% 50%; }
  100% { background-position: 0% 0%, 0% 50%; }
}

/* 小屏幕响应 */
@media (max-width: 768px) {
  .profile-card {
    width: 90%;
    padding: 20px;
  }
}
</style>