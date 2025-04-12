/**
 * 成就存储服务 - 负责加载和保存成就数据
 * 提供统一的存储接口，避免直接操作localStorage
 */
class AchievementStorage {
    constructor() {
      // 使用统一前缀避免命名冲突
      this.prefix = 'wenturc-';
      this.achievementsKey = `${this.prefix}achievements`;
    }
    
    /**
     * 加载成就数据
     */
    loadAchievements() {
      const data = this.getObject(this.achievementsKey, {});
      console.log('从存储加载成就数据:', data);
      return data;
    }
    
    /**
     * 保存成就数据
     */
    saveAchievements(achievements) {
      console.log('保存成就数据:', achievements);
      this.setObject(this.achievementsKey, achievements);
    }
    
    /**
     * 保存单个成就
     */
    saveAchievement(id, achievement) {
      const achievements = this.loadAchievements();
      achievements[id] = achievement;
      this.saveAchievements(achievements);
    }
    
    /**
     * 保存单个值到localStorage
     * @param {string} key 键名(不含前缀)
     * @param {any} value 要保存的值
     */
    setValue(key, value) {
      localStorage.setItem(`${this.prefix}${key}`, String(value));
    }
    
    /**
     * 获取localStorage中的值
     * @param {string} key 键名(不含前缀)
     * @param {string|null} defaultValue 默认值
     */
    getValue(key, defaultValue = null) {
      const value = localStorage.getItem(`${this.prefix}${key}`);
      return value !== null ? value : defaultValue;
    }
    
    /**
     * 获取localStorage中的布尔值
     * @param {string} key 键名(不含前缀)
     * @param {boolean} defaultValue 默认值
     */
    getBoolean(key, defaultValue = false) {
      const value = localStorage.getItem(`${this.prefix}${key}`);
      if (value === null) return defaultValue;
      return value === 'true';
    }
    
    /**
     * 获取localStorage中的数值
     * @param {string} key 键名(不含前缀)
     * @param {number} defaultValue 默认值
     */
    getNumber(key, defaultValue = 0) {
      try {
        const value = localStorage.getItem(`${this.prefix}${key}`);
        return value ? parseInt(value, 10) : defaultValue;
      } catch (error) {
        console.error(`获取数值 ${key} 失败:`, error);
        return defaultValue;
      }
    }
    
    /**
     * 保存数值型数据
     * @param {string} key 键名(不含前缀)
     * @param {number} value 要保存的数值
     */
    setNumber(key, value) {
      try {
        localStorage.setItem(`${this.prefix}${key}`, value.toString());
        return true;
      } catch (error) {
        console.error(`保存数值 ${key} 失败:`, error);
        return false;
      }
    }
    
    /**
     * 获取localStorage中的数组/对象
     * @param {string} key 完整键名(包含前缀)
     * @param {object|array} defaultValue 默认值
     */
    getObject(key, defaultValue = {}) {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(`解析存储数据失败: ${key}`, e);
        return defaultValue;
      }
    }
    
    /**
     * 保存对象到localStorage
     * @param {string} key 完整键名(包含前缀)
     * @param {object|array} value 要保存的对象
     */
    setObject(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`保存数据失败: ${key}`, e);
      }
    }
    
    /**
     * 获取数组数据
     * @param {string} key 键名(不含前缀)
     */
    getArray(key) {
      try {
        const value = localStorage.getItem(`${this.prefix}${key}`);
        return value ? JSON.parse(value) : [];
      } catch (error) {
        console.error(`获取数组 ${key} 失败:`, error);
        return [];
      }
    }
    
    /**
     * 保存数组数据
     * @param {string} key 键名(不含前缀)
     * @param {array} array 要保存的数组
     */
    setArray(key, array) {
      try {
        localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(array));
        return true;
      } catch (error) {
        console.error(`保存数组 ${key} 失败:`, error);
        return false;
      }
    }
    
    /**
     * 检查键是否存在
     * @param {string} key 键名(不含前缀)
     */
    hasKey(key) {
      return localStorage.getItem(`${this.prefix}${key}`) !== null;
    }
    
    /**
     * 删除localStorage中的项
     * @param {string} key 键名(不含前缀)
     */
    remove(key) {
      localStorage.removeItem(`${this.prefix}${key}`);
    }
    
    /**
     * 清除所有相关存储
     */
    clear() {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    }
  }
  
  export default AchievementStorage;