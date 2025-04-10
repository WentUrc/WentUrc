<template>
    <div class="theme-widget" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <div class="theme-card" :class="{ 'hovered': isHovered }">
        <!-- 标题栏 -->
        <div class="header-row">
          <div class="card-title">主题喵✨</div>
          <div class="theme-icon">
            <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
          </div>
        </div>
        
        <!-- 主题切换开关 -->
        <div class="theme-content">
          <div class="mode-switch">
            <div class="mode-label">
              <i class="fas fa-sun"></i>
              <span>亮色</span>
            </div>
            
            <label class="switch">
              <input type="checkbox" v-model="isDarkMode" @change="toggleTheme">
              <span class="slider"></span>
            </label>
            
            <div class="mode-label">
              <i class="fas fa-moon"></i>
              <span>暗色</span>
            </div>
          </div>
          
          <!-- 主题预览 -->
          <div class="theme-preview" :class="{ 'dark': isDarkMode }">
            <div class="preview-card">
              <div class="preview-header"></div>
              <div class="preview-content">
                <div class="preview-line"></div>
                <div class="preview-line"></div>
              </div>
            </div>
          </div>
          
          <!-- 颜色方案 -->
          <div class="color-schemes">
            <h4>配色方案</h4>
            <div class="scheme-options">
              <button 
                v-for="scheme in colorSchemes" 
                :key="scheme.id" 
                class="scheme-btn"
                :class="{ 'active': currentScheme === scheme.id }"
                @click="setColorScheme(scheme.id)"
              >
                <span class="color-dot" :style="{ background: scheme.primary }"></span>
                <span class="scheme-name">{{ scheme.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // 导入主题管理器中的应用函数喵～
  import { applyThemeVariables } from '../../utils/root'
  
  export default {
    name: 'BlackLightWidget',
    data() {
      return {
        isHovered: false,
        isDarkMode: false,
        currentScheme: 'default',
        colorSchemes: [
          {
            id: 'default',
            name: '默认紫蓝',
            primary: 'linear-gradient(45deg, #6b90ff, #5e60ce)',
            light: {
              bg: '#ffffff',
              text: '#333333',
              border: '#dcbff8, #d1ecf9, #c6e2ff, #f9d1dc'
            },
            dark: {
              bg: '#212121',
              text: '#f1f1f1',
              border: '#9b8dda, #6b90ff, #7294d5, #b98db6'
            }
          },
          {
            id: 'pink',
            name: '粉色少女',
            primary: 'linear-gradient(45deg, #ff6b6b, #d471d4)',
            light: {
              bg: '#ffffff',
              text: '#333333',
              border: '#ffcece, #ffc2f9, #ffb3ef, #ffb8d9'
            },
            dark: {
              bg: '#212121', 
              text: '#f1f1f1',
              border: '#d76d6d, #c160c1, #db6aba, #d66d9e'
            }
          },
          {
            id: 'green',
            name: '森林绿意',
            primary: 'linear-gradient(45deg, #69db7c, #38d9a9)',
            light: {
              bg: '#ffffff',
              text: '#333333',
              border: '#c2f9cc, #b3efd1, #a9e9c8, #bef7d8'
            },
            dark: {
              bg: '#212121',
              text: '#f1f1f1',
              border: '#5cba6a, #35b288, #36b283, #4aba78'
            }
          }
        ]
      }
    },
    created() {
      // 从本地存储加载主题设置喵～
      this.loadThemeSettings();
    },
    methods: {
      toggleTheme() {
        // 切换明暗主题喵～
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        this.saveThemeSettings();
        
        // 确保当前配色方案在切换后也应用喵～
        this.setColorScheme(this.currentScheme);
      },
      
      setColorScheme(schemeId) {
        this.currentScheme = schemeId;
        
        // 找到选中的主题喵～
        const scheme = this.colorSchemes.find(s => s.id === schemeId);
        if (!scheme) return;
        
        // 使用 data 属性方式设置颜色方案喵～
        const root = document.documentElement;
        
        if (schemeId === 'default') {
          root.removeAttribute('data-color-scheme');
        } else {
          root.setAttribute('data-color-scheme', schemeId);
        }
        
        const mode = this.isDarkMode ? 'dark' : 'light';
        
        // 使用主题管理器的函数应用变量喵～
        applyThemeVariables(mode, schemeId);
        
        // 保存设置喵～
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
          this.setColorScheme(this.currentScheme);
        } else {
          // 默认方案喵～
          this.setColorScheme('default');
        }
      },
      
      saveThemeSettings() {
        localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
        localStorage.setItem('color-scheme', this.currentScheme);
      }
    }
  };
  </script>
  
  <style scoped>
  .theme-widget {
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .theme-card {
    position: relative;
    width: 100%;
    padding: 15px;
    box-sizing: border-box;
    background: 
      linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg, rgba(255, 255, 255, 0.8))) padding-box,
      linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
    border: 4px solid transparent;
    border-radius: 16px;
    transition: all 0.4s ease;
    display: flex;
    flex-direction: column;
  }
  
  .theme-card.hovered {
    transform: translateX(0) scale(1.02);
    background:
      linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.95)), var(--card-bg-hover, rgba(255, 255, 255, 0.95))) padding-box,
      linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
    box-shadow: 0 8px 20px var(--card-shadow, rgba(91, 81, 200, 0.25));
  }
  
  /* 标题栏 */
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .card-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--icon-primary, #5e60ce);
  }
  
  .theme-icon {
    width: 32px;
    height: 32px;
    background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease;
  }
  
  .theme-icon i {
    color: white;
    font-size: 16px;
    transition: all 0.5s ease;
  }
  
  /* 主题内容区域 */
  .theme-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* 模式切换 */
  .mode-switch {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .mode-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #666;
    font-size: 14px;
  }
  
  .mode-label i {
    font-size: 16px;
  }
  
  .mode-label:first-child i {
    color: #f1b944;
  }
  
  .mode-label:last-child i {
    color: #6b90ff;
  }
  
  /* 开关样式 */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #ffc93c, #f1b944);
    transition: all 0.4s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: all 0.4s;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  input:checked + .slider {
    background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
  
  /* 主题预览区 */
  .theme-preview {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 10px;
    height: 80px;
    transition: all 0.3s ease;
  }
  
  .theme-preview.dark {
    background-color: #333;
  }
  
  .preview-card {
    background: white;
    border-radius: 6px;
    height: 100%;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .theme-preview.dark .preview-card {
    background: #222;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .preview-header {
    height: 20px;
    background: linear-gradient(to right, #dcbff8, #d1ecf9);
    transition: all 0.3s ease;
  }
  
  .theme-preview.dark .preview-header {
    background: linear-gradient(to right, #5e60ce, #6b90ff);
  }
  
  .preview-content {
    padding: 10px;
  }
  
  .preview-line {
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    margin-bottom: 8px;
    transition: all 0.3s ease;
  }
  
  .theme-preview.dark .preview-line {
    background: #444;
  }
  
  /* 颜色方案区域 */
  .color-schemes {
    margin-top: 5px;
  }
  
  .color-schemes h4 {
    font-size: 14px;
    color: #666;
    margin: 0 0 10px 0;
    font-weight: 500;
  }
  
  .scheme-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .scheme-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid var(--button-border, rgba(94, 96, 206, 0.2));
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }
  
  .scheme-btn:hover {
    background: var(--button-hover, rgba(94, 96, 206, 0.05));
    transform: translateX(3px);
  }
  
  .scheme-btn.active {
    background: var(--button-active, rgba(94, 96, 206, 0.1));
    border-color: var(--button-border, rgba(94, 96, 206, 0.4));
  }
  
  .color-dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }
  
  .scheme-name {
    font-size: 14px;
    color: var(--text-color, #333);
  }
  
  /* 响应式调整 */
  @media (max-width: 768px) {
    .mode-label span {
      display: none;
    }
    
    .scheme-btn {
      padding: 4px 10px;
    }
    
    .scheme-name {
      font-size: 13px;
    }
  }
  </style>