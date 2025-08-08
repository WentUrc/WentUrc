<template>
  <div class="friend-links-page">
    <!-- 添加背景渐变文字 -->
    <div class="friend-links-inner">
      <div class="section-header">
        <h1 class="section-title">
          <i class="fas fa-link"></i>
          友情链接
        </h1>
        <p class="section-subtitle">这里是我的朋友们</p>
      </div>
      
      <!-- 直接渲染友链内容，不使用组件的容器 -->
      <div class="friend-links-content">
        <div class="friends-grid">
          <a 
            v-for="(friend, index) in friendLinks" 
            :key="index"
            :href="friend.url"
            target="_blank"
            rel="noopener noreferrer"
            class="friend-link"
          >
            <img :src="friend.avatar" :alt="`${friend.name}的头像`" class="friend-avatar" />
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
              <span class="friend-desc">{{ friend.description }}</span>
            </div>
          </a>
        </div>
        
        <div class="exchange-note">
          <p>欢迎交换友链</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import friendLinksData from '../../assets/data/friendLinks.json';
import '../../assets/css/color.css';
import { gsap } from 'gsap';

export default {
  name: 'FriendLinksPage',
  data() {
    return {
      friendLinks: friendLinksData
    };
  },
  mounted() {
    // 立即执行入场动画 - 与RoleCard保持一致
    this.$nextTick(() => {
      gsap.from(this.$el.querySelector('.friend-links-inner'), {
        duration: 0.4,
        y: 50,
        opacity: 0,
        ease: 'power2.out'
      });
    });
  }
};
</script>

<style scoped>
/* 外层容器 - 响应式布局策略 */
.friend-links-page {
  position: relative;
  max-width: 100%;
  margin: 0;
  padding: 50px 0;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  color: var(--text-color, #333);
  box-sizing: border-box;
}

/* 桌面端：固定高度 + 内部滚动 */
@media (min-width: 769px) {
  .friend-links-page {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* 移动端：自适应高度 + 传统布局 */
@media (max-width: 768px) {
  .friend-links-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}

/* 添加背景渐变文字 */
.friend-links-page::before {
  content: "Friends";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 20rem;
  font-weight: bold;
  background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0.1;
  z-index: 0;
}



/* 内层容器 - 与其他组件保持一致 */
.friend-links-inner {
  position: relative;
  z-index: 2;
  width: 85%;
  max-width: 1200px;
  margin: 20px auto 0;
  padding: 40px;
  background: 
    linear-gradient(var(--card-bg, white), var(--card-bg, white)) padding-box,
  linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box;
  border: 2px solid transparent;
  border-radius: 16px;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(30, 144, 255, 0.1));
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.friend-links-inner:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px var(--card-shadow, rgba(30, 144, 255, 0.2));
}

/* 标题样式 */
.section-header {
  margin-bottom: 30px;
  text-align: center;
}

.section-title {
  font-size: 2rem;
  color: var(--icon-primary, #1e90ff);
  background: var(--primary-gradient, linear-gradient(90deg, #73c2fb, #1e90ff));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 60%;
  background: var(--primary-gradient, linear-gradient(90deg, #73c2fb, #1e90ff));
  border-radius: 2px;
}

.section-title i {
  margin-right: 15px;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-color, #666);
  margin-bottom: 0;
}

/* 友链内容样式 */
.friend-links-content {
  padding: 20px 0;
}

/* 友情链接网格布局 */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.friend-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 15px;
  border-radius: 12px;
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.8));
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--card-shadow, rgba(30, 144, 255, 0.1));
}

.friend-link:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px var(--card-shadow, rgba(30, 144, 255, 0.15));
  background: var(--button-hover, rgba(30, 144, 255, 0.05));
}

.friend-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
  border: 2px solid transparent;
  background: 
    var(--card-bg, white) padding-box,
  var(--primary-gradient, linear-gradient(90deg, #73c2fb, #1e90ff)) border-box;
}

.friend-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
}

.friend-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color, #333);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.friend-desc {
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
  line-height: 1.3;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.exchange-note {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.6));
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(30, 144, 255, 0.2));
}

.exchange-note p {
  margin: 0;
  color: var(--text-secondary, #666);
  font-size: 1rem;
}

/* 主题适配 */
:root[data-theme="dark"] .friend-links-page {
  background: var(--card-bg, rgba(40, 40, 40, 0.8));
}

:root[data-theme="dark"] .friend-links-inner {
  background: 
    linear-gradient(var(--card-bg, #212121), var(--card-bg, #212121)) padding-box,
    linear-gradient(to right, var(--border-gradient, #9b8dda, #6b90ff, #7294d5, #b98db6)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0, 0, 0, 0.3));
}

:root[data-theme="dark"] .friend-links-inner:hover {
  box-shadow: 0 12px 25px var(--card-shadow, rgba(0, 0, 0, 0.4));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .friend-links-page {
    padding: 30px 0; /* 和其他页面保持一致 */
  }
  
  .friend-links-page::before {
    font-size: 10rem;
  }
  
  .friend-links-inner {
    width: 83%; /* 和其他页面保持一致 */
    padding: 20px; /* 和其他页面保持一致 */
    margin: 15px auto 0;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .friend-links-page {
    padding: 20px 0; /* 和其他页面保持一致 */
  }
  
  .friend-links-inner {
    width: 95%; /* 和其他页面保持一致 */
    padding: 15px; /* 和其他页面保持一致 */
    margin: 10px auto;
  }
  
  .section-title {
    font-size: 1.4rem; /* 进一步缩小标题 */
  }
  
  .friends-grid {
    grid-template-columns: 1fr; /* 小屏幕单列显示 */
    gap: 15px;
  }
  
  .friend-link {
    padding: 12px; /* 减少友链卡片内边距 */
  }
  
  .friend-avatar {
    width: 45px;
    height: 45px;
  }
  
  .exchange-note {
    padding: 15px; /* 减少提示区域内边距 */
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .friend-links-inner {
    width: 98%; /* 和其他页面保持一致 */
    padding: 12px; /* 进一步减少内边距 */
    margin: 5px auto;
  }
  
  .section-title {
    font-size: 1.2rem; /* 最小标题尺寸 */
  }
  
  .friend-link {
    padding: 10px; /* 最小友链卡片内边距 */
  }
  
  .friend-avatar {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .friend-name {
    font-size: 0.9rem;
    max-width: 150px;
  }
  
  .friend-desc {
    font-size: 0.8rem;
    max-width: 150px;
  }
  
  .exchange-note {
    padding: 12px; /* 最小提示区域内边距 */
  }
}
</style> 