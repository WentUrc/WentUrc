import eventBus from '../../../../utils/eventBus.js';

/**
 * 午夜成就跟踪器
 * 检查是否在午夜12点整访问网站并解锁成就
 */
class MidnightTracker {
  constructor() {
    this.initialized = false;
    this.achievementUnlocked = false;
    this.midnightCheckInterval = null;
  }

  /**
   * 初始化跟踪器
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    // 检查成就是否已经解锁
    this.loadState();
    
    // 检测是否是午夜12点
    if (!this.achievementUnlocked) {
      this.checkMidnight();
      
      // 设置定时检查午夜时间
      this.midnightCheckInterval = setInterval(() => {
        this.checkMidnight();
      }, 30000); // 每30秒检查一次
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
        if (achievements['midnight-thinker'] && achievements['midnight-thinker'].unlocked) {
          this.achievementUnlocked = true;
        }
      } catch (e) {
        console.error('解析成就数据失败喵', e);
      }
    }
  }
  
  /**
   * 检查当前是否是午夜12点整
   */
  checkMidnight() {
    if (this.achievementUnlocked) return;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 检查是否是午夜12点（00:00）
    // 给予一个小窗口（00:00到00:05之间）增加解锁机会
    const isMidnight = hours === 0 && minutes >= 0 && minutes <= 5;
    
    if (isMidnight) {
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
   * 解锁午夜成就
   */
  unlockAchievement() {
    if (!this.achievementUnlocked) {
      this.achievementUnlocked = true;
      eventBus.emit('achievement-unlocked', 'midnight-thinker');
      
      // 成就已解锁，可以清理定时器
      if (this.midnightCheckInterval) {
        clearInterval(this.midnightCheckInterval);
        this.midnightCheckInterval = null;
      }
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    if (this.midnightCheckInterval) {
      clearInterval(this.midnightCheckInterval);
      this.midnightCheckInterval = null;
    }
    
    this.initialized = false;
  }
}

// 创建单例
const midnightTracker = new MidnightTracker();

export default midnightTracker;
