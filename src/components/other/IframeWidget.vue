<template>
  <div class="iframe-widget">
    <div class="iframe-header">
      <h3 class="iframe-title">
        <i class="fas fa-globe"></i>
        {{ widgetTitle }}
      </h3>
      <div class="iframe-controls">
        <button @click="refreshIframe" class="control-btn" title="刷新">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
        </button>
        <button @click="openInNewTab" class="control-btn" title="新窗口打开">
          <i class="fas fa-external-link-alt"></i>
        </button>
        <button @click="toggleCollapse" class="control-btn" title="收起/展开">
          <i :class="isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
        </button>
      </div>
    </div>
    
    <transition name="slide-fade">
      <div v-if="!isCollapsed" class="iframe-content">
        <div class="iframe-container">
          <iframe 
            ref="iframe"
            :src="iframeSrc" 
            :title="widgetTitle"
            frameborder="0"
            class="widget-iframe"
            allowfullscreen
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            @load="handleIframeLoad"
            @error="handleIframeError"
          ></iframe>
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>加载中喵♡～</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-if="hasError" class="error-overlay">
            <i class="fas fa-exclamation-triangle"></i>
            <p>加载失败了喵 T_T</p>
            <button @click="retryLoad" class="retry-btn">重试</button>
          </div>
        </div>
        
        <!-- URL输入框 -->
        <div class="url-input-section">
          <div class="url-input-group">
            <input 
              v-model="urlInput" 
              type="url" 
              placeholder="输入网址..."
              class="url-input"
              @keyup.enter="loadUrl"
            />
            <button @click="loadUrl" class="load-btn">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          
          <!-- 快捷网址 -->
          <div class="quick-links">
            <button 
              v-for="link in quickLinks" 
              :key="link.name"
              @click="loadQuickLink(link.url)"
              class="quick-link-btn"
              :title="link.name"
            >
              <i :class="link.icon"></i>
              <span>{{ link.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'IframeWidget',
  data() {
    return {
      widgetTitle: '小工具',
      iframeSrc: 'https://www.bing.com/search?q=cute+cats', // 默认显示必应搜索可爱猫咪
      urlInput: '',
      isLoading: true,
      hasError: false,
      isRefreshing: false,
      isCollapsed: false,
      quickLinks: [
        {
          name: '天气',
          url: 'https://wttr.in/',
          icon: 'fas fa-cloud-sun'
        },
        {
          name: '时钟',
          url: 'https://time.is/',
          icon: 'fas fa-clock'
        },
        {
          name: '我的位置',
          url: 'https://find.wenturc.com/',
          icon: 'fas fa-language'
        },
        {
          name: '计算器',
          url: 'https://www.calculator.net/',
          icon: 'fas fa-calculator'
        }
      ]
    }
  },
  mounted() {
    // 从本地存储恢复状态
    const savedState = localStorage.getItem('iframe-widget-state')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        this.isCollapsed = state.isCollapsed || false
        this.iframeSrc = state.lastUrl || this.iframeSrc
        this.urlInput = this.iframeSrc
      } catch (error) {
        console.error('恢复iframe状态失败:', error)
      }
    }
    this.urlInput = this.iframeSrc
  },
  methods: {
    handleIframeLoad() {
      this.isLoading = false
      this.hasError = false
      this.isRefreshing = false
    },
    handleIframeError() {
      this.isLoading = false
      this.hasError = true
      this.isRefreshing = false
    },
    refreshIframe() {
      if (this.isRefreshing) return
      
      this.isRefreshing = true
      this.isLoading = true
      this.hasError = false
      
      const iframe = this.$refs.iframe
      if (iframe) {
        iframe.src = iframe.src
      }
      
      // 5秒后停止刷新动画
      setTimeout(() => {
        this.isRefreshing = false
      }, 5000)
    },
    retryLoad() {
      this.hasError = false
      this.isLoading = true
      this.refreshIframe()
    },
    openInNewTab() {
      window.open(this.iframeSrc, '_blank', 'noopener,noreferrer')
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
      this.saveState()
    },
    loadUrl() {
      const url = this.urlInput.trim()
      if (!url) return
      
      // 简单的URL验证和补全
      let finalUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url
      }
      
      this.iframeSrc = finalUrl
      this.isLoading = true
      this.hasError = false
      this.saveState()
    },
    loadQuickLink(url) {
      this.urlInput = url
      this.loadUrl()
    },
    saveState() {
      const state = {
        isCollapsed: this.isCollapsed,
        lastUrl: this.iframeSrc
      }
      localStorage.setItem('iframe-widget-state', JSON.stringify(state))
    }
  }
}
</script>

<style scoped>
.iframe-widget {
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg, rgba(255, 255, 255, 0.8))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  border: 4px solid transparent;
  border-radius: 16px;
  margin-bottom: 20px;
  padding: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.iframe-widget:hover {
  transform: translateX(0) scale(1.02);
  background:
    linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.95)), var(--card-bg-hover, rgba(255, 255, 255, 0.95))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(91, 81, 200, 0.25));
}

.iframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.iframe-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--icon-primary, #5e60ce);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.iframe-title i {
  color: var(--icon-primary, #5e60ce);
  font-size: 1rem;
}

.iframe-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  background: none;
  border: 1px solid var(--button-border, rgba(94, 96, 206, 0.3));
  border-radius: 6px;
  padding: 6px 8px;
  color: var(--icon-primary, #5e60ce);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.control-btn:hover {
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
  transform: translateY(-1px);
}

.iframe-content {
  /* padding已经在外层设置 */
}

.iframe-container {
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e9ecef);
  margin-bottom: 12px;
}

.widget-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-color, #333);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color, #e9ecef);
  border-top: 2px solid var(--icon-primary, #5e60ce);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-overlay i {
  font-size: 1.5rem;
  color: var(--error-color, #dc3545);
  margin-bottom: 8px;
}

.retry-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--primary-gradient, linear-gradient(45deg, #6b90ff, #5e60ce));
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: opacity 0.3s ease;
}

.retry-btn:hover {
  opacity: 0.8;
}

.url-input-section {
  space-y: 12px;
}

.url-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--content-bg, #ffffff);
  color: var(--text-color, #333);
  transition: border-color 0.3s ease;
}

.url-input:focus {
  outline: none;
  border-color: var(--icon-primary, #5e60ce);
}

.load-btn {
  padding: 8px 12px;
  background: var(--primary-gradient, linear-gradient(45deg, #6b90ff, #5e60ce));
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.load-btn:hover {
  opacity: 0.8;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-link-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: var(--card-bg, rgba(255, 255, 255, 0.5));
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 6px;
  color: var(--text-color, #333);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  min-height: 36px;
  text-align: left;
}

.quick-link-btn:hover {
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
  border-color: var(--icon-primary, #5e60ce);
  transform: translateY(-1px);
}

.quick-link-btn i {
  color: var(--icon-primary, #5e60ce);
  font-size: 14px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
  line-height: 1;
  display: inline-block;
}

.quick-link-btn span {
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
  flex-grow: 1;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .iframe-container {
    height: 250px;
  }
  
  .quick-links {
    grid-template-columns: 1fr;
  }
  
  .quick-link-btn {
    min-height: 40px;
    padding: 10px 14px;
  }
  
  .control-btn {
    padding: 4px 6px;
    font-size: 0.7rem;
  }
}
</style> 