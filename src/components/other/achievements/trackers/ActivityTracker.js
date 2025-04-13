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

    this.trackClickCount = this.trackClickCount.bind(this);
    this.trackScrollDistance = this.trackScrollDistance.bind(this);
  }
  
  /**
   * 初始化追踪器
   */
  initialize() {
    this.loadData();
    
    this.clickCount = this.manager.storage.getNumber('click-count') || 0;
    this.scrollDistance = this.manager.storage.getNumber('scroll-count') || 0;
    
    if (this.isClickTrackingActive) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
    
    if (this.isScrollTrackingActive) {
      window.addEventListener('scroll', this.trackScrollDistance);
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
    this.manager.storage.setNumber('click-count', this.clickCount);
    
    if (this.clickCount >= 100 && !this.manager.isAchievementUnlocked('click-addict')) {
      this.manager.storage.setNumber('wenturc-click-count', this.clickCount);

      setTimeout(() => {
        this.manager.unlockAchievement('click-addict');
        setTimeout(() => {
          import('../easter-eggs/AchievementHunterTracker.js').then(module => {
            if (module.default && typeof module.default.checkAndUnlockImmediately === 'function') {
              module.default.checkAndUnlockImmediately();
            }
          });
        }, 500);
      }, 0);
      
      this.isClickTrackingActive = false;
      document.removeEventListener('click', this.handleClick.bind(this));
    }
  }
  
  /**
   * 追踪滚动距离
   */
  trackScrollDistance() {
    if (!this.isScrollTrackingActive) return;
    
    const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
    const distance = Math.abs(currentPosition - this.lastScrollPosition);
    this.scrollDistance += distance;
    
    this.lastScrollPosition = currentPosition;
    
    if (distance > 100) {
      this.manager.storage.setNumber('wenturc-scroll-distance', this.scrollDistance);
    }
    
    if (this.scrollDistance >= 5000) {
      
      this.isScrollTrackingActive = false;
      this.manager.storage.setNumber('wenturc-scroll-distance', this.scrollDistance);
      
      setTimeout(() => {
        this.manager.unlockAchievement('scroll-champion');
        
        setTimeout(() => {
          import('../easter-eggs/AchievementHunterTracker.js').then(module => {
            if (module.default && typeof module.default.checkAndUnlockImmediately === 'function') {
              module.default.checkAndUnlockImmediately();
            }
          });
        }, 500);
      }, 0);
      
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