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
    <div class="profile-card" @click="handleCardClick" ref="profileCard">
      <img 
        :src="avatar" 
        :alt="`用户 ${name} 的头像`" 
        class="avatar" 
        fetchpriority="high" 
        loading="eager"
        width="120"
        height="120"
        decoding="sync"
      />
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
import audioService from '../../services/audioService.js';

export default {
  name: 'ProfileCard',
  data() {
    return {
      avatar: 'https://avatars.githubusercontent.com/u/59095086?v=4&s=240', // 添加尺寸参数提升加载效率
      name: '冰苷晶',
      bio: '路很长，梦还在',
      socialLinks: [
        {
          url: 'https://github.com/IGCrystal-NEO',
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
      navBarHeight: 60, // 导航栏高度
      musicPlayed: false, // 标记音乐是否已播放
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
    handleCardClick(event) {
      // 如果点击的是社交链接，不处理音乐播放和纸片动画
      if (event.target.closest('.social-links a')) {
        return;
      }
      
      // 触发纸片飘散动画
      this.createPaperScatterEffect(event);
      
      // 如果音乐已经播放过，不重复播放
      if (this.musicPlayed) {
        return;
      }
      
      // 尝试播放音乐
      this.tryPlayMusic();
    },
    createPaperScatterEffect(event) {
      // 获取点击位置相对于视口的绝对坐标
      const clickX = event.clientX;
      const clickY = event.clientY;
      
      // 获取当前主题色
      const rootStyles = getComputedStyle(document.documentElement);
      const cardStyles = getComputedStyle(this.$refs.profileCard);
      
      // 动态获取主题色，如果获取不到则使用默认值
      const themeColors = [
        rootStyles.getPropertyValue('--icon-primary').trim() || '#5e60ce',
        rootStyles.getPropertyValue('--icon-accent').trim() || '#6930c3',
        cardStyles.getPropertyValue('--border-gradient').trim() || '#dcbff8',
        rootStyles.getPropertyValue('--text-color').trim() || '#333',
        '#dcbff8', // 渐变紫
        '#d1ecf9', // 渐变蓝
        '#c6e2ff', // 浅蓝
        '#f9d1dc', // 浅粉
        '#e8f5e8'  // 浅绿
      ].filter(color => color); // 过滤掉空值
      
      // 创建纸片容器，覆盖整个视口
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
      `;
      
      document.body.appendChild(container);
      
      // 创建纸片
      const paperCount = 25;
      const shapes = ['●', '■', '▲', '♥', '★', '◆'];
      
      for (let i = 0; i < paperCount; i++) {
        const paper = document.createElement('div');
        
        // 随机纸片属性
        const size = Math.random() * 12 + 8; // 8-20px
        const color = themeColors[Math.floor(Math.random() * themeColors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // 关键：计算真正的四面八方飞散
        const angle = (i / paperCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5; // 均匀分布 + 随机偏移
        const velocity = 200 + Math.random() * 300; // 200-500px 飞行距离
        const gravity = 100 + Math.random() * 200; // 重力下坠距离
        
        const targetX = clickX + Math.cos(angle) * velocity;
        const targetY = clickY + Math.sin(angle) * velocity + gravity; // 加入重力
        
        // 设置纸片样式和动画
        paper.style.cssText = `
          position: absolute;
          left: ${clickX - size/2}px;
          top: ${clickY - size/2}px;
          width: ${size}px;
          height: ${size}px;
          color: ${color};
          font-size: ${size}px;
          font-weight: bold;
          line-height: 1;
          text-align: center;
          opacity: 1;
          transform: rotate(0deg);
          transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 10000;
        `;
        
        paper.innerHTML = shape;
        container.appendChild(paper);
        
        // 延迟触发动画，让每个纸片有不同的启动时间
        setTimeout(() => {
          if (paper.parentNode) {
            paper.style.transform = `translate(${targetX - clickX}px, ${targetY - clickY}px) rotate(${Math.random() * 720 - 360}deg) scale(0.3)`;
            paper.style.opacity = '0';
          }
        }, Math.random() * 100); // 0-100ms 随机延迟
      }
      
      // 3秒后清除容器
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 3000);
    },
    tryPlayMusic() {
      try {
        if (audioService && !audioService.getState().isPlaying) {
          audioService.togglePlay();
          this.musicPlayed = true; // 标记已播放
          notificationService.info('交响之音已然绽放');
        }
      } catch (error) {
        console.warn('⚠️ 音乐播放失败:', error);
        // 即使失败也标记，避免重复尝试
        this.musicPlayed = true;
      }
    },
    simulateLoadingProgress() {
      this.loadingTimer = setInterval(() => {
        if (this.loadingProgress < 90) {
          const increment = Math.max(0.5, 10 - (this.loadingProgress / 10));
          this.loadingProgress += increment;
        }
      }, 200);
    },
    preloadAvatar() {
      // 主动预加载头像，提升LCP性能
      const avatarImg = new Image();
      avatarImg.src = this.avatar;
      
      // 预加载完成后的处理
      avatarImg.onload = () => {
        console.log('📸 头像预加载完成');
      };
      
      avatarImg.onerror = () => {
        console.warn('⚠️ 头像预加载失败');
      };
    }
  },
  created() {
    // 在组件创建阶段就开始预加载头像
    this.preloadAvatar();
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

/* 移除卡片的overflow限制，让纸片能飞出边界 */
.profile-card {
  position: relative;
  z-index: 2;
  padding: 30px;
  border-radius: 16px;
  width: 30%;
  max-width: 400px;
  min-width: 320px;
  text-align: center;
  opacity: 0.9;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0,0,0,0.1));
  border: 4px solid transparent;
  background: 
    linear-gradient(var(--card-bg, white), var(--card-bg, white)) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer; /* 添加手型光标提示可点击 */
  user-select: none; /* 禁用文字选中 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px var(--card-shadow, rgba(0,0,0,0.15));
}

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
  -webkit-user-drag: none; /* Safari */
  -khtml-user-drag: none; /* Konqueror */
  -moz-user-drag: none; /* Firefox */
  -o-user-drag: none; /* Opera */
  user-select: none; /* 禁用选中 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  pointer-events: none; /* 禁用所有鼠标事件，包括拖动 */
}

.name {
  font-size: 1.8rem;
  color: var(--text-color, #333);
  margin-bottom: 10px;
  user-select: none; /* 禁用文字选中 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

.bio {
  font-size: 1rem;
  color: var(--text-color, #666);
  line-height: 1.5;
  margin-bottom: 20px;
  user-select: none; /* 禁用文字选中 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
}

.social-links a {
  color: var(--icon-primary, #5e60ce);
  font-size: 1.5rem;
  margin: 0 10px;
  transition: color 0.3s;
}

.social-links a:hover {
  color: var(--icon-accent, #6930c3);
}

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

@keyframes moveGradient {
  0% { background-position: 0% 0%, 0% 50%; }
  50% { background-position: 0% 0%, 100% 50%; }
  100% { background-position: 0% 0%, 0% 50%; }
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

.image-loaded .gradient-bg {
  opacity: 0;
}

.image-loaded .image-bg {
  opacity: 1;
}

.profile-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 1;
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
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes moveGradient {
  0% { background-position: 0% 0%, 0% 50%; }
  50% { background-position: 0% 0%, 100% 50%; }
  100% { background-position: 0% 0%, 0% 50%; }
}

/* 小屏幕响应 */
@media (max-width: 768px) {
  .profile-card {
    width: 85%;
    padding: 25px;
    min-width: unset; /* 移除最小宽度限制 */
  }
  
  .avatar {
    width: 100px; /* 小屏幕上减小头像尺寸 */
    height: 100px;
    margin-bottom: 15px;
  }
  
  .name {
    font-size: 1.6rem; /* 调整姓名字体大小 */
    margin-bottom: 8px;
  }
  
  .bio {
    font-size: 0.9rem; /* 调整简介字体大小 */
    line-height: 1.4;
    margin-bottom: 15px;
    padding: 0 5px;
  }
  
  .social-links a {
    font-size: 1.3rem; /* 减小社交图标尺寸 */
    margin: 0 8px;
  }
  
  .arrow-down {
    bottom: 30px; /* 调整底部箭头位置 */
    font-size: 2.5rem; /* 减小箭头尺寸 */
  }
}

/* 特小屏幕额外优化 (如iPhone SE等) */
@media (max-width: 375px) {
  .profile-card {
    width: 92%;
    padding: 20px 15px;
    margin: 0 auto;
  }
  
  .avatar {
    width: 85px;
    height: 85px;
  }
  
  .name {
    font-size: 1.4rem;
  }
  
  .bio {
    font-size: 0.85rem;
    margin-bottom: 12px;
  }
  
  .social-links a {
    font-size: 1.2rem;
    margin: 0 6px;
  }
}

/* 优化移动端的纵向视图 */
@media (max-height: 700px) and (max-width: 768px) {
  .profile-container {
    padding: 15px 10px;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
  }
  
  .profile-card {
    padding: 20px 15px;
  }
  
  .arrow-down {
    bottom: 15px;
  }
}
</style>