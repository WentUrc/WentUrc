import eventBus from '../../../../utils/eventBus.js';

/**
 * 成就猎人跟踪器
 * 当用户解锁10个成就时解锁"成就猎人"成就
 */
class AchievementHunterTracker {
  constructor() {
    this.initialized = false;
    this.achievementUnlocked = false;
    this.unlockedCount = 0;
    this.targetCount = 10;
    this.eventHandler = null;
    this.pendingCheck = false;
  }

  /**
   * 初始化跟踪器
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    // 从localStorage加载已解锁成就信息
    this.loadAchievementsState();
    if (this.unlockedCount >= this.targetCount && !this.achievementUnlocked) {
      this.unlockAchievement();
    }
    
    this.eventHandler = (achievementId) => {
      if (achievementId !== 'achievement-hunter') {
        this.scheduleCheck();
      }
    };
    
    eventBus.on('achievement-unlocked', this.eventHandler);
    setTimeout(() => {
      this.loadAchievementsState();
      
      if (this.unlockedCount >= this.targetCount && !this.achievementUnlocked) {
        this.unlockAchievement();
      }
    }, 1000);
  }
  
  /**
   * 从localStorage加载成就状态
   */
  loadAchievementsState() {
    try {
      const achievementsData = localStorage.getItem('wenturc-achievements');
      if (achievementsData) {
        const achievements = JSON.parse(achievementsData);
        this.unlockedCount = 0;
        for (const key in achievements) {
          if (key !== 'achievement-hunter' && 
              achievements[key] && 
              achievements[key].unlocked === true) {
            this.unlockedCount++;
          }
        }

        this.achievementUnlocked = achievements['achievement-hunter'] && 
          achievements['achievement-hunter'].unlocked === true;

      }
    } catch (e) {
      console.error('加载成就状态失败喵～', e);
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
    if (this.unlockedCount >= this.targetCount && !this.achievementUnlocked) {
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
   * 解锁成就猎人成就
   */
  unlockAchievement() {
    if (!this.achievementUnlocked) {
      this.achievementUnlocked = true;
      eventBus.emit('achievement-unlocked', 'achievement-hunter');
    }
  }
  
  /**
   * 手动检查并立即解锁（如果满足条件）
   * 用于强制重新检查成就状态
   */
  checkAndUnlockImmediately() {
    this.loadAchievementsState();
    
    if (this.unlockedCount >= this.targetCount && !this.achievementUnlocked) {
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
const achievementHunterTracker = new AchievementHunterTracker();

export default achievementHunterTracker;
