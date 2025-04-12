import eventBus from './eventBus.js';

/**
 * 开发者工具检测器 - 更友好的检测机制喵～
 * 用于检测用户是否打开了浏览器的开发者工具
 */
class DevToolsDetector {
  constructor() {
    this.isEnabled = false;
    this.isOpen = false;
    this.checkInterval = null;
    this.achievementTriggered = false;
    this.detectionCount = 0;         // 检测计数器
    this.consecutiveCount = 0;       // 连续检测到的次数
    this.requiredDetections = 5;     // 需要连续检测到多少次才确认（增大这个值）
    this.checkDelay = 5000;          // 启动后延迟检测的时间（增大延迟）
    this.confirmationTimeout = null; // 确认超时
    this.confirmationDelay = 3000;   // 额外确认延迟
    this.hasUserInteraction = false; // 跟踪用户是否与页面有交互
    this.elementSizeInterval = null; // 元素尺寸检测间隔
    this.originalConsoleMethods = {}; // 保存原始控制台方法
  }

  /**
   * 启用检测
   */
  enable() {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    
    // 添加用户交互检测
    this.setupUserInteractionTracking();
    
    // 添加启动延迟，避免页面加载时误触发
    setTimeout(() => {
      // 只有在用户与页面交互后才启动检测
      if (this.hasUserInteraction) {
        this.setupConsoleMethod();
        this.setupDevToolsListener();
        this.startChecking();
      } else {
        // 继续等待用户交互
        const interactionListener = () => {
          if (!this.hasUserInteraction) return;
          
          this.setupConsoleMethod();
          this.setupDevToolsListener();
          this.startChecking();
          
          // 移除事件监听器
          document.removeEventListener('click', interactionListener);
          document.removeEventListener('keydown', interactionListener);
        };
        
        document.addEventListener('click', interactionListener);
        document.addEventListener('keydown', interactionListener);
      }
    }, this.checkDelay);
  }

  /**
   * 设置用户交互跟踪
   */
  setupUserInteractionTracking() {
    const markInteraction = () => {
      this.hasUserInteraction = true;
      // 至少互动过一次后再移除监听器
      document.removeEventListener('click', markInteraction);
      document.removeEventListener('keydown', markInteraction);
      document.removeEventListener('scroll', markInteraction);
    };
    
    document.addEventListener('click', markInteraction);
    document.addEventListener('keydown', markInteraction);
    document.addEventListener('scroll', markInteraction);
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
    // 增强检测能力，监听多种控制台方法
    const methods = ['log', 'debug', 'info', 'warn', 'error'];
    
    methods.forEach(method => {
      // 保存原始方法
      this.originalConsoleMethods[method] = console[method];
      
      console[method] = (...args) => {
        // 每次调用控制台方法都有可能是通过开发者工具
        this.detectionCount++;
        if (this.detectionCount > this.requiredDetections && !this.achievementTriggered) {
          this.checkDevTools();
        }
        return this.originalConsoleMethods[method].apply(console, args);
      };
    });
    
    // 保存原始清空方法
    this.originalConsoleMethods.clear = console.clear;
    
    // 监听错误事件，可能会在开发者工具打开时触发
    this.errorHandler = () => this.checkDevTools();
    window.addEventListener('error', this.errorHandler);
  }

  /**
   * 恢复原始控制台方法
   */
  restoreConsoleMethods() {
    // 恢复所有被修改的控制台方法
    Object.keys(this.originalConsoleMethods).forEach(method => {
      console[method] = this.originalConsoleMethods[method];
    });
    
    // 移除错误监听器
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
  }

  /**
   * 设置开发者工具监听器
   */
  setupDevToolsListener() {
    // 方法1：监听窗口大小变化
    this.resizeHandler = this.checkDevTools.bind(this);
    window.addEventListener('resize', this.resizeHandler);
    
    // 方法2：定期检查元素宽高差异
    this.elementSizeInterval = setInterval(() => {
      this.checkElementSizeDifference();
    }, 2000);
    
    // 方法3：监听右键菜单，开发者通常会右键检查元素
    this.contextHandler = () => {
      this.detectionCount += 2;
      this.checkDevTools();
    };
    document.addEventListener('contextmenu', this.contextHandler);
    
    // 方法4：监听键盘组合键
    this.keyHandler = (e) => {
      // Ctrl+Shift+I, F12等常用开发工具快捷键
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          e.key === 'F12') {
        this.detectionCount += 5;
        this.consecutiveCount += 2;
        this.checkDevTools();
      }
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * 移除所有事件监听器
   */
  removeEventListeners() {
    // 移除窗口大小变化监听
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // 移除右键菜单监听
    if (this.contextHandler) {
      document.removeEventListener('contextmenu', this.contextHandler);
    }
    
    // 移除键盘监听
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
  }

  /**
   * 检查元素尺寸差异 - 新方法喵～
   * 开发者工具开启时会影响DOM元素尺寸计算
   */
  checkElementSizeDifference() {
    try {
      // 创建一个测试元素来检测尺寸差异
      const element = document.createElement('div');
      element.style.cssText = 'position:fixed;top:-9999px;height:100vh;width:100vw;';
      document.body.appendChild(element);
      
      const heightDiff = Math.abs(window.innerHeight - element.clientHeight);
      const widthDiff = Math.abs(window.innerWidth - element.clientWidth);
      
      // 清理测试元素
      document.body.removeChild(element);
      
      // 如果差异显著，可能是开发者工具占用了空间
      if (heightDiff > 100 || widthDiff > 100) {
        this.detectionCount += 2;
        this.consecutiveCount++;
        this.isConsoleOpen = true;
        this.checkDevTools();
      }
    } catch (e) {
      /* 忽略错误喵～ */
    }
  }

  /**
   * 开始定期检查
   */
  startChecking() {
    this.checkInterval = setInterval(() => {
      this.checkDevTools();
      
      // 新增：定期检查开发者特性，但不使用debugger
      this.checkDevFeatures();
    }, 1800); // 增加间隔，降低性能影响
  }

  /**
   * 检查开发者特性 - 对开发友好的方法喵～
   */
  checkDevFeatures() {
    try {
      // 检查1：开发者特有对象
      if (window.chrome && window.chrome.devtools) {
        this.detectionCount += 5;
        this.consecutiveCount += 3;
      }
      
      // 检查2：调试状态
      const isDebugging = (function() {
        let isDebug = false;
        Function.prototype.toString = function() {
          isDebug = true;
          return 'function() { [native code] }';
        };
        
        const testFn = function test() {};
        testFn.toString();
        
        // 恢复原始方法
        delete Function.prototype.toString;
        return isDebug;
      })();
      
      if (isDebugging) {
        this.detectionCount += 3;
        this.consecutiveCount += 2;
      }
      
      // 检查3：控制台检测技巧
      const consoleCheck = /./;
      consoleCheck.toString = function() {
        this.detectionCount += 3;
        return 'dev tool detected';
      };
      
      // 检查4：Date对象检测 - 更友好的替代方法
      const dateCheck = function() {
        const start = Date.now();
        const count = 1000000; // 执行一个耗时但不阻塞的循环
        let sum = 0;
        
        for (let i = 0; i < count; i++) {
          sum += i;
        }
        
        const end = Date.now();
        const diff = end - start;
        
        // 如果执行时间异常长，可能是调试状态下
        return diff > 100; // 正常应该很快，但调试状态下可能变慢
      };
      
      if (dateCheck()) {
        this.detectionCount += 2;
      }
      
      // 检查5：DOM检测技巧
      const bodyRects = document.body.getClientRects();
      if (bodyRects.length > 0) {
        const rect = bodyRects[0];
        // 检测一些可能因开发工具打开而改变的DOM参数
        if (window.innerWidth - rect.width > 200) {
          this.detectionCount += 4;
          this.consecutiveCount += 2;
        }
      }
      
      // 高达一定计数时直接触发
      if (this.detectionCount >= this.requiredDetections * 3) {
        this.forceUnlockAchievement();
      }
    } catch (e) {
      /* 忽略错误喵～ */
    }
  }

  /**
   * 停止定期检查并清理所有资源
   */
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.elementSizeInterval) {
      clearInterval(this.elementSizeInterval);
      this.elementSizeInterval = null;
    }
    
    // 恢复原始控制台方法
    this.restoreConsoleMethods();
    
    // 移除所有事件监听器
    this.removeEventListeners();
    
    console.log('DevToolsDetector 已停止检测喵～现在可以自由使用控制台了！');
  }

  /**
   * 检查开发者工具是否打开
   */
  checkDevTools() {
    let isOpenNow = false;
    let detectionPoints = 0;

    // 方法1: 尺寸差异法
    try {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        detectionPoints += 2;
      }
    } catch (e) { /* 忽略错误喵～ */ }

    // 方法2: 特殊日志检测
    try {
      const detector = new Image();
      detector.__defineGetter__('id', function() {
        detectionPoints += 3;
      });
      console.log('%c', detector);
    } catch (e) { /* 忽略错误喵～ */ }
    
    // 方法3: 检测日志清理
    try {
      console.clear();
      detectionPoints += 1;
    } catch (e) { /* 忽略错误喵～ */ }

    // 这里使用比较积极的策略：只要检测到任何可能性，就增加计数
    if (detectionPoints > 0 || this.detectionCount > this.requiredDetections) {
      this.consecutiveCount++;
      this.detectionCount++;
    } else {
      this.consecutiveCount = Math.max(0, this.consecutiveCount - 1);
    }
    
    // 使用总体计数而非连续计数作为主要判断依据
    const detectionThreshold = this.consecutiveCount >= 3 || this.detectionCount >= this.requiredDetections * 2;
    
    if (detectionThreshold && !this.isOpen) {
      this.isOpen = true;
      
      // 立即检查，并设置延迟确认
      if (this.detectionCount > this.requiredDetections + 5) {
        if (this.confirmationTimeout) {
          clearTimeout(this.confirmationTimeout);
        }
        
        this.confirmationTimeout = setTimeout(() => {
          this.handleDevToolsChange({detail: {isOpen: true}});
        }, 500);
      }
    }
  }

  /**
   * 强制解锁成就并停止检测 - 新方法喵～
   */
  forceUnlockAchievement() {
    if (!this.achievementTriggered) {
      this.achievementTriggered = true;
      console.log('检测到开发者工具已打开喵～(强制触发)');
      setTimeout(() => {
        eventBus.emit('achievement-unlocked', 'dev-tools-explorer');
        // 成就解锁后立即停止检测
        this.stopChecking();
      }, 500);
    }
  }

  /**
   * 处理开发者工具状态变化
   */
  handleDevToolsChange(event) {
    const isOpen = event.detail ? event.detail.isOpen : this.isOpen;
    
    if (isOpen && !this.achievementTriggered) {
      this.achievementTriggered = true;
      console.log('检测到开发者工具已打开喵～');
      setTimeout(() => {
        eventBus.emit('achievement-unlocked', 'dev-tools-explorer');
        // 成就解锁后立即停止检测
        this.stopChecking();
      }, 800);
    }
  }
  
  /**
   * 重置检测状态
   */
  reset() {
    this.isOpen = false;
    this.achievementTriggered = false;
    this.detectionCount = 0;
    this.consecutiveCount = 0;
    
    if (this.confirmationTimeout) {
      clearTimeout(this.confirmationTimeout);
      this.confirmationTimeout = null;
    }
    
    if (this.elementSizeInterval) {
      clearInterval(this.elementSizeInterval);
      this.elementSizeInterval = null;
    }
  }
}

// 创建单例
const devToolsDetector = new DevToolsDetector();

// 开发环境暴露API，方便测试
if (import.meta.env.DEV) {
  window.devToolsDetector = devToolsDetector;
  
  // 添加调试辅助方法
  window.triggerDevToolsAchievement = () => {
    devToolsDetector.forceUnlockAchievement();
    return '已手动触发开发者工具成就喵～';
  };
  
  // 开发环境下打印初始化提示
  console.log('DevToolsDetector 已初始化喵～ 可用 triggerDevToolsAchievement() 手动触发成就');
}

export default devToolsDetector;
