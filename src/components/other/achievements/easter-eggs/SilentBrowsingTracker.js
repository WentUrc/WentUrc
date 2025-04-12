import eventBus from '../../../../utils/eventBus.js';

/**
 * 静音浏览跟踪器
 * 用于监测用户在静音状态下浏览网站的时间
 */
class SilentBrowsingTracker {
  constructor() {
    this.isMuted = false;
    this.startTime = null;
    this.accumulatedTime = 0;
    this.achievementUnlocked = false;
    this.ACHIEVEMENT_TIME = 10 * 60 * 1000; // 10分钟，单位毫秒
    this.intervalId = null;
    this.lastActiveTime = Date.now();
    this.checkIntervalMs = 5000; // 检查间隔：5秒
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    // 从localStorage加载已累积的时间
    this.loadState();
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // 设置定时检查
    this.intervalId = setInterval(() => {
      this.checkActivity();
      this.updateTracking();
    }, this.checkIntervalMs);
    
    // 监听用户活动，记录最后活动时间
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(eventType => {
      window.addEventListener(eventType, () => {
        this.lastActiveTime = Date.now();
      });
    });
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.lastActiveTime = Date.now(); // 重置活动时间
      }
    });
    
  }

  loadState() {
    // 从localStorage加载已累积的时间
    const savedState = localStorage.getItem('silent-browsing-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.accumulatedTime = state.accumulatedTime || 0;
        this.achievementUnlocked = state.achievementUnlocked || false;
      } catch (e) {
        console.error('解析静音浏览状态失败', e);
        this.accumulatedTime = 0;
        this.achievementUnlocked = false;
      }
    }
    
    // 检查全局成就系统
    const achievementsData = localStorage.getItem('wenturc-achievements');
    if (achievementsData) {
      try {
        const achievements = JSON.parse(achievementsData);
        if (achievements['silent-browsing'] && achievements['silent-browsing'].unlocked) {
          this.achievementUnlocked = true;
        }
      } catch (e) {
        console.error('解析成就数据失败', e);
      }
    }
  }
  
  saveState() {
    const state = {
      accumulatedTime: this.accumulatedTime,
      achievementUnlocked: this.achievementUnlocked
    };
    
    localStorage.setItem('silent-browsing-state', JSON.stringify(state));
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      // 页面不可见，停止计时
      this.pauseTracking();
    } else {
      // 页面可见，恢复计时（如果处于静音状态）
      this.lastActiveTime = Date.now(); // 重置活动时间
      if (this.isMuted) {
        this.startTracking();
      }
    }
  }
  
  checkActivity() {
    // 如果用户超过2分钟没有活动，暂停计时
    const inactiveTime = Date.now() - this.lastActiveTime;
    if (inactiveTime > 2 * 60 * 1000) {
      this.pauseTracking();
    }
  }
  
  setMuteStatus(muted) {
    if (muted !== this.isMuted) {
      this.isMuted = muted;
      
      if (this.isMuted) {
        this.startTracking();
      } else {
        this.pauseTracking();
      }
    }
  }
  
  startTracking() {
    if (!this.startTime && this.isMuted && !this.achievementUnlocked && !document.hidden) {
      this.startTime = Date.now();
    }
  }
  
  pauseTracking() {
    if (this.startTime) {
      // 累计时间
      const elapsed = Date.now() - this.startTime;
      this.accumulatedTime += elapsed;
      this.startTime = null;
      
      // 保存状态
      this.saveState();
    }
  }
  
  updateTracking() {
    if (this.achievementUnlocked) {
      return; // 已经解锁成就，不再跟踪
    }
    
    // 计算当前总时间
    let totalTime = this.accumulatedTime;
    
    if (this.startTime) {
      totalTime += (Date.now() - this.startTime);
    }
    
    // 检查是否达到目标时间
    if (totalTime >= this.ACHIEVEMENT_TIME) {
      this.unlockAchievement();
    }
  }
  
  unlockAchievement() {
    if (!this.achievementUnlocked) {
      this.achievementUnlocked = true;
      this.saveState();
      
      // 触发成就解锁事件
      eventBus.emit('achievement-unlocked', 'silent-browsing');
    }
  }
  
  cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // 保存当前状态
    if (this.startTime) {
      this.pauseTracking();
    }
    
    this.initialized = false;
  }
}

// 创建单例
const silentBrowsingTracker = new SilentBrowsingTracker();

export default silentBrowsingTracker;
