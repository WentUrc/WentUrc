import eventBus from '../../../../utils/eventBus.js';

/**
 * 季节访问追踪器
 * 用于记录用户在不同季节访问网站的情况，当集齐四季时解锁成就
 */
class SeasonTracker {
  constructor() {
    this.storageKey = 'wenturc-seasons-visited';
    this.seasons = {
      spring: false,
      summer: false,
      autumn: false,
      winter: false
    };
    this.achievementId = 'four-seasons';
    this.achievementTriggered = false;
  }

  /**
   * 启用季节跟踪
   */
  enable() {
    this.loadSeasonsData();
    this.checkCurrentSeason();
  }

  /**
   * 加载已保存的季节数据
   */
  loadSeasonsData() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        this.seasons = JSON.parse(savedData);
      }
    } catch (e) {
      console.error('加载季节数据失败', e);
    }
    this.checkAchievementStatus();
  }

  /**
   * 保存季节数据
   */
  saveSeasonsData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.seasons));
  }

  /**
   * 检查当前季节并更新访问记录
   */
  checkCurrentSeason() {
    const currentSeason = this.getCurrentSeason();
    
    // 如果是新的季节，标记为已访问
    if (!this.seasons[currentSeason]) {
      this.seasons[currentSeason] = true;
      this.saveSeasonsData();
      
      // 检查是否已收集齐四个季节
      this.checkAllSeasonsCompleted();
    }
  }

  /**
   * 获取当前季节
   * @returns {string} 当前季节：spring, summer, autumn, winter
   */
  getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth() + 1; 
    
    // 按北半球季节划分
    if (month >= 3 && month <= 5) return 'spring';  
    if (month >= 6 && month <= 8) return 'summer';  
    if (month >= 9 && month <= 11) return 'autumn'; 
    return 'winter'; 
  }

  /**
   * 检查是否已收集齐四个季节
   */
  checkAllSeasonsCompleted() {
    if (this.achievementTriggered) return;
    const allSeasonsVisited = Object.values(this.seasons).every(visited => visited);
    if (allSeasonsVisited) {
      this.achievementTriggered = true;
      eventBus.emit('achievement-unlocked', this.achievementId);
    }
  }

  /**
   * 检查成就状态
   */
  checkAchievementStatus() {
    try {
      const achievementsData = localStorage.getItem('wenturc-achievements');
      if (achievementsData) {
        const achievements = JSON.parse(achievementsData);
        if (achievements[this.achievementId]?.unlocked) {
          this.achievementTriggered = true;
        }
      }
    } catch (e) {
      console.error('检查成就状态失败', e);
    }
  }

  /**
   * 获取季节访问进度
   */
  getProgress() {
    const visitedCount = Object.values(this.seasons).filter(visited => visited).length;
    return {
      spring: this.seasons.spring,
      summer: this.seasons.summer,
      autumn: this.seasons.autumn,
      winter: this.seasons.winter,
      count: visitedCount,
      total: 4,
      percentage: Math.round((visitedCount / 4) * 100)
    };
  }

  /**
   * 开发模式：设置特定季节已访问（用于测试）
   */
  devSetSeasonVisited(season, visited = true) {
    if (import.meta.env.DEV) {
      if (season in this.seasons) {
        this.seasons[season] = visited;
        this.saveSeasonsData();
        return true;
      }
    }
    return false;
  }

  /**
   * 开发模式：模拟完成所有季节
   */
  devCompleteAllSeasons() {
    if (import.meta.env.DEV) {
      this.seasons = {
        spring: true,
        summer: true,
        autumn: true,
        winter: true
      };
      this.saveSeasonsData();
      this.checkAllSeasonsCompleted();
      return true;
    }
    return false;
  }

  /**
   * 重置季节数据（开发用）
   */
  reset() {
    this.seasons = {
      spring: false,
      summer: false,
      autumn: false,
      winter: false
    };
    this.achievementTriggered = false;
    this.saveSeasonsData();
  }
}

// 创建单例
const seasonTracker = new SeasonTracker();

// 确保它在全局作用域中可访问（仅用于开发调试）
if (import.meta.env.DEV) {
  window.seasonTracker = seasonTracker;
}

export default seasonTracker;
