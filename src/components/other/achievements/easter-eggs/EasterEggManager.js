/**
 * 彩蛋成就管理器 - 处理与彩蛋相关的成就
 */
import eventBus from '../../../../utils/eventBus.js';

class EasterEggManager {
  constructor(manager) {
    this.manager = manager;
    
    this.easterEggAchievements = [
      'logo-game',    
      'konami-code',  
      'game-master'   
    ];

    this.handleAchievementEvent = this.handleAchievementEvent.bind(this);
  }
  
  /**
   * 初始化彩蛋管理器
   */
  initialize() {
    this.checkEasterEggHunterAchievement();
    eventBus.on('achievement-unlocked', this.handleAchievementEvent);
  }
  
  /**
   * 处理成就事件
   */
  handleAchievementEvent(id) {
    if (id !== 'easter-egg-hunter') {
      this.checkEasterEggHunterAchievement();
    }
  }
  
  /**
   * 检查彩蛋猎人成就
   */
  checkEasterEggHunterAchievement() {
    const allEasterEggsFound = this.easterEggAchievements.every(id => 
      this.manager.isAchievementUnlocked(id)
    );
    if (allEasterEggsFound) {
      this.manager.unlockAchievement('easter-egg-hunter');
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    eventBus.off('achievement-unlocked', this.handleAchievementEvent);
  }
}

export default EasterEggManager;