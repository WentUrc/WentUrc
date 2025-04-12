/**
 * 彩蛋成就管理器 - 处理与彩蛋相关的成就
 */
import eventBus from '../../../../utils/eventBus.js';

class EasterEggManager {
  constructor(manager) {
    this.manager = manager;
    
    this.easterEggAchievements = [
      'logo-game',    // Logo点击小游戏
      'konami-code',  // 输入Konami密码
      'game-master'   // 在喵喵小游戏中获得高分
    ];
    
    // 绑定方法
    this.handleAchievementEvent = this.handleAchievementEvent.bind(this);
  }
  
  /**
   * 初始化彩蛋管理器
   */
  initialize() {
    // 检查彩蛋猎人成就状态
    this.checkEasterEggHunterAchievement();
    
    // 监听成就解锁事件
    eventBus.on('achievement-unlocked', this.handleAchievementEvent);
  }
  
  /**
   * 处理成就事件
   */
  handleAchievementEvent(id) {
    // 避免循环触发
    if (id !== 'easter-egg-hunter') {
      this.checkEasterEggHunterAchievement();
    }
  }
  
  /**
   * 检查彩蛋猎人成就
   */
  checkEasterEggHunterAchievement() {
    // 检查是否所有彩蛋都已找到
    const allEasterEggsFound = this.easterEggAchievements.every(id => 
      this.manager.isAchievementUnlocked(id)
    );
    
    // 如果所有彩蛋都找到了，解锁彩蛋猎人成就
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