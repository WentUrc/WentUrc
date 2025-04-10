/**
 * 主题管理工具喵～
 * 负责在应用启动时立即应用保存的主题设置喵！
 */

/**
 * 初始化主题设置
 * 在应用刚启动时就立即执行喵～
 */
export function initializeTheme() {
  // 首先从本地存储加载主题模式（明亮/黑暗）喵～
  const savedMode = localStorage.getItem('theme-mode');
  if (savedMode) {
    document.documentElement.setAttribute('data-theme', savedMode);
  }
  
  // 再来加载配色方案喵～
  const savedScheme = localStorage.getItem('color-scheme');
  if (savedScheme) {
    if (savedScheme !== 'default') {
      document.documentElement.setAttribute('data-color-scheme', savedScheme);
    }
    
    // 应用所有的 CSS 变量，确保完全生效喵！
    applyThemeVariables(savedMode || 'light', savedScheme);
  }
}

/**
 * 应用主题相关的 CSS 变量喵～
 */
export function applyThemeVariables(mode, scheme) {
  // 定义各种颜色方案，要和 BlackLight.vue 保持一致喵！
  const colorSchemes = {
    default: {
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
    pink: {
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
    green: {
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
  };

  // 获取当前主题方案喵～
  const currentScheme = colorSchemes[scheme] || colorSchemes.default;
  const root = document.documentElement;
  
  // 设置 CSS 变量喵！
  root.style.setProperty('--primary-gradient', currentScheme.primary);
  root.style.setProperty('--background-color', currentScheme[mode].bg);
  root.style.setProperty('--text-color', currentScheme[mode].text);
  root.style.setProperty('--border-gradient', currentScheme[mode].border);
}