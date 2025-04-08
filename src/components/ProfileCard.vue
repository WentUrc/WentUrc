<template>
  <div class="profile-container" :class="{ 'image-loaded': backgroundLoaded }">
    <!-- 添加背景图层，实现平滑过渡 -->
    <div class="background-layer gradient-bg"></div>
    <div class="background-layer image-bg" :style="imageBackground"></div>
    
    <!-- 加载状态指示器 -->
    <div class="loading-indicator" v-if="!backgroundLoaded && !backgroundError">
      <div class="loading-spinner"></div>
    </div>
    
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
      backgroundUrl: 'https://api.wenturc.com/' // 替换成实际背景图URL
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
      // 添加短暂延迟使过渡更平滑
      setTimeout(() => {
        this.backgroundLoaded = true;
        this.backgroundError = false;
      }, 300);
    },
    handleBackgroundError() {
      this.backgroundLoaded = false;
      this.backgroundError = true;
      console.error('背景图片加载失败');
    },
    scrollToBottom() {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  },
  mounted() {
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
  background: linear-gradient(45deg, #dcbff8, #d1ecf9);
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

/* 加载指示器 */
.loading-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {transform: rotate(360deg);}
}

/* 个人资料卡片 */
.profile-card {
  position: relative;
  z-index: 1; /* 确保卡片在蒙版之上 */
  padding: 30px;
  border-radius: 16px;
  width: 30%;
  text-align: center;
  max-width: 400px;
  opacity: 0.9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  border: 4px solid transparent;
  background: 
    linear-gradient(white, white) padding-box,
    linear-gradient(to right, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc) border-box;
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
}

.profile-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0,0,0,0.2);
  animation: moveGradient 3s ease infinite; /* 悬停时加快动画速度 */
}

/* 头像 */
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  z-index: 2;
  
  /* 头像也使用渐变边框 */
  border: 4px solid transparent;
  
  /* 与卡片相同的技术 */
  background: 
    white padding-box,
    linear-gradient(to right, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc) border-box;
  
  background-size: auto, 300% 100%;
  animation: moveGradient 8s ease infinite;
}

/* 用户名 */
.name {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
}

/* 个人简介 */
.bio {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* 社交链接 */
.social-links a {
  color: #5e60ce;
  font-size: 1.5rem;
  margin: 0 10px;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #6930c3;
}

/* 底部箭头 */
.arrow-down {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: #7d7fff;
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

/* 渐变动画 */
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