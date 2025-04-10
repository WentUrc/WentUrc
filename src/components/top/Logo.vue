<template>
  <div class="logo-banner" :class="{ 'scrolled': !isAtTop }">
    <a href="/">
      <img src="/favicon.webp" alt="Logo" draggable="false" @contextmenu.prevent />
      <span class="logo-text">WentUrc</span>
    </a>
    
    <!-- 添加深色/浅色模式切换按钮喵！ -->
    <div class="theme-toggle">
      <button class="theme-toggle-btn" @click="toggleTheme">
        <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>
    
    <!-- 控制按钮 -->
    <div class="music-control">
      <div class="sidebar-button" @click="toggleMusicSidebar">
        <div class="button-inner">
          <i class="fas fa-bars"></i>
        </div>
      </div>
    </div>
    
    <!-- 遮罩层 - 用于点击关闭侧边栏 -->
    <transition name="fade">
      <div class="sidebar-overlay" v-if="musicSidebarVisible" @click="closeSidebar"></div>
    </transition>
    
    <!-- 侧边栏组件 - 修改了transition方式 -->
    <transition name="slide-fade">
      <div class="right-sidebar" v-if="musicSidebarVisible">
        <div class="sidebar-layout">
          <div class="sidebar-header">
            <h2>你好喵 ~ </h2>
            <button class="close-btn" @click="closeSidebar">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="sidebar-content">
            <TimeWidget />
            <DaylieWidget />
            <BackgroundMusic />
            <BlackLightWidget ref="blackLight" />
            <NeoLife />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import BackgroundMusic from './BackgroundMusic.vue'
import TimeWidget from './Time.vue'
import DaylieWidget from './Daylie.vue'
import BlackLightWidget from './BlackLight.vue'
import { applyThemeVariables } from '../../utils/root'
import NeoLife from './NeoLife.vue'

export default {
  name: 'Logo',
  components: {
    BackgroundMusic,
    TimeWidget,
    DaylieWidget,
    BlackLightWidget,
    NeoLife
  },
  data() {
    return {
      isAtTop: true,
      musicSidebarVisible: false,
      scrollPosition: 0,
      isDarkMode: false,
      currentScheme: 'default'
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('keydown', this.handleKeyDown);
    
    // 加载保存的主题设置喵～
    this.loadThemeSettings();
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('keydown', this.handleKeyDown);
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  },
  methods: {
    onScroll() {
      this.isAtTop = window.pageYOffset === 0;
    },
    toggleTheme() {
      // 切换主题模式喵！
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      
      // 同步主题设置到 BlackLight 组件喵！
      if (this.$refs.blackLight) {
        this.$refs.blackLight.isDarkMode = this.isDarkMode;
      }
      
      // 应用颜色方案喵～
      const mode = this.isDarkMode ? 'dark' : 'light';
      applyThemeVariables(mode, this.currentScheme);
      
      // 保存设置到本地喵～
      this.saveThemeSettings();
    },
    
    loadThemeSettings() {
      // 加载主题模式（明亮/黑暗）喵～
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode) {
        this.isDarkMode = savedMode === 'dark';
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      }
      
      // 加载配色方案喵～
      const savedScheme = localStorage.getItem('color-scheme');
      if (savedScheme) {
        this.currentScheme = savedScheme;
      }
    },
    
    saveThemeSettings() {
      localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
      localStorage.setItem('color-scheme', this.currentScheme);
    },
    
    toggleMusicSidebar() {
      this.musicSidebarVisible = !this.musicSidebarVisible;
      this.toggleBodyScroll();
    },
    
    closeSidebar() {
      this.musicSidebarVisible = false;
      this.enableScroll(); 
    },
    
    handleKeyDown(e) {
      if (e.key === 'Escape' && this.musicSidebarVisible) {
        this.closeSidebar();
      }
    },
    
    toggleBodyScroll() {
      if (this.musicSidebarVisible) {
        this.disableScroll();
      } else {
        this.enableScroll();
      }
    },
    
    // 禁用滚动的更强大方法
    disableScroll() {
      this.scrollPosition = window.pageYOffset;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
    },
    
    enableScroll() {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      window.scrollTo(0, this.scrollPosition);
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: "SHOECARD GOTHIC";
  src: url('/fonts/Showcard-Gothic.woff2') format('woff2'),
       url('/fonts/Showcard-Gothic.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.logo-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border-bottom: 4px solid transparent;
  border-image: linear-gradient(-45deg, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) 1;
  z-index: 90;
  transition: box-shadow 0.3s ease;
  opacity: 1;
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 移除了隐藏导航栏的样式，改为添加滚动时的阴影效果喵～ */
.logo-banner.scrolled {
  box-shadow: 0 2px 15px var(--card-shadow, rgba(0, 0, 0, 0.1));
}

.logo-banner a {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-banner a img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border: 3px solid var(--divider-color, #bdbbbb); 
  border-radius: 10px; 
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none; 
}

.logo-text {
  margin-left: 20px;
  font-weight: bold;
  font-size: 2rem;
  font-family: "SHOECARD GOTHIC", sans-serif;
  background: var(--primary-gradient, linear-gradient(45deg, #6b90ff, #531cf8, #505ce3));
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
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

/* 添加主题切换按钮样式喵！ */
.theme-toggle {
  position: relative;
  margin-left: auto; 
  margin-right: 15px;
}

/* 修改后的统一按钮样式 - 2px 轮廓 */
.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 10px var(--card-shadow, rgba(0, 0, 0, 0.1)),
    0 0 0 2px var(--divider-color, rgba(94, 96, 206, 0.15));
  position: relative;
  overflow: hidden;
  border: none;
  outline: none;
}

.theme-toggle-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient, linear-gradient(135deg, #dcbff8, #d1ecf9));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 16px var(--card-shadow, rgba(0, 0, 0, 0.15)),
    0 0 0 2px var(--icon-primary, rgba(94, 96, 206, 0.5));
}

.theme-toggle-btn:hover::before {
  opacity: 0.3;
}

.theme-toggle-btn:hover i {
  color: var(--icon-accent, #6b90ff);
  transform: scale(1.2) rotate(5deg);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

.theme-toggle-btn i {
  position: relative; 
  z-index: 1;
  color: var(--icon-primary, #5e60ce);
  font-size: 20px;
  transition: all 0.3s ease;
}

.music-control {
  position: relative;
}

/* 侧边栏按钮样式 - 使用2px轮廓 */
.sidebar-button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 10px var(--card-shadow, rgba(0, 0, 0, 0.1)),
    0 0 0 2px var(--divider-color, rgba(94, 96, 206, 0.15));
  position: relative;
  overflow: hidden;
  border: none;
}

/* 移除重复定义 */
.sidebar-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient, linear-gradient(135deg, #dcbff8, #d1ecf9));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.button-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 16px var(--card-shadow, rgba(0, 0, 0, 0.15)),
    0 0 0 2px var(--icon-primary, rgba(94, 96, 206, 0.5));
}

/* 悬停时让背景渐变更明显喵～ */
.sidebar-button:hover::before {
  opacity: 0.3;
}

.sidebar-button i {
  color: var(--icon-primary, #5e60ce);
  font-size: 18px;
  transition: all 0.3s ease;
}

/* 悬停时让图标颜色更突出喵～ */
.sidebar-button:hover i {
  color: var(--icon-accent, #6b90ff);
  transform: scale(1.2);
}

/* 修复遮罩层样式 - 更高透明度和正确的z-index喵～ */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  max-height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9997;
  cursor: pointer;
  pointer-events: auto;
}

/* 遮罩层动画效果 */
.fade-enter-active {
  transition: opacity 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.right-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 350px; 
  height: 100vh;
  max-height: 100vh;
  will-change: transform, opacity;
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: -5px 0 25px var(--card-shadow, rgba(0, 0, 0, 0.15));
  border-left: none;
  padding: 0;
  overflow-y: auto;
  z-index: 10001;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.right-sidebar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  border-radius: 2px;
}

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.sidebar-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid transparent;
  background: linear-gradient(90deg, transparent, var(--divider-color, #f0f0f0), transparent) bottom;
  background-size: 100% 2px;
  background-repeat: no-repeat;
}

.sidebar-header h2 {
  color: var(--icon-primary, #5e60ce);
  font-size: 24px;
  margin: 0;
  font-weight: 600;
  background: var(--primary-gradient, linear-gradient(45deg, #6b90ff, #5e60ce));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 2px var(--card-shadow, rgba(0,0,0,0.05));
}

.close-btn {
  background: var(--card-bg, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--button-border, rgba(94, 96, 206, 0.2));
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: var(--icon-primary, #5e60ce);
  transition: all 0.3s ease;
  outline: none;
}

.close-btn:hover {
  background: var(--button-hover, rgba(94, 96, 206, 0.1));
  transform: scale(1.1);
}

.close-btn:active {
  transform: scale(0.95);
  background: var(--button-active, rgba(94, 96, 206, 0.2));
}

/* 优化内容区域 */
.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 10px;
  margin-right: -10px;
}

/* 自定义滚动条 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--button-border, rgba(94, 96, 206, 0.3));
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--button-active, rgba(94, 96, 206, 0.5));
}

/* 响应式调整 */
@media (max-width: 768px) {
  .right-sidebar {
    width: 100%;
    border-radius: 0;
  }
  
  .right-sidebar::before {
    width: 0;
  }
  
  /* 替换为顶部渐变边界 */
  .right-sidebar::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  }
  
  .sidebar-button {
    width: 36px;
    height: 36px;
  }
  
  .theme-toggle-btn {
    width: 36px;
    height: 36px;
  }
  
  .theme-toggle {
    margin-right: 12px;
  }
}
</style>