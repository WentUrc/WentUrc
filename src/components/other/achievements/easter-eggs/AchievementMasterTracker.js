import eventBus from '../../../../utils/eventBus.js';
import achievementsData from '../../../../assets/data/achievements.json';

/**
 * 成就大师跟踪器
 * 当用户解锁了除成就大师外的所有成就时，自动解锁成就大师
 */
class AchievementMasterTracker {
  constructor() {
    this.initialized = false;
    this.achievementUnlocked = false;
    this.totalAchievements = 0;
    this.eventHandler = null;
    this.pendingCheck = false;
    this.countTotalAchievements();
  }

  /**
   * 计算总成就数（排除自身）
   */
  countTotalAchievements() {
    this.totalAchievements = Object.keys(achievementsData).filter(
      key => key !== 'achievement-master'
    ).length;
    
  }

  /**
   * 初始化跟踪器
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.loadAchievementsState();
    if (this.unlockedCount >= this.totalAchievements && !this.achievementUnlocked) {
      this.unlockAchievement();
    }
    this.eventHandler = (achievementId) => {
      if (achievementId !== 'achievement-master') {
        this.scheduleCheck();
      }
    };
    
    eventBus.on('achievement-unlocked', this.eventHandler);
    setTimeout(() => {
      this.loadAchievementsState();
      
      if (this.unlockedCount >= this.totalAchievements && !this.achievementUnlocked) {
        this.unlockAchievement();
      }
    }, 1500);
  }
  
  /**
   * 从localStorage加载成就状态
   */
  loadAchievementsState() {
    try {
      const achievementsData = localStorage.getItem('wenturc-achievements');
      if (achievementsData) {
        const achievements = JSON.parse(achievementsData);
        this.unlockedCount = Object.entries(achievements).filter(
          ([key, achievement]) => key !== 'achievement-master' && achievement && achievement.unlocked === true
        ).length;
        this.achievementUnlocked = achievements['achievement-master'] && 
          achievements['achievement-master'].unlocked === true;
      }
    } catch (e) {
      console.error('[成就大师] 加载成就状态失败喵～', e);
      this.unlockedCount = 0;
      this.achievementUnlocked = false;
    }
  }
  
  /**
   * 安排一次检查 - 使用防抖机制避免频繁检查
   */
  scheduleCheck() {
    if (this.pendingCheck) return;
    
    this.pendingCheck = true;
    setTimeout(() => {
      this.pendingCheck = false;
      this.onAchievementUnlocked();
    }, 500);
  }

  /**
   * 处理成就解锁事件
   */
  onAchievementUnlocked() {
    this.loadAchievementsState();
    if (this.unlockedCount >= this.totalAchievements && !this.achievementUnlocked) {
      this.unlockAchievement();
    }
  }
  
  /**
   * 手动触发解锁成就
   */
  forceUnlock() {
    this.unlockAchievement();
  }
  
  /**
   * 解锁成就大师成就
   */
  unlockAchievement() {
    if (!this.achievementUnlocked) {
      this.achievementUnlocked = true;
      eventBus.emit('achievement-unlocked', 'achievement-master');
    }
  }
  
  /**
   * 手动检查并立即解锁（如果满足条件）
   */
  checkAndUnlockImmediately() {
    this.loadAchievementsState();
    
    if (this.unlockedCount >= this.totalAchievements && !this.achievementUnlocked) {
      this.unlockAchievement();
      return true;
    }
    return false;
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    if (this.eventHandler) {
      eventBus.off('achievement-unlocked', this.eventHandler);
      this.eventHandler = null;
    }
    
    this.initialized = false;
  }
}

// 创建单例
const achievementMasterTracker = new AchievementMasterTracker();

export default achievementMasterTracker;
