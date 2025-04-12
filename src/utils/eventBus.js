/**
 * 增强的事件总线系统 - 支持命名空间和更好的清理机制
 */
class EventBus {
  constructor() {
    this.events = {};
    this.componentEvents = new Map(); // 追踪组件特定的监听器
    this.debug = false; // 默认关闭调试模式
  }

  /**
   * 发布事件
   */
  emit(event, ...args) {
    if (this.debug) {
      console.log(`[EventBus] 发布事件: ${event}`, args);
    }
    
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[EventBus] 事件处理错误: ${event}`, error);
        }
      });
    }
  }

  /**
   * 订阅事件
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    if (this.debug) {
      console.log(`[EventBus] 订阅事件: ${event}`);
    }
    
    this.events[event].push(callback);
    
    return () => this.off(event, callback); // 返回取消订阅函数
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    if (this.events[event]) {
      if (callback) {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
        
        if (this.debug) {
          console.log(`[EventBus] 取消特定事件订阅: ${event}`);
        }
      } else {
        delete this.events[event];
        
        if (this.debug) {
          console.log(`[EventBus] 取消所有事件订阅: ${event}`);
        }
      }
    }
  }
  
  /**
   * 为组件注册事件 - 自动绑定组件生命周期
   */
  register(componentId, event, callback) {
    if (!this.componentEvents.has(componentId)) {
      this.componentEvents.set(componentId, []);
      
      if (this.debug) {
        console.log(`[EventBus] 注册组件: ${componentId}`);
      }
    }
    
    const handler = this.on(event, callback);
    this.componentEvents.get(componentId).push(handler);
    
    return handler;
  }
  
  /**
   * 清除组件的所有事件监听
   */
  unregisterComponent(componentId) {
    if (this.componentEvents.has(componentId)) {
      const handlers = this.componentEvents.get(componentId);
      handlers.forEach(handler => handler());
      this.componentEvents.delete(componentId);
      
      if (this.debug) {
        console.log(`[EventBus] 注销组件: ${componentId}`);
      }
    }
  }
  
  /**
   * 开启或关闭调试日志
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}

// 创建单例
const eventBus = new EventBus();

// 在开发环境开启调试 - 建议移除或保持关闭
if (import.meta.env.DEV && false) { // 添加false条件，默认关闭调试
  eventBus.setDebug(true);
}

// 导出单例
export default eventBus;