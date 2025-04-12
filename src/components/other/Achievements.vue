<template>
  <div>
    <!-- 成就按钮，点击时打开成就面板 -->
    <button class="achievements-button" @click="toggleAchievementsPanel" :class="{ 'has-new': hasNewAchievements }">
      <i class="fas fa-trophy"></i>
      <span class="achievement-count">{{ unlockedCount }}</span>
    </button>
    
    <!-- 成就面板（弹窗形式）使用Vue过渡效果 -->
    <transition name="panel">
      <div class="achievements-overlay" v-if="showPanel" @click="closePanel">
        <div class="achievements-panel" @click.stop>
          <div class="panel-header">
            <h2>
              <i class="fas fa-trophy"></i>
              我的成就喵～
            </h2>
            <button class="close-button" @click="closePanel">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="panel-stats">
            <div class="stats-item">
              <span class="stats-value">{{ unlockedCount }}</span>
              <span class="stats-label">已解锁</span>
            </div>
            <div class="stats-item">
              <span class="stats-value">{{ totalAchievements }}</span>
              <span class="stats-label">总成就</span>
            </div>
            <div class="stats-item">
              <span class="stats-value">{{ unlockedPercentage }}%</span>
              <span class="stats-label">完成度</span>
            </div>
          </div>
          
          <div class="panel-content">
            <transition-group name="achievement-list" tag="div" class="achievement-items-container">
              <div 
                v-for="(achievement, id) in achievements" 
                :key="id" 
                class="achievement-item"
                :class="{ 
                  'unlocked': userAchievements[id]?.unlocked,
                  'new': userAchievements[id]?.isNew,
                  'secret': achievement.secret && !userAchievements[id]?.unlocked
                }"
                @click="acknowledgeAchievement(id)"
              >
                <div class="achievement-icon">
                  <i :class="isSecretAndLocked(achievement, id) ? 'fas fa-question' : achievement.icon"></i>
                </div>
                <div class="achievement-info">
                  <h3 class="achievement-name">
                    {{ isSecretAndLocked(achievement, id) ? '???' : achievement.name }}
                  </h3>
                  <p class="achievement-description">
                    {{ isSecretAndLocked(achievement, id) ? '这是一个隐藏成就，继续探索以解锁喵～' : achievement.description }}
                  </p>
                  <p v-if="userAchievements[id]?.unlocked" class="achievement-date">
                    {{ formatDate(userAchievements[id].timestamp) }}
                  </p>
                </div>
                <div class="achievement-status">
                  <i v-if="userAchievements[id]?.unlocked" class="fas fa-check-circle"></i>
                  <i v-else class="fas fa-lock"></i>
                </div>
              </div>
            </transition-group>
          </div>
          
          <div class="panel-footer">
            <p class="secret-hint">继续探索网站还有更多秘密等待发现喵～</p>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 成就解锁通知使用改进的过渡效果 -->
    <transition name="notification">
      <div class="achievement-notification" v-if="notification.show">
        <div class="notification-icon">
          <i :class="notification.icon"></i>
        </div>
        <div class="notification-content">
          <h4>解锁成就喵～</h4>
          <p>{{ notification.name }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import eventBus from '../../utils/eventBus.js'
import achievementsData from '../../assets/data/achievements.json'

export default {
  name: 'Achievements',
  data() {
    return {
      showPanel: false,
      userAchievements: {},
      hasNewAchievements: false, 
      viewedNewAchievements: false, 
      notification: {
        show: false,
        name: '',
        icon: '',
        timer: null
      },
      achievements: achievementsData
    }
  },
  computed: {
    unlockedCount() {
      return Object.keys(this.userAchievements).filter(id => 
        this.userAchievements[id]?.unlocked
      ).length;
    },
    totalAchievements() {
      return Object.keys(this.achievements).length;
    },
    unlockedPercentage() {
      if (this.totalAchievements === 0) return 0;
      return Math.round((this.unlockedCount / this.totalAchievements) * 100);
    }
  },
  mounted() {
    // 从localStorage加载成就数据
    this.loadAchievements();
    this.checkTimeBasedAchievements();
    
    eventBus.on('achievement-unlocked', this.handleAchievementUnlock);
    eventBus.on('theme-changed', () => this.unlockAchievement('theme-changer'));
    eventBus.on('music-played', () => this.unlockAchievement('music-lover'));
    eventBus.on('quote-favorited', () => this.unlockAchievement('quote-collector'));
  },
  beforeUnmount() { 
    
    // Vue 3 中使用 beforeUnmount 替代 beforeDestroy
    eventBus.off('achievement-unlocked', this.handleAchievementUnlock);
    eventBus.off('theme-changed');
    eventBus.off('music-played');
    eventBus.off('quote-favorited');
    
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
    }
  },
  methods: {
    isSecretAndLocked(achievement, id) {
      return achievement.secret && !(this.userAchievements[id]?.unlocked);
    },
    
    toggleAchievementsPanel() {
      this.showPanel = !this.showPanel;
      if (this.showPanel) {
        this.viewedNewAchievements = true;
        this.hasNewAchievements = false;
        
        const updatedAchievements = { ...this.userAchievements };
        Object.keys(updatedAchievements).forEach(id => {
          if (updatedAchievements[id].isNew) {
            updatedAchievements[id].isNew = false;
          }
        });
        
        // 保存到localStorage
        this.userAchievements = updatedAchievements;
        this.saveAchievements();
      }
    },
    
    closePanel() {
      this.showPanel = false;
    },
    
    loadAchievements() {
      // 从localStorage加载成就数据
      const saved = localStorage.getItem('wenturc-achievements') || '{}';
      try {
        this.userAchievements = JSON.parse(saved);
        this.hasNewAchievements = Object.values(this.userAchievements).some(a => a.isNew);
      } catch (e) {
        console.error('解析成就数据失败', e);
        this.userAchievements = {};
      }
    },
    
    saveAchievements() {
      // 保存成就数据到localStorage
      localStorage.setItem('wenturc-achievements', JSON.stringify(this.userAchievements));
    },
    
    unlockAchievement(id) {
      if (!this.achievements[id] || (this.userAchievements[id] && this.userAchievements[id].unlocked)) {
        return;
      }
      
      // 解锁成就
      const achievement = {
        unlocked: true,
        timestamp: new Date().toISOString(),
        isNew: true
      };
      
      this.userAchievements = {
        ...this.userAchievements,
        [id]: achievement
      };
      
      this.saveAchievements();
      this.hasNewAchievements = true;
      this.showNotification(id);
    },
    
    handleAchievementUnlock(id) {
      this.unlockAchievement(id);
    },
    
    showNotification(id) {
      // 清除之前的通知计时器
      if (this.notification.timer) {
        clearTimeout(this.notification.timer);
      }
      
      const achievement = this.achievements[id];
      if (!achievement) return;
      
      // 设置通知内容
      this.notification = {
        show: true,
        name: achievement.name,
        icon: achievement.icon,
        timer: null
      };
      
      // 设置通知自动消失
      this.notification.timer = setTimeout(() => {
        this.notification.show = false;
      }, 4000);
    },
    
    acknowledgeAchievement(id) {
      if (this.userAchievements[id]?.isNew) {
        const updatedAchievement = {
          ...this.userAchievements[id],
          isNew: false
        };
        
        this.userAchievements = {
          ...this.userAchievements,
          [id]: updatedAchievement
        };
        
        this.saveAchievements();
      }
    },
    
    checkTimeBasedAchievements() {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); 
      
      // 夜猫子成就 - 深夜访问
      if (hour >= 0 && hour < 5) {
        this.unlockAchievement('night-owl');
      }
      
      // 早起的鸟儿 - 清晨访问
      if (hour >= 5 && hour < 8) {
        this.unlockAchievement('early-bird');
      }
      
      // 周末战士 - 周末访问
      if (day === 0 || day === 6) {
        this.unlockAchievement('weekend-warrior');
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    }
  }
}
</script>

<style scoped>
.achievements-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--card-bg, rgba(255, 255, 255, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 
    0 4px 10px var(--card-shadow, rgba(0, 0, 0, 0.1)),
    0 0 0 2px var(--divider-color, rgba(94, 96, 206, 0.15));
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1000;
  overflow: hidden;
}

.achievements-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient, linear-gradient(135deg, #dcbff8, #d1ecf9));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.achievements-button i {
  position: relative;
  z-index: 1;
  color: var(--icon-primary, #5e60ce);
  font-size: 20px;
  transition: all 0.3s ease;
}

.achievements-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 8px 16px var(--card-shadow, rgba(0, 0, 0, 0.15)),
    0 0 0 2px var(--icon-primary, rgba(94, 96, 206, 0.5));
}

.achievements-button:hover::before {
  opacity: 0.3;
}

.achievements-button:hover i {
  color: var(--icon-accent, #6b90ff);
  transform: rotate(15deg);
}

.achievements-button.has-new::after {
  content: '';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  background: #ff6b6b;
  border-radius: 50%;
  border: 2px solid var(--card-bg, white);
  z-index: 2;
  animation: pulse 1.5s infinite;
}

.achievement-count {
  position: absolute;
  bottom: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--icon-primary, #5e60ce);
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-weight: bold;
  padding: 0 3px;
}

/* 成就面板样式 */
.achievements-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(3px);
}

/* 面板进入和离开的过渡 */
.panel-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 0.96, 0.64, 1);
}

.panel-enter-from, .panel-leave-to {
  opacity: 0;
}

.panel-enter-from .achievements-panel {
  transform: scale(0.85) translateY(30px);
  opacity: 0;
}

.panel-leave-to .achievements-panel {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.achievements-panel {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border: 4px solid transparent;
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.95)), var(--card-bg, rgba(255, 255, 255, 0.95))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid var(--divider-color, rgba(94, 96, 206, 0.15));
}

.panel-header h2 {
  font-size: 24px;
  margin: 0;
  color: var(--icon-primary, #5e60ce);
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-header h2 i {
  color: var(--icon-accent, #6b90ff);
}

.close-button {
  background: transparent;
  border: none;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  color: var(--icon-primary, #5e60ce);
  transition: all 0.3s ease;
}

.close-button:hover {
  transform: scale(1.2) rotate(90deg);
  color: var(--icon-accent, #6b90ff);
}

/* 成就统计区域 */
.panel-stats {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  background: linear-gradient(to right, transparent, var(--divider-color, rgba(94, 96, 206, 0.05)), transparent);
  margin-bottom: 10px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--icon-primary, #5e60ce);
}

.stats-label {
  font-size: 14px;
  color: var(--text-color, #666);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px;
}

.achievement-items-container {
  min-height: 200px;
}

.achievement-list-enter-active,
.achievement-list-leave-active {
  transition: all 0.4s ease;
}

.achievement-list-enter-from,
.achievement-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.achievement-list-move {
  transition: transform 0.4s ease;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, rgba(94, 96, 206, 0.3));
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover, rgba(94, 96, 206, 0.5));
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 10px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--card-shadow, rgba(0, 0, 0, 0.05));
  transition: all 0.3s ease;
  border: 1px solid var(--divider-color, rgba(94, 96, 206, 0.15));
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.achievement-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-gradient, linear-gradient(to bottom, #6b90ff, #5e60ce));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px var(--card-shadow, rgba(0, 0, 0, 0.1));
}

.achievement-item:hover::before {
  opacity: 1;
}

.achievement-item.unlocked {
  border-color: var(--icon-primary, rgba(94, 96, 206, 0.3));
}

.achievement-item.unlocked::before {
  opacity: 1;
}

.achievement-item.new {
  background: linear-gradient(to right, var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg-hover, rgba(255, 255, 255, 0.95)));
  border-color: var(--icon-accent, #6b90ff);
  animation: glowing 2s infinite alternate;
}

.achievement-item.secret {
  background: var(--card-bg, rgba(255, 255, 255, 0.8)) url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%235e60ce' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  border-style: dashed;
  border-color: var(--divider-color, rgba(94, 96, 206, 0.2));
}

.achievement-item.secret .achievement-name {
  font-style: italic;
  color: var(--icon-primary, #5e60ce);
}

.achievement-item.secret .achievement-description {
  font-style: italic;
  color: var(--text-color, #777);
}

.achievement-item.secret .achievement-icon {
  background: repeating-linear-gradient(
    45deg,
    var(--divider-color, rgba(94, 96, 206, 0.1)),
    var(--divider-color, rgba(94, 96, 206, 0.1)) 10px,
    var(--divider-color, rgba(94, 96, 206, 0.2)) 10px,
    var(--divider-color, rgba(94, 96, 206, 0.2)) 20px
  );
}

.achievement-item.secret:hover {
  border-style: dashed;
  border-color: var(--icon-accent, #6b90ff);
  box-shadow: 0 5px 15px var(--card-shadow, rgba(0, 0, 0, 0.08));
}

.achievement-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50%;
  background: var(--divider-color, rgba(94, 96, 206, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--text-color, #666);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.unlocked .achievement-icon {
  background: var(--primary-gradient, linear-gradient(135deg, #6b90ff, #5e60ce));
  color: white;
  transform: scale(1.05);
}

.unlocked .achievement-icon i {
  animation: achievementUnlock 0.6s ease forwards;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 16px;
  margin: 0 0 5px;
  font-weight: 600;
  color: var(--text-color, #333);
  transition: color 0.3s ease;
}

.unlocked .achievement-name {
  color: var(--icon-primary, #5e60ce);
}

.achievement-description {
  font-size: 13px;
  color: var(--text-color, #666);
  margin: 0;
}

.achievement-date {
  font-size: 11px;
  color: var(--icon-accent, #6b90ff);
  margin: 5px 0 0;
}

.achievement-status {
  margin-left: auto;
}

.achievement-status i {
  font-size: 20px;
}

.unlocked .achievement-status i {
  color: var(--icon-accent, #6b90ff);
}

.achievement-status .fa-lock {
  color: var(--divider-color, rgba(94, 96, 206, 0.3));
}

/* 面板底部 */
.panel-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--divider-color, rgba(94, 96, 206, 0.1));
}

.secret-hint {
  font-size: 14px;
  color: var(--icon-primary, #5e60ce);
  font-style: italic;
}

/* 成就解锁通知 */
.achievement-notification {
  position: fixed;
  bottom: 80px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--card-bg, white);
  border-radius: 12px;
  padding: 12px 15px;
  box-shadow: 
    0 5px 20px var(--card-shadow, rgba(0, 0, 0, 0.2)),
    0 0 0 2px var(--icon-primary, rgba(94, 96, 206, 0.2));
  max-width: 280px;
  z-index: 9999;
}

/* 通知进入和离开的过渡 */
.notification-enter-active {
  animation: notificationIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
  animation: notificationOut 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}

.notification-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: var(--primary-gradient, linear-gradient(135deg, #6b90ff, #5e60ce));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px;
  font-size: 15px;
  color: var(--icon-primary, #5e60ce);
}

.notification-content p {
  margin: 0;
  font-size: 14px;
  color: var(--text-color, #333);
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 5px rgba(255, 107, 107, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
}

@keyframes glowing {
  from { box-shadow: 0 0 5px var(--card-shadow, rgba(94, 96, 206, 0.3)); }
  to { box-shadow: 0 0 15px var(--icon-accent, rgba(107, 144, 255, 0.6)); }
}

@keyframes achievementUnlock {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes notificationIn {
  0% { transform: translateX(-80px); opacity: 0; }
  60% { transform: translateX(10px); }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes notificationOut {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100px); opacity: 0; }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .achievements-panel {
    width: 95%;
    max-height: 85vh;
  }
  
  .achievement-item {
    padding: 12px;
    gap: 10px;
  }
  
  .achievement-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    font-size: 18px;
  }
  
  .achievement-name {
    font-size: 14px;
  }
  
  .achievement-description {
    font-size: 12px;
  }
}
</style>