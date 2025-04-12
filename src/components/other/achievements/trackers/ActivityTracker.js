/**
 * 活动追踪器 - 追踪用户点击和滚动行为
 */
class ActivityTracker {
  constructor(manager) {
    this.manager = manager;
    
    this.clickCount = 0;
    this.scrollDistance = 0;
    this.lastScrollPosition = 0;
    
    this.isClickTrackingActive = true;
    this.isScrollTrackingActive = true;
    
    // 绑定方法
    this.trackClickCount = this.trackClickCount.bind(this);
    this.trackScrollDistance = this.trackScrollDistance.bind(this);
  }
  
  /**
   * 初始化追踪器
   */
  initialize() {
    // 从存储中加载状态
    this.loadData();
    
    // 加载已有计数
    this.clickCount = this.manager.storage.getNumber('click-count') || 0;
    this.scrollDistance = this.manager.storage.getNumber('scroll-count') || 0;
    
    // 添加事件监听
    if (this.isClickTrackingActive) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
    
    if (this.isScrollTrackingActive) {
      window.addEventListener('scroll', this.trackScrollDistance);
      // 初始化最后滚动位置
      this.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    }
  }
  
  /**
   * 加载活动数据
   */
  loadData() {
    const storage = this.manager.storage;
    
    // 检查滚动相关成就
    if (this.manager.isAchievementUnlocked('scroll-champion')) {
      this.isScrollTrackingActive = false;
    } else {
      this.scrollDistance = storage.getNumber('wenturc-scroll-distance', 0);
      
      if (this.scrollDistance >= 5000) {
        this.manager.unlockAchievement('scroll-champion');
        this.isScrollTrackingActive = false;
      }
    }
    
    // 检查点击相关成就
    if (this.manager.isAchievementUnlocked('click-addict')) {
      this.isClickTrackingActive = false;
    } else {
      this.clickCount = storage.getNumber('wenturc-click-count', 0);
      
      if (this.clickCount >= 100) {
        this.manager.unlockAchievement('click-addict');
        this.isClickTrackingActive = false;
      }
    }
  }
  
  /**
   * 处理点击事件
   */
  handleClick() {
    this.clickCount++;
    this.trackClickCount();
  }
  
  /**
   * 追踪点击次数
   */
  trackClickCount() {
    if (!this.isClickTrackingActive) return;
    
    // 保存点击计数
    this.manager.storage.setNumber('click-count', this.clickCount);
    
    // 检查点击狂热成就
    if (this.clickCount >= 100 && !this.manager.isAchievementUnlocked('click-addict')) {
      // 解锁成就前确保全局变量已更新
      this.manager.storage.setNumber('wenturc-click-count', this.clickCount);
      
      // 使用setTimeout确保DOM更新在事件处理之外
      setTimeout(() => {
        this.manager.unlockAchievement('click-addict');
        
        // 主动检查成就猎人成就 - 确保数据已更新
        setTimeout(() => {
          import('../easter-eggs/AchievementHunterTracker.js').then(module => {
            if (module.default && typeof module.default.checkAndUnlockImmediately === 'function') {
              module.default.checkAndUnlockImmediately();
            }
          });
        }, 500);
      }, 0);
      
      this.isClickTrackingActive = false;
      
      // 解除监听
      document.removeEventListener('click', this.handleClick.bind(this));
    }
  }
  
  /**
   * 追踪滚动距离
   */
  trackScrollDistance() {
    if (!this.isScrollTrackingActive) return;
    
    const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
    // 计算滚动距离（取绝对值，因为向上滚动也算喵～）
    const distance = Math.abs(currentPosition - this.lastScrollPosition);
    
    // 累加总滚动距离
    this.scrollDistance += distance;
    
    // 更新最后位置喵～
    this.lastScrollPosition = currentPosition;
    
    // 每100像素保存一次，避免频繁保存
    if (distance > 100) {
      this.manager.storage.setNumber('wenturc-scroll-distance', this.scrollDistance);
    }
    
    // 检查是否达到5000像素喵～
    if (this.scrollDistance >= 5000) {
      
      // 修改成就解锁方式，确保事件被正确触发
      this.isScrollTrackingActive = false;
      this.manager.storage.setNumber('wenturc-scroll-distance', this.scrollDistance);
      
      // 使用setTimeout确保不在滚动事件的回调中触发DOM更新
      setTimeout(() => {
        this.manager.unlockAchievement('scroll-champion');
        
        // 主动检查成就猎人成就 - 添加一个额外的延迟确保成就数据被更新
        setTimeout(() => {
          import('../easter-eggs/AchievementHunterTracker.js').then(module => {
            if (module.default && typeof module.default.checkAndUnlockImmediately === 'function') {
              module.default.checkAndUnlockImmediately();
            }
          });
        }, 500);
      }, 0);
      
      // 解除监听
      window.removeEventListener('scroll', this.trackScrollDistance);
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    if (this.isClickTrackingActive) {
      document.removeEventListener('click', this.handleClick.bind(this));
    }
    
    if (this.isScrollTrackingActive) {
      window.removeEventListener('scroll', this.trackScrollDistance);
    }
  }
}

export default ActivityTracker;