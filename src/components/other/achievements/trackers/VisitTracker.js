/**
 * 访问追踪器 - 跟踪用户访问记录并处理相关成就
 */
import storageService from '../../../../utils/storageService.js'

class VisitTracker {
  constructor(manager) {
    this.manager = manager
  }
  
  /**
   * 初始化
   */
  initialize() {
    this.checkConsecutiveVisits()
    this.checkSpecialTimeAchievements()
    this.checkWeekendAchievement()
  }
  
  /**
   * 检查连续访问
   */
  checkConsecutiveVisits() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    
    // 从存储服务读取访问记录
    const visitDates = storageService.getObject('visit-dates', [])
    
    // 记录今天的访问
    if (!visitDates.includes(todayStr)) {
      visitDates.push(todayStr)
      
      // 只保留最近30天的记录
      const recentDates = visitDates.length > 30 
        ? visitDates.slice(visitDates.length - 30) 
        : [...visitDates]
      
      // 使用存储服务保存
      storageService.setObject('visit-dates', recentDates)
    }
    
    // 排序日期以便计算连续天数
    const sortedDates = [...visitDates].sort()
    
    // 计算最长连续访问天数
    const maxDays = this.calculateMaxConsecutiveDays(sortedDates)
    
    if (maxDays >= 5) {
      this.manager.unlockAchievement('loyal-fan')
    }
    
    // 保存当前的连续天数
    storageService.setNumber('consecutive-days', this.calculateCurrentStreak(sortedDates))
  }
  
  /**
   * 检查特殊时间成就
   */
  checkSpecialTimeAchievements() {
    const currentHour = new Date().getHours()
    
    // 夜猫子成就 - 凌晨0-5点访问
    if (currentHour >= 0 && currentHour < 5) {
      this.manager.unlockAchievement('night-owl')
    }
    
    // 早起的鸟儿成就 - 早上5-8点访问
    if (currentHour >= 5 && currentHour < 8) {
      this.manager.unlockAchievement('early-bird')
    }
  }
  
  /**
   * 检查周末访问成就
   */
  checkWeekendAchievement() {
    const day = new Date().getDay()
    
    // 周末战士成就 - 周六(6)或周日(0)访问
    if (day === 0 || day === 6) {
      this.manager.unlockAchievement('weekend-warrior')
    }
  }
  
  /**
   * 计算最长连续访问天数
   */
  calculateMaxConsecutiveDays(dates) {
    if (!dates.length) return 0
    
    let maxConsecutiveDays = 1
    let currentStreak = 1
    
    for (let i = 1; i < dates.length; i++) {
      // 计算前一天和当前日期的时间差
      const prevDate = new Date(dates[i-1])
      const currDate = new Date(dates[i])
      const diffTime = Math.abs(currDate - prevDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        currentStreak++
        maxConsecutiveDays = Math.max(maxConsecutiveDays, currentStreak)
      } else if (diffDays > 1) {
        currentStreak = 1
      }
    }
    
    return maxConsecutiveDays
  }
  
  /**
   * 计算当前的连续天数
   */
  calculateCurrentStreak(dates) {
    if (!dates.length) return 0
    
    // 获取今天日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentStreak = 1
    const lastVisit = new Date(dates[dates.length - 1])
    
    // 确保最后一次访问是今天或昨天
    const timeDiff = Math.abs(today - lastVisit)
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 1) return 0 // 连续记录已断
    
    // 向前追溯连续访问
    for (let i = dates.length - 2; i >= 0; i--) {
      const currDate = new Date(dates[i + 1])
      const prevDate = new Date(dates[i])
      
      const diffTime = Math.abs(currDate - prevDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
    
    return currentStreak
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    // 访问追踪器不需要特殊的清理
  }
}

export default VisitTracker