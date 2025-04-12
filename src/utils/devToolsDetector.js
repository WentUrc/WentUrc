import eventBus from './eventBus.js';

/**
 * 开发者工具检测器
 * 用于检测用户是否打开了浏览器的开发者工具
 */
class DevToolsDetector {
  constructor() {
    this.isEnabled = false;
    this.isOpen = false;
    this.checkInterval = null;
    this.achievementTriggered = false;
    this.detectionCount = 0;         // 检测计数器
    this.requiredDetections = 3;     // 需要连续检测到多少次才确认
    this.checkDelay = 2000;          // 启动后延迟检测的时间
  }

  /**
   * 启用检测
   */
  enable() {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    
    // 添加启动延迟，避免页面加载时误触发
    setTimeout(() => {
      this.setupConsoleMethod();
      this.setupDevToolsListener();
      this.startChecking();
    }, this.checkDelay);
  }

  /**
   * 禁用检测
   */
  disable() {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    this.stopChecking();
  }

  /**
   * 设置控制台方法的探测钩子
   */
  setupConsoleMethod() {
    // 判断是否有人尝试使用控制台
    const oldConsoleLog = console.log;
    console.log = (...args) => {
      this.checkDevTools();
      return oldConsoleLog.apply(console, args);
    };
  }

  /**
   * 设置开发者工具监听器
   */
  setupDevToolsListener() {
    // 方法1：使用窗口大小和devtools特性检测
    window.addEventListener('resize', this.checkDevTools.bind(this));

    // 方法2：使用console.table特性检测
    window.addEventListener('devtoolschange', this.handleDevToolsChange.bind(this));
  }

  /**
   * 开始定期检查
   */
  startChecking() {
    this.checkInterval = setInterval(() => {
      this.checkDevTools();
    }, 1000);
  }

  /**
   * 停止定期检查
   */
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 检查开发者工具是否打开
   */
  checkDevTools() {
    let isOpenNow = false;

    // 方法1: 通过devtools特性检测
    try {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      isOpenNow = widthThreshold || heightThreshold;
    } catch (e) {
      /* 忽略错误 */
    }

    // 方法2: 使用更简洁的性能检测方式
    if (!isOpenNow) {
      try {
        // 创建一个简单的检测对象
        const simpleObj = {check: "devtools", status: "detecting"};
        
        const start = performance.now();
        
        // 使用debug方法，控制台不可见
        if (console.debug) {
          console.debug(simpleObj);
        }
        
        const end = performance.now();
        isOpenNow = isOpenNow || (end - start > 150);  // 保持阈值150ms
        
      } catch (e) {
        /* 忽略错误 */
      }
    }

    // 方法3：通过 Firebug 特性检测
    if (!isOpenNow) {
      try {
        isOpenNow = window.Firebug && 
                   window.Firebug.chrome && 
                   window.Firebug.chrome.isInitialized;
      } catch (e) {
        /* 忽略错误 */
      }
    }

    // 如果检测到开发工具打开，增加计数器，否则重置计数器
    if (isOpenNow) {
      this.detectionCount++;
    } else {
      this.detectionCount = 0;
    }
    
    // 只有连续多次检测到才认为确实打开了开发工具
    const confirmedOpen = this.detectionCount >= this.requiredDetections;
    
    // 如果开发工具状态确认变化，触发事件
    if (confirmedOpen !== this.isOpen) {
      this.isOpen = confirmedOpen;
      this.handleDevToolsChange({detail: {isOpen: confirmedOpen}});
    }
  }

  /**
   * 处理开发者工具状态变化
   */
  handleDevToolsChange(event) {
    const isOpen = event.detail ? event.detail.isOpen : this.isOpen;
    
    if (isOpen && !this.achievementTriggered) {
      this.achievementTriggered = true;
      // 触发成就解锁，增加延迟确保不是误触发
      setTimeout(() => {
        eventBus.emit('achievement-unlocked', 'dev-tools-explorer');
      }, 500);
    }
  }
  
  /**
   * 重置检测状态
   */
  reset() {
    this.isOpen = false;
    this.achievementTriggered = false;
    this.detectionCount = 0;
  }
}

// 创建单例
const devToolsDetector = new DevToolsDetector();

// 开发环境暴露API，方便测试
if (import.meta.env.DEV) {
  window.devToolsDetector = devToolsDetector;
}

export default devToolsDetector;
