import eventBus from '../../../../utils/eventBus.js';
import notificationService from '../../../../utils/notificationService.js';

class NotificationManager {
  constructor() {
    this.notification = {
      show: false,
      name: '',
      icon: '',
      timer: null
    };
    
    this.currentNotification = null;
  }
  
  /**
   * 显示成就解锁通知
   */
  showNotification(achievement) {
    this.clearTimer();
    
    if (!achievement) {
      return;
    }
    
    this.notification = {
      show: false,
      name: '',
      icon: '',
      timer: null
    };
    
    setTimeout(() => {
      this.notification = {
        show: true,
        name: achievement.name || "未知成就",
        icon: achievement.icon || "fas fa-award",
        timer: null
      };
      
      this.currentNotification = notificationService.achievement(
        '成就解锁', 
        achievement.name || '未知成就',
        {
          duration: 4000,
          muteSound: true,
          achievementId: achievement.id || achievement.name,
          onClick: () => {
            eventBus.emit('open-achievements-panel');
          }
        }
      );
      
      this.notification.timer = setTimeout(() => {
        this.hideNotification();
      }, 4000);
    }, 0);
  }
  
  /**
   * 隐藏通知
   */
  hideNotification() {
    this.notification = { 
      ...this.notification, 
      show: false 
    };
    
    if (this.currentNotification) {
      this.currentNotification.close();
      this.currentNotification = null;
    }
  }
  
  /**
   * 清理定时器
   */
  clearTimer() {
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
      this.notification.timer = null;
    }
    
    if (this.currentNotification) {
      this.currentNotification.close();
      this.currentNotification = null;
    }
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    this.clearTimer();
  }
}

export default NotificationManager;