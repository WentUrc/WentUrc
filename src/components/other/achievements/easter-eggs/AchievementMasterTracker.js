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
    
    // 计算除了"achievement-master"外的成就总数
    this.countTotalAchievements();
  }

  /**
   * 计算总成就数（排除自身）
   */
  countTotalAchievements() {
    // 从成就数据中获取总数，但排除自己
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
    
    // 从localStorage加载成就状态
    this.loadAchievementsState();
    
    // 如果已经全部解锁但成就大师还未解锁，立即解锁
    if (this.unlockedCount >= this.totalAchievements && !this.achievementUnlocked) {
      this.unlockAchievement();
    }
    
    // 监听新成就解锁事件
    this.eventHandler = (achievementId) => {
      // 排除自己以避免无限循环
      if (achievementId !== 'achievement-master') {
        this.scheduleCheck();
      }
    };
    
    eventBus.on('achievement-unlocked', this.eventHandler);
    
    // 延迟一秒再次检查，确保所有成就数据都已加载
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
        
        // 计算已解锁的成就数量（排除成就大师自身）
        this.unlockedCount = Object.entries(achievements).filter(
          ([key, achievement]) => key !== 'achievement-master' && achievement && achievement.unlocked === true
        ).length;
        
        // 检查成就大师成就是否已解锁
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
