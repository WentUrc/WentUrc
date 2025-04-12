/**
 * 通知服务工具
 * 提供全站统一的通知提示功能
 */
import { createVNode, render } from 'vue';
import eventBus from './eventBus.js';

const notifications = {
  topRight: [],
  topLeft: [],
  bottomRight: [],
  bottomLeft: [],
  top: [],
  bottom: []
};

const containers = {};

const defaultOptions = {
  duration: 4500,
  position: 'bottomLeft',
  closable: true,
  showIcon: true,
  className: '',
  onClose: null,
  onClick: null,
  offset: 16,
  zIndex: 9999,
  maxCount: 5,
  animationDuration: 300
};

const typeConfig = {
  info: {
    icon: 'fa-info-circle',
    color: 'var(--icon-primary, #5e60ce)'
  },
  success: {
    icon: 'fa-check-circle',
    color: 'var(--icon-accent, #38d9a9)' 
  },
  warning: {
    icon: 'fa-exclamation-circle',
    color: 'var(--icon-accent, #f1b944)'
  },
  error: {
    icon: 'fa-times-circle',
    color: 'var(--icon-accent, #ff6b6b)'
  },
  achievement: {
    icon: 'fa-trophy',
    color: 'var(--icon-accent, gold)'
  }
};

/**
 * 创建通知容器
 */
const createContainer = (position) => {
  if (containers[position]) {
    return containers[position];
  }

  const container = document.createElement('div');
  container.className = `notification-container notification-${position}`;
  container.style.position = 'fixed';
  container.style.zIndex = defaultOptions.zIndex;
  container.style.pointerEvents = 'none';

  switch (position) {
    case 'topRight':
      container.style.top = '20px';
      container.style.right = '20px';
      break;
    case 'topLeft':
      container.style.top = '20px';
      container.style.left = '20px';
      break;
    case 'bottomRight':
      container.style.bottom = '20px';
      container.style.right = '20px';
      break;
    case 'bottomLeft':
      container.style.bottom = '20px';
      container.style.left = '20px';
      break;
    case 'top':
      container.style.top = '20px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      break;
    case 'bottom':
      container.style.bottom = '20px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      break;
  }

  document.body.appendChild(container);
  containers[position] = container;
  return container;
};

/**
 * 生成通知DOM
 */
const createNotificationElement = (options) => {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification notification-${options.type} ${options.className || ''}`;
  notificationElement.style.pointerEvents = 'auto';
  notificationElement.style.opacity = '0';
  notificationElement.style.transform = options.position.includes('top') 
    ? 'translateY(-20px)' 
    : 'translateY(20px)';
  notificationElement.style.transition = `opacity ${options.animationDuration}ms ease, transform ${options.animationDuration}ms ease`;
  notificationElement.style.marginBottom = `${options.offset}px`;
  notificationElement.style.borderRadius = '12px';
  notificationElement.style.padding = '12px 16px';
  notificationElement.style.display = 'flex';
  notificationElement.style.alignItems = 'center';
  notificationElement.style.width = '300px';
  notificationElement.style.maxWidth = '100%';
  notificationElement.style.boxSizing = 'border-box';

  const contentHTML = `
    ${options.showIcon ? `
      <div class="notification-icon" style="margin-right: 12px; color: ${typeConfig[options.type].color};">
        <i class="fas ${typeConfig[options.type].icon}" style="font-size: 18px;"></i>
      </div>
    ` : ''}
    <div class="notification-content" style="flex: 1; min-width: 0;">
      ${options.title ? `<div class="notification-title">${options.title}</div>` : ''}
      <div class="notification-message">${options.message}</div>
    </div>
    ${options.closable ? `
      <div class="notification-close" style="margin-left: 12px; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
        <i class="fas fa-times"></i>
      </div>
    ` : ''}
  `;

  notificationElement.innerHTML = contentHTML;

  if (options.onClick) {
    notificationElement.style.cursor = 'pointer';
    notificationElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close') || 
          e.target.closest('.notification-close')) {
        return;
      }
      options.onClick(e);
    });
  }

  if (options.closable) {
    const closeBtn = notificationElement.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeNotification(notificationElement, options);
      });
      
      closeBtn.addEventListener('mouseover', function() {
        this.style.color = 'var(--icon-primary, #5e60ce)';
        this.style.transform = 'scale(1.2)';
      });
      
      closeBtn.addEventListener('mouseout', function() {
        this.style.color = 'var(--text-color, #999)';
        this.style.transform = 'scale(1)';
      });
    }
  }

  return notificationElement;
};

/**
 * 关闭通知
 */
const closeNotification = (element, options) => {
  element.style.opacity = '0';
  element.style.transform = options.position.includes('top') 
    ? 'translateY(-20px)' 
    : 'translateY(20px)';

  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);

      const list = notifications[options.position];
      const index = list.findIndex(item => item.element === element);
      if (index !== -1) {
        list.splice(index, 1);
      }

      if (typeof options.onClose === 'function') {
        options.onClose();
      }

      eventBus.emit('notification:closed', { id: options.id, type: options.type });
    }
  }, options.animationDuration);
};

/**
 * 显示通知
 */
const showNotification = (customOptions) => {
  const options = { ...defaultOptions, ...customOptions, id: Date.now() };
  const container = createContainer(options.position);
  const element = createNotificationElement(options);

  container.appendChild(element);
  
  const notificationsList = notifications[options.position];
  if (notificationsList.length >= options.maxCount) {
    const oldestNotification = notificationsList[0];
    closeNotification(oldestNotification.element, oldestNotification.options);
  }

  notificationsList.push({ element, options });

  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 10);

  let timer = null;
  if (options.duration > 0) {
    timer = setTimeout(() => {
      closeNotification(element, options);
    }, options.duration);

    element.addEventListener('mouseenter', () => {
      clearTimeout(timer);
    });

    element.addEventListener('mouseleave', () => {
      timer = setTimeout(() => {
        closeNotification(element, options);
      }, options.duration);
    });
  }

  eventBus.emit('notification:shown', { id: options.id, type: options.type });

  return {
    close: () => {
      clearTimeout(timer);
      closeNotification(element, options);
    },
    element
  };
};

/**
 * 清除所有通知
 */
const clearAll = (position) => {
  const clearPosition = (pos) => {
    const list = notifications[pos];
    list.forEach(({ element, options }) => {
      closeNotification(element, options);
    });
    list.length = 0;
  };

  if (position) {
    if (notifications[position]) {
      clearPosition(position);
    }
  } else {
    Object.keys(notifications).forEach(clearPosition);
  }
};

const notificationService = {};

Object.keys(typeConfig).forEach(type => {
  notificationService[type] = (messageOrOptions, options = {}) => {
    if (typeof messageOrOptions === 'string') {
      return showNotification({ ...options, message: messageOrOptions, type });
    }
    return showNotification({ ...messageOrOptions, type });
  };
});

notificationService.clearAll = clearAll;

const recentAchievements = new Set();

notificationService.achievement = (title, message, options = {}) => {
  const achievementId = options.achievementId || message;
  if (recentAchievements.has(achievementId)) {
    return { close: () => {} };
  }
  
  recentAchievements.add(achievementId);
  
  setTimeout(() => {
    recentAchievements.delete(achievementId);
  }, 5000);
  
  const achievementOptions = {
    title,
    message,
    type: 'achievement',
    duration: 6000,
    position: 'bottomLeft',
    className: 'notification-achievement',
    muteSound: true,
    ...options
  };
  
  if (achievementOptions.muteSound === false) {
    const achievementSound = new Audio('/sounds/achievement.mp3');
    achievementSound.volume = 0.5;
    achievementSound.play().catch(err => {});
  }
  
  return showNotification(achievementOptions);
};

notificationService.desktop = async (title, options = {}) => {
  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    } catch (err) {
      return null;
    }
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.webp',
      badge: '/favicon.webp',
      ...options
    });

    if (options.onClick) {
      notification.onclick = options.onClick;
    }

    if (options.onClose) {
      notification.onclose = options.onClose;
    }

    return notification;
  } catch (err) {
    return null;
  }
};

notificationService.configPresets = {
  copySuccess: (message = '复制成功') => {
    return notificationService.success(message, {
      duration: 2000,
      position: 'bottomLeft',
      className: 'notification-copy'
    });
  },
  
  loadError: (message = '加载失败，请稍后再试') => {
    return notificationService.error(message, {
      duration: 5000,
      position: 'bottomLeft'
    });
  },
  
  saveSuccess: (message = '保存成功') => {
    return notificationService.success(message, {
      position: 'bottomLeft'
    });
  }
};

const addStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes notification-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
      20%, 40%, 60%, 80% { transform: translateX(3px); }
    }
    
    .notification-error:hover {
      animation: notification-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    .notification {
      background: linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.95)), var(--card-bg, rgba(255, 255, 255, 0.95))) padding-box,
                 linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box !important;
      box-shadow: 0 5px 15px var(--card-shadow, rgba(0, 0, 0, 0.15)) !important;
      border: 3px solid transparent !important;
      border-radius: 12px !important;
      transform: translateX(-20px) !important;
      transition: all 0.3s ease !important;
    }
    
    .notification[style*="opacity: 1"] {
      transform: translateX(0) !important;
    }
    
    .notification-success {
      background: linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.95)), var(--card-bg, rgba(255, 255, 255, 0.95))) padding-box,
                 linear-gradient(45deg, var(--icon-accent, #38d9a9), var(--icon-primary, #5e60ce)) border-box !important;
    }
    
    .notification-error {
      background: linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.95)), var(--card-bg, rgba(255, 255, 255, 0.95))) padding-box,
                 linear-gradient(45deg, var(--icon-accent, #ff6b6b), var(--icon-primary, #5e60ce)) border-box !important;
    }
    
    .notification-achievement {
      background: linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.95)), var(--card-bg, rgba(255, 255, 255, 0.95))) padding-box,
                 linear-gradient(45deg, gold, var(--icon-accent, #ff6b6b), var(--icon-primary, #5e60ce)) border-box !important;
      box-shadow: 0 5px 15px var(--card-shadow, rgba(255, 215, 0, 0.3)) !important;
    }
    
    .notification-copy {
      transform: translateY(0) !important;
    }
    
    .notification-container.notification-bottomLeft {
      bottom: 100px !important;
      left: 20px !important;
    }
    
    .notification-container.notification-bottomRight {
      bottom: 100px !important; 
    }
    
    .notification-title {
      color: var(--icon-primary, #5e60ce) !important;
      font-weight: 600;
      margin-bottom: 4px !important;
    }
    
    .notification-message {
      color: var(--text-color, #666) !important;
    }
    
    .notification-close:hover {
      color: var(--icon-accent, #ff6b6b) !important;
    }
    
    @media (max-width: 768px) {
      .notification {
        width: 250px !important;
      }
      
      .notification-top, 
      .notification-bottom {
        width: 80% !important;
        max-width: 300px;
      }
      
      .notification-container.notification-bottomLeft {
        bottom: 80px !important;
        left: 10px !important;
      }
    }
  `;
  document.head.appendChild(styleElement);
};

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', addStyles);
}

export default notificationService;
