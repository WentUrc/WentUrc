/**
 * 统一的本地存储服务 - 所有localStorage访问的集中管理点
 */
class StorageService {
    constructor(prefix = 'wenturc-') {
      this.prefix = prefix
    }
    
    /**
     * 获取完整的键名
     * @param {string} key - 没有前缀的键名
     * @returns {string} 带前缀的完整键名
     */
    _getKey(key) {
      return `${this.prefix}${key}`
    }
  
    /**
     * 存储字符串值
     * @param {string} key - 键名(不含前缀)
     * @param {string} value - 值
     */
    setString(key, value) {
      localStorage.setItem(this._getKey(key), String(value))
    }
    
    /**
     * 获取字符串值
     * @param {string} key - 键名(不含前缀) 
     * @param {string} defaultValue - 默认值
     * @returns {string} 获取的值或默认值
     */
    getString(key, defaultValue = '') {
      const value = localStorage.getItem(this._getKey(key))
      return value !== null ? value : defaultValue
    }
    
    /**
     * 存储数值
     * @param {string} key - 键名(不含前缀)
     * @param {number} value - 数值
     */
    setNumber(key, value) {
      localStorage.setItem(this._getKey(key), String(Number(value)))
    }
    
    /**
     * 获取数值
     * @param {string} key - 键名(不含前缀)
     * @param {number} defaultValue - 默认值
     * @returns {number} 获取的数值或默认值
     */
    getNumber(key, defaultValue = 0) {
      const value = localStorage.getItem(this._getKey(key))
      if (value === null) return defaultValue
      const num = parseInt(value, 10)
      return isNaN(num) ? defaultValue : num
    }
    
    /**
     * 存储布尔值
     * @param {string} key - 键名(不含前缀)
     * @param {boolean} value - 布尔值
     */
    setBoolean(key, value) {
      localStorage.setItem(this._getKey(key), value ? 'true' : 'false')
    }
    
    /**
     * 获取布尔值
     * @param {string} key - 键名(不含前缀)
     * @param {boolean} defaultValue - 默认值
     * @returns {boolean} 获取的布尔值或默认值
     */
    getBoolean(key, defaultValue = false) {
      const value = localStorage.getItem(this._getKey(key))
      if (value === null) return defaultValue
      return value === 'true'
    }
    
    /**
     * 存储对象
     * @param {string} key - 键名(不含前缀)
     * @param {object|array} value - 要存储的对象或数组
     */
    setObject(key, value) {
      try {
        localStorage.setItem(this._getKey(key), JSON.stringify(value))
      } catch (e) {
        console.error(`保存数据失败: ${key}`, e)
      }
    }
    
    /**
     * 获取对象
     * @param {string} key - 键名(不含前缀)
     * @param {object|array} defaultValue - 默认值
     * @returns {object|array} 获取的对象或默认值
     */
    getObject(key, defaultValue = {}) {
      const value = localStorage.getItem(this._getKey(key))
      if (value === null) return defaultValue
      
      try {
        return JSON.parse(value)
      } catch (e) {
        console.error(`解析存储数据失败: ${key}`, e)
        return defaultValue
      }
    }
    
    /**
     * 检查键是否存在
     * @param {string} key - 键名(不含前缀)
     * @returns {boolean} 键是否存在
     */
    hasKey(key) {
      return localStorage.getItem(this._getKey(key)) !== null
    }
    
    /**
     * 删除某个键
     * @param {string} key - 键名(不含前缀)
     */
    remove(key) {
      localStorage.removeItem(this._getKey(key))
    }
    
    /**
     * 清除所有相关键
     */
    clear() {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key))
    }
  }
  
  // 导出单例实例
  export default new StorageService('wenturc-')