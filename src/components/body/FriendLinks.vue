<template>
  <div class="friend-links-container">
    <div class="friend-links-inner">
      <div class="section-header">
        <h2 class="section-title">友情链接</h2>
      </div>
      
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
</template>

<script>
import friendLinksData from '../../assets/data/friendLinks.json';

export default {
  name: 'FriendLinks',
  data() {
    return {
      friendLinks: friendLinksData
    };
  }
}
</script>

<style scoped>
.friend-links-container {
  position: relative;
  max-width: 100%;
  margin: 0;
  padding: 80px 0; /* 增加上下内边距 */
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  min-height: 60vh; /* 稍微增加最小高度 */
  border: none;
  box-shadow: none;
  transition: background 0.3s ease;
  overflow: hidden;
  color: var(--text-color, #333);
  display: flex; /* 添加弹性布局 */
  flex-direction: column; /* 垂直排列 */
  justify-content: center; /* 垂直居中 */
}

/* 添加超大渐变文字背景 */
.friend-links-container::before {
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

/* 添加渐变色上边框 */
.friend-links-container::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff));
  z-index: 1;
}

/* 确保暗色模式下背景色保持一致 */
:root[data-theme="dark"] .friend-links-container {
  background: var(--card-bg, rgba(40, 40, 40, 0.8));
}

.friend-links-inner {
  position: relative;
  z-index: 2;
  width: 50%; /* 确保宽度为83% */
  max-width: 1200px; /* 添加最大宽度限制，避免在超大屏幕上过宽 */
  margin: 20px auto 0; /* 增加上间距 */
  padding: 40px; /* 增加内边距 */
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

/* 适配暗色主题内部容器背景 */
:root[data-theme="dark"] .friend-links-inner {
  background: 
    linear-gradient(var(--card-bg, #212121), var(--card-bg, #212121)) padding-box,
    linear-gradient(to right, var(--border-gradient, #9b8dda, #6b90ff, #7294d5, #b98db6)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(0, 0, 0, 0.3));
}

:root[data-theme="dark"] .friend-links-inner:hover {
  box-shadow: 0 12px 25px var(--card-shadow, rgba(0, 0, 0, 0.4));
}

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
  font-weight: 600;
  color: var(--icon-primary, #1e90ff);
  margin-bottom: 5px;
  font-size: 1rem;
}

.friend-desc {
  color: var(--text-color, #666);
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.exchange-note {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--divider-color, rgba(30, 144, 255, 0.2));
}

.exchange-note p {
  font-style: italic;
  color: var(--icon-accent, #73c2fb);
  font-size: 1rem;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .friend-links-container {
    padding: 50px 0; /* 移动端减少一些内边距 */
  }
  
  .friend-links-container::before {
    font-size: 10rem; /* 移动端上减小背景文字尺寸 */
  }
  
  .friend-links-inner {
    padding: 25px;
    margin: 15px auto 0; /* 使用auto使其水平居中 */
    width: 83%; /* 保持与桌面版一致的宽度比例 */
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .friend-desc {
    max-width: 220px;
  }
}

@media (max-width: 480px) {
  .friend-links-inner {
    width: 95%; /* 在超小屏幕上扩大宽度比例 */
    padding: 15px; /* 减少内边距 */
  }
  
  .friends-grid {
    gap: 15px; /* 减少网格间距 */
  }
  
  .friend-link {
    padding: 12px; /* 减少friend-link的内边距 */
    min-width: 0; /* 允许收缩到内容大小 */
  }
  
  .friend-desc {
    max-width: 150px; /* 进一步限制描述文字宽度 */
    font-size: 0.8rem;
  }
  
  .friend-avatar {
    width: 40px; /* 缩小头像尺寸 */
    height: 40px;
    margin-right: 12px;
  }
}

@media (max-width: 320px) {
  .friend-links-inner {
    width: 98%; /* 超小屏幕上最大化利用空间 */
    padding: 12px;
  }
  
  .friend-link {
    padding: 10px;
    flex-direction: column; /* 垂直排列头像和信息 */
    text-align: center;
  }
  
  .friend-avatar {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .friend-info {
    align-items: center;
  }
  
  .friend-desc {
    max-width: none; /* 移除宽度限制 */
    white-space: normal; /* 允许换行 */
    text-align: center;
  }
}
</style>
