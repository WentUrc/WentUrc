import mitt from 'mitt'
// 如果没有mitt，可以使用npm install mitt安装，或者使用下面的简易实现

// 简易事件总线实现（如果不想额外安装依赖）
const eventBus = {
  events: {},
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args))
    }
  },
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  },
  off(event, callback) {
    if (this.events[event]) {
      if (callback) {
        this.events[event] = this.events[event].filter(cb => cb !== callback)
      } else {
        delete this.events[event]
      }
    }
  }
}

export default eventBus