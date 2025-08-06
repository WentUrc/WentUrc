<template>
  <div class="tab-navigation-container">
    <nav class="tab-navigation">
      <div class="tab-list" :class="{ 'mobile': isMobile }">
        <template v-for="(item, index) in navigationItems" :key="index">
          <!-- 内部链接使用RouterLink -->
          <router-link 
            v-if="!item.external"
            :to="item.to" 
            class="tab-item" 
            :class="{ 
              'active': $route.path === item.to
            }"
            @click="handleTabClick(item)"
            @contextmenu.prevent
            draggable="false"
            @dragstart.prevent
          >
            <div class="tab-content">
              <i :class="item.icon" class="tab-icon"></i>
              <span class="tab-label">{{ item.label }}</span>
            </div>
            <div class="tab-indicator"></div>
          </router-link>
          
          <!-- 外部链接使用普通a标签 -->
          <a 
            v-else
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="tab-item external"
            @contextmenu.prevent
            draggable="false"
            @dragstart.prevent
          >
            <div class="tab-content">
              <i :class="item.icon" class="tab-icon"></i>
              <span class="tab-label">{{ item.label }}</span>
            </div>
            <div class="tab-indicator"></div>
          </a>
        </template>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'TabNavigation',
  data() {
    return {
      isMobile: false,
      navigationItems: [
        {
          to: '/',
          label: '首页',
          icon: 'fas fa-home',
          external: false
        },
        {
          to: '/message-board',
          label: '留言板',
          icon: 'fas fa-comments',
          external: false
        },
        {
          to: '/friend-links',
          label: '友链',
          icon: 'fas fa-link',
          external: false
        },
        {
          href: 'https://docs.wenturc.com',
          label: '其他',
          icon: 'fas fa-external-link-alt',
          external: true
        }
      ]
    }
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768;
    },
    handleTabClick(item) {
      // 可以在这里添加点击事件的处理逻辑
      console.log('Tab clicked:', item);
    }
  }
}
</script>

<style scoped>
.tab-navigation-container {
  width: 100%;
  padding: 40px 20px 30px;
  display: flex;
  justify-content: center;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  position: relative;
}

.tab-navigation-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  z-index: 1;
}

.tab-navigation {
  width: 100%;
  max-width: 800px;
  position: relative;
}

.tab-list {
  display: flex;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  border-radius: 16px;
  padding: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 20px var(--card-shadow, rgba(0, 0, 0, 0.1)),
    0 0 0 1px var(--divider-color, rgba(255, 255, 255, 0.2)) inset;
  position: relative;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  text-align: center; /* 确保标签内容居中 */
  /* 禁用选中和拖拽 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.tab-list::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex: 1;
  min-width: 120px;
  padding: 16px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color, #666);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  overflow: hidden;
  text-align: center; /* 确保标签项内容居中 */
  /* 禁用文本选中和右键菜单 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none; /* 禁用iOS长按菜单 */
  -webkit-tap-highlight-color: transparent; /* 禁用移动端点击高亮 */
  /* 禁用拖拽 */
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.tab-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.tab-label {
  white-space: nowrap;
  transition: all 0.3s ease;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient, linear-gradient(90deg, #6b90ff, #5e60ce));
  border-radius: 3px 3px 0 0;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

/* 悬停效果 */
.tab-item:hover {
  color: var(--icon-primary, #5e60ce);
  background: var(--button-hover, rgba(94, 96, 206, 0.08));
  transform: translateY(-2px);
}

.tab-item:hover .tab-content {
  transform: scale(1.05);
}

.tab-item:hover .tab-indicator {
  transform: scaleX(0.7);
}

/* 激活状态 */
.tab-item.active {
  color: var(--icon-primary, #5e60ce);
  background: var(--button-active, rgba(94, 96, 206, 0.15));
  box-shadow: 
    0 4px 12px var(--card-shadow, rgba(94, 96, 206, 0.2)),
    0 0 0 1px var(--divider-color, rgba(94, 96, 206, 0.3)) inset;
}

.tab-item.active .tab-indicator {
  transform: scaleX(1);
}

.tab-item.active .tab-content {
  font-weight: 600;
}

/* 外部链接特殊样式 */
.tab-item.external {
  position: relative;
}

.tab-item.external::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: var(--icon-primary, #5e60ce);
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.tab-item.external:hover::after {
  opacity: 1;
  background: var(--icon-accent, #6b90ff);
  transform: scale(1.2);
}

.tab-item.external:hover {
  color: var(--icon-accent, #6b90ff);
}

/* 桌面端和平板端居中对齐 */
@media (min-width: 481px) {
  .tab-list {
    justify-content: center; /* 480px以上都居中，有足够空间 */
  }
}

/* 移动端优化 */
.tab-list.mobile {
  gap: 4px;
  padding: 6px;
}

/* 只有小屏幕的移动端才左对齐 */
@media (max-width: 480px) {
  .tab-list.mobile {
    justify-content: flex-start; /* 小屏幕移动端左对齐，确保可滚动 */
  }
}

.tab-list.mobile .tab-item {
  min-width: 100px;
  padding: 12px 16px;
  font-size: 0.9rem;
}

.tab-list.mobile .tab-icon {
  font-size: 1rem;
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .tab-navigation-container {
    padding: 30px 15px 25px;
  }
  
  .tab-item {
    flex: none;
    min-width: 90px;
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  
  .tab-label {
    display: block;
  }
  
  .tab-icon {
    font-size: 0.95rem;
  }
}

/* 超小屏幕 - 仅显示图标 */
@media (max-width: 480px) {
  .tab-navigation-container {
    padding: 25px 10px 20px;
  }
  
  .tab-list {
    justify-content: flex-start; /* 超小屏幕使用左对齐，确保可滚动 */
  }
  
  .tab-item {
    min-width: 60px;
    padding: 8px 12px;
  }
  
  .tab-label {
    display: none;
  }
  
  .tab-content {
    gap: 0;
  }
  
  .tab-icon {
    font-size: 1.1rem;
  }
}

/* 动画效果 */
@keyframes tabSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-navigation {
  animation: tabSlideIn 0.6s ease-out;
}

/* 深色主题适配 */
[data-theme="dark"] .tab-list {
  background: var(--card-bg, rgba(0, 0, 0, 0.7));
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

[data-theme="dark"] .tab-item:hover {
  background: var(--button-hover, rgba(255, 255, 255, 0.1));
}

[data-theme="dark"] .tab-item.active {
  background: var(--button-active, rgba(255, 255, 255, 0.15));
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}
</style> 