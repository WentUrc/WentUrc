<template>
  <div class="profile-container" :style="backgroundStyle">
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
      backgroundUrl: 'https://api.wenturc.com/' // 替换成实际背景图URL
    };
  },
  computed: {
    backgroundStyle() {
      return this.backgroundLoaded
        ? { background: `url(${this.backgroundUrl}) no-repeat center center`, backgroundSize: 'cover' }
        : { background: 'linear-gradient(45deg, #dcbff8, #d1ecf9)', backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite' };
    }
  },
  methods: {
    handleBackgroundLoad() {
      this.backgroundLoaded = true;
    },
    handleBackgroundError() {
      this.backgroundLoaded = false;
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
  transition: background 0.3s ease-in-out;
  overflow: hidden;
}

.profile-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3); /* 这里可以调整蒙版颜色和透明度 */
  pointer-events: none;
  z-index: 0;
}

/* 个人资料卡片 */
.profile-card {
  position: relative;
  z-index: 1; /* 确保卡片在蒙版之上 */
  background: rgba(255, 255, 255, 0.9); /* 半透明背景便于阅读 */
  padding: 30px;
  border-radius: 16px;
  width: 30%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
  transition: border 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease; /* 添加平滑过渡 */
}

.profile-card:hover {
  border: 5px solid #5e60ce; /* hover 时显示边框 */
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0,0,0,0.2);
}
/* 头像 */
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #5e60ce;
  margin-bottom: 20px;
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

/* 小屏幕响应 */
@media (max-width: 768px) {
  .profile-card {
    width: 90%;
    padding: 20px;
  }
}
</style>