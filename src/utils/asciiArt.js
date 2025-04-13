/**
 * ASCII字符画加载器 - 从外部文件加载字符画，解决格式问题
 */

// 预设字符画（作为后备方案）
const fallbackLogos = {
  full: '      ___          ___          ___          \n     /__/\\        /  /\\        /__/\\         \n    _\\_ \\:\\      /  /:/_       \\  \\:\\       \n   /__/\\ \\:\\    /  /:/ /\\       \\  \\:\\     \n  _\\_ \\:\\ \\:\\  /  /:/ /:/_  _____\\__\\:\\   \n /__/\\ \\:\\ \\:\\/__/:/ /:/ /\\/__/::::::::\\ \n \\  \\:\\ \\:\\/:/\\  \\:\\/:/ /:/\\  \\:\\~~\\~~\\/\n  \\  \\:\\ \\::/  \\  \\::/ /:/  \\  \\:\\  ~~~ \n   \\  \\:\\/:/    \\  \\:\\/:/    \\  \\:\\      \n    \\  \\::/      \\  \\::/      \\  \\:\\      \n     \\__\\/        \\__\\/        \\__\\/      ',
  simple: ' __      __          _    _   _          \n \\ \\    / /___  _ _ | |_ | | | | _ _  __ \n  \\ \\/\\/ // -_)| \' \\|  _|| |_| || \'_|/ _|\n   \\_/\\_/ \\___||_||_|\\__| \\___/ |_|  \\__|\n                                         ',
  mini: 'W E N T U R C',
  mono: ' _       __              __   __  __           \n| |     / /___   ____   / /_ / / / /_____ _____\n| | /| / // _ \\ / __ \\ / __// / / // ___// ___/\n| |/ |/ //  __// / / // /_ / /_/ // /   / /__  \n|__/|__/ \\___//_/ /_/ \\__/ \\____//_/    \\___/  \n                                               '
};

// 字符画文件路径 - 修复为以根目录为基准的路径
const logoFiles = {
  full: '/ascii/wenturc-full.txt',
  simple: '/ascii/wenturc-simple.txt',
  mini: '/ascii/wenturc-mini.txt', 
  mono: '/ascii/wenturc-mono.txt'
};

// 已加载的字符画缓存
const loadedLogos = {};

/**
 * 从文件加载字符画
 * @param {string} type - 字符画类型 (full/simple/mini/mono)
 * @returns {Promise<string>} 返回加载的字符画文本
 */
export async function loadLogo(type = 'simple') {
  // 如果已经加载过，直接从缓存返回
  if (loadedLogos[type]) {
    return loadedLogos[type];
  }
  
  // 确保类型有效
  const validType = ['full', 'simple', 'mini', 'mono'].includes(type) ? type : 'simple';
  
  try {
    // 使用fetch API加载文本文件
    const response = await fetch(logoFiles[validType]);
    
    if (!response.ok) {
      throw new Error(`加载失败: ${response.status} ${response.statusText}`);
    }
    
    const logoText = await response.text();
    
    // 缓存加载的字符画
    loadedLogos[validType] = logoText;
    return logoText;
  } catch (error) {
    console.warn(`加载字符画失败: ${error.message}，使用备用字符画`);
    return fallbackLogos[validType];
  }
}

/**
 * 基于显示环境选择最合适的字符画
 * @returns {Promise<string>} 最合适的字符画
 */
export async function getBestFitLogo() {
  // 估计控制台环境
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  // 根据环境选择合适的字符画
  if (isMobile) {
    return loadLogo('mini');
  } else if (isSmallScreen) {
    return loadLogo('simple');
  } else {
    // 默认使用mono版本，它对于多数控制台环境都很友好
    return loadLogo('mono');
  }
}

/**
 * 获取同步版本的字符画（从缓存或后备）
 * @param {string} type - 字符画类型
 * @returns {string} 字符画文本
 */
export function getLogoSync(type = 'simple') {
  return loadedLogos[type] || fallbackLogos[type];
}

// 预加载所有字符画
export function preloadAllLogos() {
  if (typeof window !== 'undefined') {
    Promise.all([
      loadLogo('full'),
      loadLogo('simple'),
      loadLogo('mini'),
      loadLogo('mono')
    ]).catch(error => {
      console.warn('预加载字符画失败:', error);
    });
  }
}

// 当页面加载完成后预加载字符画
if (typeof window !== 'undefined') {
  window.addEventListener('load', preloadAllLogos);
}
