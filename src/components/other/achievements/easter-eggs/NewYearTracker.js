import eventBus from '../../../../utils/eventBus.js';

/**
 * 新年成就跟踪器
 * 检查是否在元旦访问网站并解锁成就
 */
class NewYearTracker {
  constructor() {
    this.initialized = false;
    this.achievementUnlocked = false;
  }

  /**
   * 初始化跟踪器
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.loadState();
    if (!this.achievementUnlocked) {
      this.checkNewYear();
    }
  }
  
  /**
   * 从本地存储加载状态
   */
  loadState() {
    // 从全局成就系统中检查是否已解锁
    const achievementsData = localStorage.getItem('wenturc-achievements');
    if (achievementsData) {
      try {
        const achievements = JSON.parse(achievementsData);
        if (achievements['new-year-joy'] && achievements['new-year-joy'].unlocked) {
          this.achievementUnlocked = true;
        }
      } catch (e) {
        console.error('解析成就数据失败喵', e);
      }
    }
  }
  
  /**
   * 检查今天是否是新年第一天
   */
  checkNewYear() {
    const today = new Date();
    const isNewYearsDay = today.getMonth() === 0 && today.getDate() === 1;
    
    if (isNewYearsDay) {
      this.unlockAchievement();
    }
  }
  
  /**
   * 手动触发解锁成就（用于测试）
   */
  forceUnlock() {
    this.unlockAchievement();
  }
  
  /**
   * 解锁新年成就
   */
  unlockAchievement() {
    if (!this.achievementUnlocked) {
      this.achievementUnlocked = true;
      eventBus.emit('achievement-unlocked', 'new-year-joy');
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    this.initialized = false;
  }
}

// 创建单例
const newYearTracker = new NewYearTracker();

export default newYearTracker;
