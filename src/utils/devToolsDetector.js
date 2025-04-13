import eventBus from './eventBus.js';
import { getLogoSync, loadLogo, preloadAllLogos } from './asciiArt.js';

/**
 * 开发者工具成就解锁器 - 超简版喵～
 * 只提供解锁命令，完全没有自动检测
 */
class DevToolsUnlocker {
  constructor() {
    this.achievementId = 'dev-tools-explorer';
    this.hasAchievement = false;
    
    // 预加载字符画
    if (typeof window !== 'undefined') {
      preloadAllLogos();
    }
  }

  /**
   * 初始化解锁器
   */
  initialize() {
    // 检查是否已经解锁过此成就
    this.checkExistingAchievement();
    
    // 只处理未解锁成就的情况
    if (!this.hasAchievement) {
      this.exposeUnlockCommand();
      
      // 添加更醒目且美观的控制台提示和字符画
      this.showConsoleMessage();
    }
  }
  
  /**
   * 显示控制台提示信息和字符画
   */
  async showConsoleMessage() {

    
    // 先显示一个加载提示，避免长时间白屏
    console.log('%c正在加载WentUrc字符画...', 'font-size: 14px; color: #38d9a9;');
    
    try {
      // 异步加载字符画，选择mono版本，它在大多数控制台中显示良好
      const logo = await loadLogo('mono');
      
      console.clear();
      console.log(
        `%c${logo}

%c✨✨✨ 欢迎来到开发者世界! ✨✨✨%c

%c🔮 发现隐藏成就 🔮%c
你发现了WentUrc的开发者模式！作为一名探索者，
你可以解锁"开发好奇喵"成就来记录这一发现。

%c📝 解锁方法 📝%c
在下方控制台中输入以下命令:
%c> unlockDevToolsAchievement()%c

%c🎯 小提示 🎯%c
• 成就解锁后会显示在你的成就列表中
• 开发者工具中藏有更多彩蛋等你发现
• 试着在网站各处搜寻其他隐藏成就吧！

%c🌈 Happy Coding! 🐱`,
        'color: #6b90ff; font-family: monospace; font-size: 14px; font-weight: bold; text-shadow: 0 1px 0 #38d9a9;',
        'background: linear-gradient(90deg, #5e60ce, #6b90ff); color: white; font-size: 16px; font-weight: bold; padding: 8px; border-radius: 8px; text-shadow: 0 1px 0 rgba(0,0,0,0.3);',
        '',
        'background: #38d9a9; color: white; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 25px 25px 25px 5px; margin: 6px 0;',
        'color: #333; font-size: 14px;',
        'background: #f1b944; color: white; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 25px 25px 25px 5px; margin: 6px 0;',
        'color: #333; font-size: 14px;',
        'background: #242424; color: #38d9a9; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 16px; letter-spacing: 1px; box-shadow: 0 2px 0 rgba(0,0,0,0.2);',
        '',
        'background: #ff6b6b; color: white; font-size: 14px; font-weight: bold; padding: 6px 12px; border-radius: 25px 25px 25px 5px; margin: 6px 0;',
        'color: #333; font-size: 14px; line-height: 1.5;',
        'color: #6b90ff; font-size: 18px; font-weight: bold; background: linear-gradient(45deg, #6b90ff, #ff6b6b, #38d9a9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding: 10px 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1);'
      );
    } catch (error) {
      // 如果加载失败，使用同步的后备方案
      console.clear();
      const fallbackLogo = getLogoSync('simple');
      
      console.log(
        `%c${fallbackLogo}

%c✨ 欢迎来到开发者世界! ✨%c

在控制台输入以下命令解锁"开发好奇喵"成就:
%c> unlockDevToolsAchievement()`,
        'color: #6b90ff; font-family: monospace; font-size: 14px;',
        'color: #38d9a9; font-size: 16px; font-weight: bold;',
        'color: #333;',
        'background: #242424; color: #38d9a9; padding: 4px 8px; border-radius: 4px; font-family: monospace;'
      );
    }
  }
  
  /**
   * 检查是否已解锁成就
   */
  checkExistingAchievement() {
    try {
      const achievementsData = localStorage.getItem('achievements');
      if (achievementsData) {
        const achievements = JSON.parse(achievementsData);
        this.hasAchievement = achievements.includes(this.achievementId);
      }
    } catch (e) {
      this.hasAchievement = false;
    }
  }

  /**
   * 暴露解锁命令到全局
   */
  exposeUnlockCommand() {
    window.unlockDevToolsAchievement = () => {
      if (this.hasAchievement) {
        return '你已经解锁了「开发好奇喵」成就～不需要重复解锁！🏆';
      }
      
      // 标记成就已解锁
      this.hasAchievement = true;
      
      // 触发成就事件
      eventBus.emit('achievement-unlocked', this.achievementId);
      
      return '✨恭喜你解锁了「开发好奇喵」成就！🎉 感谢你探索网站的开发者工具～';
    };
  }
  
  // 向后兼容的方法
  enable() { return this; }
  disable() { return this; }
  stopChecking() { return this; }
  reset() { return this; }
}

// 创建单例并初始化
const devToolsDetector = new DevToolsUnlocker();

// 页面加载完成后初始化
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    devToolsDetector.initialize();
  } else {
    window.addEventListener('load', () => {
      devToolsDetector.initialize();
    });
  }
}

// 开发环境辅助功能
if (import.meta.env.DEV) {
  // 保持旧版导出名称
  window.devToolsDetector = devToolsDetector;
  
  // 添加辅助方法重置成就状态（仅用于测试）
  window.resetDevToolsAchievement = () => {
    try {
      const achievementsData = localStorage.getItem('achievements');
      if (achievementsData) {
        const achievements = JSON.parse(achievementsData);
        const newAchievements = achievements.filter(id => id !== devToolsDetector.achievementId);
        localStorage.setItem('achievements', JSON.stringify(newAchievements));
        devToolsDetector.hasAchievement = false;
        return '已重置开发者工具成就状态，刷新页面后生效喵～';
      }
    } catch (e) {
      return '重置失败: ' + e.message;
    }
  };
}

export default devToolsDetector;
