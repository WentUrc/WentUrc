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
          <h4>配色板</h4>
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
        
        <!-- 成就提示 -->
        <div class="achievement-hint" v-if="!achievementUnlocked">
          <i class="fas fa-trophy hint-icon"></i>
          <span>更换主题可以解锁成就喔～</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入主题管理器中的应用函数喵～
import { applyThemeVariables } from '../../utils/root'
import eventBus from '../../utils/eventBus.js'

export default {
  name: 'BlackLightWidget',
  data() {
    return {
      isHovered: false,
      isDarkMode: false,
      currentScheme: 'default',
      achievementUnlocked: false,
      initialLoad: true,
      colorSchemes: [
        {
          id: 'default',
          name: '自由天蓝',
          primary: 'linear-gradient(45deg, #73c2fb, #1e90ff)',
          light: {
            bg: '#ffffff',
            text: '#333333',
            border: '#cfefff, #d6f3ff, #bfe4ff, #e0f7ff'
          },
          dark: {
            bg: '#212121',
            text: '#f1f1f1',
            border: '#4aa3e0, #73c2fb, #4da3ff, #5aa9f6'
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
    this.loadThemeSettings();
    this.checkAchievementStatus();
    this.$nextTick(() => {
      this.initialLoad = false;
    });
  },
  methods: {
    toggleTheme() {
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      this.saveThemeSettings();
      this.setColorScheme(this.currentScheme, true);
      this.$emit('theme-changed', {
        isDarkMode: this.isDarkMode,
        scheme: this.currentScheme
      });
      this.triggerAchievement();
    },
    
    setColorScheme(schemeId, isUserAction = false) {
      if (this.currentScheme === schemeId && !isUserAction) {
        this.currentScheme = schemeId;
        return;
      }
      
      const oldScheme = this.currentScheme;
      this.currentScheme = schemeId;
      const scheme = this.colorSchemes.find(s => s.id === schemeId);
      if (!scheme) return;
      const root = document.documentElement;
      
      if (schemeId === 'default') {
        root.removeAttribute('data-color-scheme');
      } else {
        root.setAttribute('data-color-scheme', schemeId);
      }
      
      const mode = this.isDarkMode ? 'dark' : 'light';
      applyThemeVariables(mode, schemeId);
      this.saveThemeSettings();
      
      if ((isUserAction || (oldScheme !== schemeId)) && !this.initialLoad) {
        this.$emit('theme-changed', {
          isDarkMode: this.isDarkMode,
          scheme: this.currentScheme
        });
        this.triggerAchievement();
      }
    },
    
    loadThemeSettings() {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode) {
        this.isDarkMode = savedMode === 'dark';
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      }
      
      const previousScheme = this.currentScheme;
      const savedScheme = localStorage.getItem('color-scheme');
      if (savedScheme) {
        this.currentScheme = savedScheme;
        const scheme = this.colorSchemes.find(s => s.id === savedScheme);
        if (!scheme) return;
    
        const root = document.documentElement;
        
        if (savedScheme === 'default') {
          root.removeAttribute('data-color-scheme');
        } else {
          root.setAttribute('data-color-scheme', savedScheme);
        }
        
        const mode = this.isDarkMode ? 'dark' : 'light';
        
        applyThemeVariables(mode, savedScheme);
      } else {
        this.currentScheme = 'default';
        document.documentElement.removeAttribute('data-color-scheme');
        const mode = this.isDarkMode ? 'dark' : 'light';
        applyThemeVariables(mode, 'default');
      }
    },
    
    saveThemeSettings() {
      localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
      localStorage.setItem('color-scheme', this.currentScheme);
    },
    
    triggerAchievement() {
      eventBus.emit('theme-changed');
      this.achievementUnlocked = true;
      localStorage.setItem('theme-achievement-unlocked', 'true');
    },
    
    checkAchievementStatus() {
      const unlocked = localStorage.getItem('theme-achievement-unlocked') === 'true';
      this.achievementUnlocked = unlocked;

      const achievementsData = localStorage.getItem('wenturc-achievements');
      if (achievementsData) {
        try {
          const achievements = JSON.parse(achievementsData);
          if (achievements['theme-changer'] && achievements['theme-changer'].unlocked) {
            this.achievementUnlocked = true;
          }
        } catch (e) {
          console.error('解析成就数据失败', e);
        }
      }
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
  linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box;
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
    linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(30, 144, 255, 0.25));
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
  color: var(--icon-primary, #1e90ff);
}

.theme-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff));
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
  color: #1e90ff;
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
  background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff));
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
  background: linear-gradient(to right, #cfefff, #d6f3ff);
  transition: all 0.3s ease;
}

.theme-preview.dark .preview-header {
  background: linear-gradient(to right, #73c2fb, #1e90ff);
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
  border: 1px solid var(--button-border, rgba(30, 144, 255, 0.2));
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.scheme-btn:hover {
  background: var(--button-hover, rgba(30, 144, 255, 0.05));
  transform: translateX(3px);
}

.scheme-btn.active {
  background: var(--button-active, rgba(30, 144, 255, 0.1));
  border-color: var(--button-border, rgba(30, 144, 255, 0.4));
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

/* 成就提示样式 */
.achievement-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--button-hover, rgba(30, 144, 255, 0.05));
  border-radius: 8px;
  font-size: 13px;
  color: var(--icon-primary, #1e90ff);
  border: 1px dashed var(--button-border, rgba(30, 144, 255, 0.3));
  margin-top: 5px;
  animation: pulse-hint 2s infinite alternate;
}

.hint-icon {
  color: gold;
  animation: rotate-icon 3s infinite ease;
}

@keyframes pulse-hint {
  from { opacity: 0.8; transform: scale(0.99); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes rotate-icon {
  0% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  100% { transform: rotate(-15deg); }
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
  
  .achievement-hint {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>