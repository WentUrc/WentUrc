/**
 * 成就系统管理器 - 协调所有成就相关功能
 * 通过异步模块加载解决循环依赖问题
 */
import achievementsData from '../../../../assets/data/achievements.json';
import eventBus from '../../../../utils/eventBus.js';
import AchievementStorage from './AchievementStorage.js';
import NotificationManager from './NotificationManager.js';

class AchievementManager {
  constructor() {
    this.achievements = achievementsData;
    this.storage = new AchievementStorage();
    this.notifications = new NotificationManager();
    
    this.userAchievements = {};
    this.hasNewAchievements = false;
    
    // 初始化追踪器数组 - 用于统一管理
    this.trackers = [];
    
    // 事件监听器缓存，用于清理
    this.eventHandlers = {};
    
    this.recentlyUnlocked = new Set(); // 记录最近解锁的成就，避免重复通知
  }
  
  /**
   * 初始化成就系统
   */
  async initialize() {
    // 加载用户成就数据
    this.userAchievements = this.storage.loadAchievements();
    this.hasNewAchievements = this.checkForNewAchievements();
    
    // 异步初始化追踪器
    await this._initTrackers();
    
    // 设置事件监听
    this.setupEventListeners();
  }
  
  /**
   * 异步初始化追踪器
   * 使用动态导入避免循环依赖问题
   */
  async _initTrackers() {
    try {
      // 使用动态导入避免循环依赖
      const [
        { default: ActivityTracker },
        { default: TimeTracker },
        { default: VisitTracker },
        { default: EasterEggManager }
      ] = await Promise.all([
        import('../trackers/ActivityTracker.js'),
        import('../trackers/TimeTracker.js'),
        import('../trackers/VisitTracker.js'),
        import('../easter-eggs/EasterEggManager.js')
      ]);
      
      // 创建并添加追踪器到统一数组
      this.trackers = [
        new ActivityTracker(this),
        new TimeTracker(this),
        new VisitTracker(this),
        new EasterEggManager(this)
      ];
      
      // 初始化所有追踪器
      for (const tracker of this.trackers) {
        await tracker.initialize?.();
      }
    } catch (error) {
      console.error('追踪器初始化失败:', error);
    }
  }
  
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 使用缓存并绑定this上下文，便于后续清理
    this.eventHandlers = {
      'achievement-unlocked': this.handleAchievementUnlock.bind(this),
      'theme-changed': () => this.unlockAchievement('theme-changer'),
      'music-played': () => this.unlockAchievement('music-lover'),
      'quote-favorited': () => this.unlockAchievement('quote-collector')
    };
    
    // 注册所有事件监听器
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      eventBus.on(event, handler);
    });
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    // 清理所有事件监听器
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      eventBus.off(event, handler);
    });
    
    // 清理所有追踪器
    for (const tracker of this.trackers) {
      tracker.cleanup?.();
    }
    
    // 清空追踪器数组
    this.trackers = [];
    
    // 清理通知管理器
    this.notifications.cleanup();
  }
  
  /**
   * 检查是否有新成就
   */
  checkForNewAchievements() {
    return Object.values(this.userAchievements).some(a => a.isNew);
  }
  
  /**
   * 解锁成就
   * @param {string} id 成就ID
   * @returns {boolean} 是否成功解锁（之前未解锁）
   */
  unlockAchievement(id) {
    // 防止重复解锁处理
    if (this.recentlyUnlocked && this.recentlyUnlocked.has(id)) {
      return false;
    }
    
    // 初始化集合（如果不存在）
    if (!this.recentlyUnlocked) {
      this.recentlyUnlocked = new Set();
    }
    
    // 添加到最近解锁列表
    this.recentlyUnlocked.add(id);
    
    // 5秒后从列表中移除
    setTimeout(() => {
      if (this.recentlyUnlocked) {
        this.recentlyUnlocked.delete(id);
      }
    }, 5000);
    
    // 成就不存在检查
    if (!this.achievements[id]) {
      console.error(`成就ID不存在: ${id}`);
      return false;
    }
    
    // 已解锁检查
    if (this.isAchievementUnlocked(id)) {
      return false;
    }
    
    // 解锁成就
    const achievement = {
      unlocked: true,
      timestamp: new Date().toISOString(),
      isNew: true
    };
    
    // 创建新对象以确保Vue响应性
    this.userAchievements = {
      ...this.userAchievements,
      [id]: achievement
    };
    
    // 存储更新后的成就
    this.storage.saveAchievements(this.userAchievements);
    this.hasNewAchievements = true;
    
    // 确保通知数据完整
    const achievementData = this.achievements[id];
    if (achievementData) {
      // 触发通知，使用公共事件总线确保Vue组件能感知变化
      eventBus.emit('show-achievement-notification', {...achievementData, id});
      
      // 同时调用内部通知方法
      this.notifications.showNotification({...achievementData, id});
    }
    
    // 触发全局事件以通知所有监听组件
    eventBus.emit('achievements-updated', this.unlockedCount);
    
    // 检查成就猎人成就
    this.checkAchievementHunter();
    
    return true;
  }
  
  /**
   * 检查是否应该解锁成就猎人成就
   */
  checkAchievementHunter() {
    // 延迟检查，确保userAchievements是最新的
    setTimeout(() => {
      import('../easter-eggs/AchievementHunterTracker.js').then(module => {
        if (module.default && typeof module.default.checkAndUnlockImmediately === 'function') {
          module.default.checkAndUnlockImmediately();
        }
      }).catch(err => {
        console.error('检查成就猎人成就失败:', err);
      });
    }, 300);
  }
  
  /**
   * 处理成就解锁事件
   */
  handleAchievementUnlock(id) {
    this.unlockAchievement(id);
  }
  
  /**
   * 确认已查看成就
   */
  acknowledgeAchievement(id) {
    if (this.isAchievementNew(id)) {
      const updatedAchievement = {
        ...this.userAchievements[id],
        isNew: false
      };
      
      this.userAchievements = {
        ...this.userAchievements,
        [id]: updatedAchievement
      };
      
      this.storage.saveAchievements(this.userAchievements);
      
      // 更新"有新成就"的标志
      this.hasNewAchievements = this.checkForNewAchievements();
    }
  }
  
  /**
   * 当成就面板打开时
   */
  onPanelOpen() {
    // 标记所有新成就为已查看
    const updatedAchievements = { ...this.userAchievements };
    let changed = false;
    
    Object.keys(updatedAchievements).forEach(id => {
      if (updatedAchievements[id]?.isNew) {
        updatedAchievements[id].isNew = false;
        changed = true;
      }
    });
    
    if (changed) {
      this.userAchievements = updatedAchievements;
      this.storage.saveAchievements(this.userAchievements);
      this.hasNewAchievements = false;
    }
  }
  
  /**
   * 检查成就是否已解锁
   */
  isAchievementUnlocked(id) {
    return this.userAchievements[id]?.unlocked || false;
  }
  
  /**
   * 检查成就是否为新解锁
   */
  isAchievementNew(id) {
    return this.userAchievements[id]?.isNew || false;
  }
  
  /**
   * 检查是否是隐藏成就
   */
  isSecretAchievement(id) {
    return this.achievements[id]?.secret && !this.isAchievementUnlocked(id);
  }
  
  /**
   * 获取成就图标
   */
  getAchievementIcon(id) {
    if (this.isSecretAchievement(id)) {
      return 'fas fa-question';
    }
    return this.achievements[id]?.icon;
  }
  
  /**
   * 获取成就名称
   */
  getAchievementName(id) {
    if (this.isSecretAchievement(id)) {
      return '???';
    }
    return this.achievements[id]?.name;
  }
  
  /**
   * 获取成就描述
   */
  getAchievementDescription(id) {
    if (this.isSecretAchievement(id)) {
      return '这是一个隐藏成就，继续探索以解锁';
    }
    return this.achievements[id]?.description;
  }
  
  /**
   * 格式化日期
   */
  formatDate(id) {
    const dateString = this.userAchievements[id]?.timestamp;
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('日期格式化失败:', e);
      return dateString;
    }
  }
  
  /**
   * 获取解锁成就数量
   */
  get unlockedCount() {
    return Object.keys(this.userAchievements).filter(id => 
      this.userAchievements[id]?.unlocked
    ).length;
  }
  
  /**
   * 获取总成就数量
   */
  get totalAchievements() {
    return Object.keys(this.achievements).length;
  }
  
  /**
   * 获取成就完成百分比
   */
  get unlockedPercentage() {
    if (this.totalAchievements === 0) return 0;
    return Math.round((this.unlockedCount / this.totalAchievements) * 100);
  }
  
  /**
   * 获取通知状态
   */
  get notification() {
    // 返回一个新对象，确保响应性
    return { ...this.notifications.notification };
  }
  
  /**
   * 重置所有成就（仅用于开发测试）
   */
  resetAllAchievements() {
    this.userAchievements = {};
    this.storage.saveAchievements({});
    this.hasNewAchievements = false;
    return true;
  }
}

// 导出单例
export default new AchievementManager();