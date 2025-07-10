<template>
  <div class="logo-banner" :class="{ 'scrolled': !isAtTop }">
    <a href="/" @click.prevent="handleLogoClick" class="logo-link">
      <img ref="logoImg" src="/favicon.webp" alt="Logo" draggable="false" @contextmenu.prevent />
      <span class="logo-text">WentUrc</span>
    </a>
    
    <div class="theme-toggle">
      <button class="theme-toggle-btn" @click="toggleTheme">
        <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>
    
    <div class="music-control">
      <div class="sidebar-button" @click="toggleMusicSidebar">
        <div class="button-inner">
          <i class="fas fa-bars"></i>
        </div>
      </div>
    </div>
    
    <transition name="fade">
      <div class="sidebar-overlay" v-if="musicSidebarVisible" @click="closeSidebar"></div>
    </transition>
    
    <transition name="slide-fade">
      <div class="right-sidebar" v-if="musicSidebarVisible" :style="{ width: sidebarWidth + 'px' }">
        <!-- 拖拽调整条 (仅桌面端显示) -->
        <div v-if="!isMobile" class="resize-handle" @mousedown="startResize" @touchstart="startResize"></div>
        <div class="sidebar-layout">
          <div class="sidebar-header">
            <h2>你好喵 ~ </h2>
            <button class="close-btn" @click="closeSidebar">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="sidebar-content">
            <TimeWidget />
            <BackgroundMusic />
            <BlackLightWidget ref="blackLight" @theme-changed="onThemeChanged" />
            <IframeWidget />
            <NeoLife />
            <!-- 添加底部间隔占位元素 -->
            <div class="bottom-spacer"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import BackgroundMusic from './BackgroundMusic.vue'
import TimeWidget from './Time.vue'
import BlackLightWidget from './BlackLight.vue'
import { applyThemeVariables } from '../../utils/root'
import NeoLife from './NeoLife.vue'
import IframeWidget from '../other/IframeWidget.vue'
import logoGame from '../other/achievements/easter-eggs/LogoGame.js'

export default {
  name: 'Logo',
  components: {
    BackgroundMusic,
    TimeWidget,
    BlackLightWidget,
    NeoLife,
    IframeWidget
  },
  data() {
    return {
      isAtTop: true,
      musicSidebarVisible: false,
      scrollPosition: 0,
      isDarkMode: false,
      currentScheme: 'default',
      logoLastClickTime: 0,
      logoClickCount: 0,
      CLICK_TIMEOUT: 2000,
      isMobile: false, // 新增：用于判断是否为移动端
      sidebarWidth: 350, // 侧边栏宽度
      isResizing: false, // 是否正在调整大小
      minSidebarWidth: 300, // 最小宽度
      maxSidebarWidth: 600 // 最大宽度
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.onResize); // 添加窗口大小变化监听
    
    this.loadThemeSettings();
    this.checkScreenSize(); // 初始检查屏幕尺寸
    this.loadSidebarWidth(); // 加载保存的侧边栏宽度
    
    logoGame.initialize({ 
      vueComponent: this,
      element: this.$refs.logoImg
    });
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.onResize); // 移除窗口大小变化监听
    
    logoGame.cleanup();
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // 清理拖拽相关的事件监听器
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);
    document.removeEventListener('touchmove', this.handleResize);
    document.removeEventListener('touchend', this.stopResize);
  },
  methods: {
    handleLogoClick(event) {
      event.preventDefault();
      event.stopPropagation();
      
      const now = Date.now();
      
      if (now - this.logoLastClickTime < this.CLICK_TIMEOUT) {
        this.logoClickCount++;
        
        if (this.logoClickCount >= 5) {
          if (this.$refs.logoImg) {
            this.$refs.logoImg.classList.add('game-active');
            setTimeout(() => {
              this.$refs.logoImg.classList.remove('game-active');
            }, 2000);
          }
          
          import('../../utils/eventBus.js').then(module => {
            const eventBus = module.default;
            eventBus.emit('achievement-unlocked', 'logo-game');
          });
          
          setTimeout(() => {
            this.logoClickCount = 0;
          }, 2000);
        }
      } else {
        this.logoClickCount = 1;
        
        setTimeout(() => {
          if (this.logoClickCount === 1) {
            this.goHome();
          }
        }, 300);
      }
      
      this.logoLastClickTime = now;
      return false;
    },
    
    goHome() {
      if (window.location.pathname === '/') {
        window.location.reload();
      } else {
        window.location.href = '/';
      }
    },
    
    onScroll() {
      const scrollY = window.pageYOffset;
      this.isAtTop = scrollY === 0;
    },

    onResize() {
      this.checkScreenSize();
    },

    checkScreenSize() {
      this.isMobile = window.innerWidth <= 425; // 425px及以下为移动端
    },
    
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      
      const savedScheme = localStorage.getItem('color-scheme') || this.currentScheme;
      this.currentScheme = savedScheme;
      
      if (this.$refs.blackLight) {
        this.$refs.blackLight.isDarkMode = this.isDarkMode;
      }
      
      const mode = this.isDarkMode ? 'dark' : 'light';
      applyThemeVariables(mode, this.currentScheme);
      
      this.saveThemeSettings();
    },
    
    onThemeChanged(themeData) {
      this.isDarkMode = themeData.isDarkMode;
      this.currentScheme = themeData.scheme;
    },
    
    loadThemeSettings() {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode) {
        this.isDarkMode = savedMode === 'dark';
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      }
      
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
      
      this.syncThemeFromStorage();
    },
    
    syncThemeFromStorage() {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode) {
        this.isDarkMode = savedMode === 'dark';
      }
      
      const savedScheme = localStorage.getItem('color-scheme');
      if (savedScheme) {
        this.currentScheme = savedScheme;
      }
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
    },
    
    // 侧边栏宽度调整相关方法
    loadSidebarWidth() {
      const savedWidth = localStorage.getItem('sidebar-width');
      if (savedWidth) {
        const width = parseInt(savedWidth);
        if (width >= this.minSidebarWidth && width <= this.maxSidebarWidth) {
          this.sidebarWidth = width;
        }
      }
    },
    
    saveSidebarWidth() {
      localStorage.setItem('sidebar-width', this.sidebarWidth.toString());
    },
    
    startResize(event) {
      if (this.isMobile) return; // 移动端不允许调整
      
      this.isResizing = true;
      
      // 判断是触摸事件还是鼠标事件
      const isTouch = event.type === 'touchstart';
      
      if (isTouch) {
        document.addEventListener('touchmove', this.handleResize, { passive: false });
        document.addEventListener('touchend', this.stopResize);
      } else {
        document.addEventListener('mousemove', this.handleResize);
        document.addEventListener('mouseup', this.stopResize);
        document.body.style.cursor = 'ew-resize';
      }
      
      document.body.style.userSelect = 'none';
      event.preventDefault();
    },
    
    handleResize(event) {
      if (!this.isResizing) return;
      
      // 获取正确的坐标（触摸或鼠标）
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      
      // 计算新宽度 (从右边缘向左的距离)
      const newWidth = window.innerWidth - clientX;
      
      // 限制在最小和最大宽度范围内
      if (newWidth >= this.minSidebarWidth && newWidth <= this.maxSidebarWidth) {
        this.sidebarWidth = newWidth;
      }
      
      // 阻止触摸事件的默认行为（避免页面滚动）
      if (event.touches) {
        event.preventDefault();
      }
    },
    
    stopResize() {
      this.isResizing = false;
      
      // 移除所有可能的事件监听器
      document.removeEventListener('mousemove', this.handleResize);
      document.removeEventListener('mouseup', this.stopResize);
      document.removeEventListener('touchmove', this.handleResize);
      document.removeEventListener('touchend', this.stopResize);
      
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      this.saveSidebarWidth();
    }
  },
  watch: {
    musicSidebarVisible(newValue) {
      if (!newValue) {
        this.syncThemeFromStorage();
      }
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

.logo-banner.scrolled {
  box-shadow: 0 2px 15px var(--card-shadow, rgba(0, 0, 0, 0.1));
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-link img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border: 3px solid var(--divider-color, #bdbbbb); 
  border-radius: 10px; 
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none; 
  transition: all 0.3s ease;
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

.theme-toggle {
  position: relative;
  margin-left: auto; 
  margin-right: 15px;
}

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

.sidebar-button:hover::before {
  opacity: 0.3;
}

.sidebar-button i {
  color: var(--icon-primary, #5e60ce);
  font-size: 18px;
  transition: all 0.3s ease;
}

.sidebar-button:hover i {
  color: var(--icon-accent, #6b90ff);
  transform: scale(1.2);
}

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
  /* width由动态样式控制 */
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

/* 拖拽调整条样式 */
.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  z-index: 10002;
  background: transparent;
  transition: opacity 0.3s ease;
}

/* 拖拽指示器 */
.resize-handle::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background: repeating-linear-gradient(
    to bottom,
    var(--icon-primary, rgba(94, 96, 206, 0.2)) 0px,
    var(--icon-primary, rgba(94, 96, 206, 0.2)) 2px,
    transparent 2px,
    transparent 4px
  );
  border-radius: 2px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.resize-handle:hover::before {
  opacity: 1;
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

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 10px;
  margin-right: -10px;
}

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

/* 添加明显的底部间隔元素 - 默认为0高度（桌面端） */
.bottom-spacer {
  height: 0;
  width: 100%;
}

@keyframes logoGameAnimation {
  0% { transform: scale(1); }
  25% { transform: scale(1.2) rotate(5deg); }
  50% { transform: scale(1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}

.logo-link img.game-active {
  animation: logoGameAnimation 0.5s ease-in-out 4;
  border-color: var(--icon-accent, #6b90ff);
}





@media (max-width: 768px) {
  .logo-banner {
    padding: 0 15px; /* 减少整体内边距 */
  }
  
  .logo-text {
    font-size: 1.6rem; /* 在移动端缩小logo文字 */
    margin-left: 15px;
  }
  
  .right-sidebar {
    width: 100% !important; /* 移动端强制全宽，覆盖动态宽度 */
    border-radius: 0;
    /* 增加底部内边距，确保在所有设备上都有效 */
    padding-bottom: max(60px, env(safe-area-inset-bottom, 60px));
  }
  
  /* 移动端隐藏拖拽调整条 */
  .resize-handle {
    display: none;
  }
  
  .right-sidebar::before {
    width: 0;
  }
  
  .right-sidebar::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  }
  
  /* 调整底部间隔在移动端的高度 */
  .bottom-spacer {
    height: 120px; /* 移动端设置更高的间隔 */
  }
  
  .sidebar-button {
    width: 32px; /* 缩小按钮尺寸 */
    height: 32px;
  }
  
  .theme-toggle-btn {
    width: 32px; /* 缩小按钮尺寸 */
    height: 32px;
  }
  
  .theme-toggle {
    margin-right: 8px; /* 减少边距 */
  }

}

/* 针对更小的屏幕进一步优化 */
@media (max-width: 480px) {
  .logo-banner {
    padding: 0 10px; /* 进一步减少内边距 */
  }
  
  .logo-text {
    font-size: 1.4rem; /* 更小的logo文字 */
    margin-left: 10px;
  }
  

  
  .sidebar-button {
    width: 30px; /* 更小的按钮 */
    height: 30px;
  }
  
  .theme-toggle-btn {
    width: 30px; /* 更小的按钮 */
    height: 30px;
  }
  
  .theme-toggle {
    margin-right: 6px;
  }
}



/* 兼容性更强的底部安全区域适配 */
@supports (padding: max(0px)) {
  /* 移除桌面端的底部间隔 */
  .bottom-spacer {
    height: 0;
  }
  
  @media (max-width: 768px) {
    .bottom-spacer {
      height: max(120px, env(safe-area-inset-bottom, 120px) + 60px);
    }
  }
}
</style>