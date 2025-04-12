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
    
    // 如果达到目标但未解锁，立即解锁
    if (this.unlockedCount >= this.targetCount && !this.achievementUnlocked) {
      this.unlockAchievement();
    }
    
    // 监听新成就解锁事件 - 使用统一的事件总线和正确的方法
    this.eventHandler = (achievementId) => {
      // 排除自己以避免无限循环
      if (achievementId !== 'achievement-hunter') {
        this.scheduleCheck();
      }
    };
    
    eventBus.on('achievement-unlocked', this.eventHandler);
    
    // 延迟一秒再次检查，确保所有成就数据都已加载
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
        
        // 计算已解锁的成就数量 - 优化计数逻辑
        this.unlockedCount = 0;
        for (const key in achievements) {
          // 排除自己以避免循环依赖
          if (key !== 'achievement-hunter' && 
              achievements[key] && 
              achievements[key].unlocked === true) {
            this.unlockedCount++;
          }
        }
        
        // 检查成就猎人成就是否已解锁
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
    
    // 使用较长的延迟确保localStorage已更新
    setTimeout(() => {
      this.pendingCheck = false;
      this.onAchievementUnlocked();
    }, 500);
  }

  /**
   * 处理成就解锁事件
   */
  onAchievementUnlocked() {
    // 重新加载成就状态
    this.loadAchievementsState();
    
    // 检查是否达到目标
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
