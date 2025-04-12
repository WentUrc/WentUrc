<template>
  <div class="inspire-widget" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="inspire-card" :class="{ 'hovered': isHovered }">
      <!-- 标题栏 -->
      <div class="header-row">
        <div class="card-title">每日灵感</div>
        <div class="inspire-icon">
          <i class="fas fa-lightbulb"></i>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="quote-container">
        <div class="quote-decorator left">
          <i class="fas fa-quote-left"></i>
        </div>
        
        <div class="quote-content">
          <p class="quote-text">{{ currentQuote.text }}</p>
          <p class="quote-author">— {{ currentQuote.author }}</p>
        </div>
        
        <div class="quote-decorator right">
          <i class="fas fa-quote-right"></i>
        </div>
      </div>
      
      <!-- 交互区域 -->
      <div class="quote-actions">
        <button class="action-btn refresh-btn" @click="refreshQuote" title="换一条">
          <i class="fas fa-sync-alt"></i>
        </button>
        
        <button class="action-btn like-btn" @click="toggleFavorite" :class="{ 'active': isCurrentFavorite }">
          <i class="fas fa-heart"></i>
        </button>
        
        <button class="action-btn copy-btn" @click="copyQuote" title="复制">
          <i class="fas fa-copy"></i>
        </button>
        
        <button class="action-btn share-btn" @click="shareQuote" title="分享">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
      
      <!-- 喜欢收藏区域 -->
      <div class="favorites-section" v-if="showFavorites">
        <div class="favorites-header">
          <h4>我的收藏</h4>
          <button class="close-favorites" @click="showFavorites = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="favorites-list" v-if="favorites.length > 0">
          <div class="favorite-item" v-for="(fav, index) in favorites" :key="index">
            <p class="fav-text">{{ fav.text }}</p>
            <div class="fav-actions">
              <button @click="setQuote(fav)" title="查看">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="removeFavorite(index)" title="删除">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="no-favorites" v-else>
          <i class="far fa-heart"></i>
          <p>暂无收藏的灵感</p>
        </div>
      </div>
      
      <div class="view-favorites" v-if="!showFavorites && favorites.length > 0">
        <button class="view-favorites-btn" @click="showFavorites = true">
          查看我收藏的 {{ favorites.length }} 条灵感
        </button>
      </div>
      
      <!-- 复制成功提示 -->
      <div class="copy-toast" v-if="showCopyToast">
        已复制到剪贴板！
      </div>
      
      <!-- 成就提示 -->
      <div class="achievement-hint" v-if="showAchievementHint">
        <i class="fas fa-trophy hint-icon"></i>
        <span>继续探索更多灵感可以解锁成就喔～</span>
      </div>
    </div>
  </div>
</template>

<script>
import eventBus from '../../utils/eventBus.js'
import quotesData from '../../assets/data/quotes.json'

export default {
  name: 'InspireWidget',
  data() {
    return {
      isHovered: false,
      currentQuote: { text: '', author: '' },
      // 从导入的JSON文件获取名言数据
      quotes: quotesData,
      favorites: [],
      showFavorites: false,
      showCopyToast: false,
      isCurrentFavorite: false,
      // 成就系统相关数据
      showAchievementHint: false,
      quoteStats: {
        refreshCount: 0,
        favoriteCount: 0,
        copyCount: 0,
        shareCount: 0,
        viewedCount: 0
      },
      achievementsUnlocked: {
        quoteFavorite: false,
        quoteCollector: false,
        quoteMaster: false,
        quoteExplorer: false
      }
    }
  },
  mounted() {
    // 设置初始名言
    this.setRandomQuote();
    
    // 加载收藏的名言
    this.loadFavorites();
    
    // 加载统计数据
    this.loadStats();
    
    // 显示成就提示（如果未解锁任何成就）
    this.$nextTick(() => {
      this.checkShowAchievementHint();
    });
  },
  methods: {
    setRandomQuote() {
      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      this.currentQuote = this.quotes[randomIndex];
      this.checkIfFavorite();
      
      // 增加查看计数
      this.quoteStats.viewedCount++;
      this.updateStats();
      
      // 检查成就
      this.checkAchievements();
    },
    
    refreshQuote() {
      // 增加刷新计数
      this.quoteStats.refreshCount++;
      this.setRandomQuote();
      this.updateStats();
      
      // 检查"智慧探索者"成就 - 刷新10次
      if (this.quoteStats.refreshCount >= 10 && !this.achievementsUnlocked.quoteExplorer) {
        this.achievementsUnlocked.quoteExplorer = true;
        this.unlockAchievement('quote-explorer');
      }
    },
    
    toggleFavorite() {
      // 检查当前名言是否已在收藏中
      const index = this.favorites.findIndex(fav => 
        fav.text === this.currentQuote.text && fav.author === this.currentQuote.author
      );
      
      if (index === -1) {
        // 添加到收藏
        this.favorites.push({ ...this.currentQuote });
        this.isCurrentFavorite = true;
        
        // 增加收藏计数
        this.quoteStats.favoriteCount++;
        this.updateStats();
        
        // 触发成就解锁
        if (!this.achievementsUnlocked.quoteFavorite) {
          this.achievementsUnlocked.quoteFavorite = true;
          this.unlockAchievement('quote-favorited');
        }
        
        // 检查"名言收藏家"成就 - 收藏5条名言
        if (this.favorites.length >= 5 && !this.achievementsUnlocked.quoteCollector) {
          this.achievementsUnlocked.quoteCollector = true;
          this.unlockAchievement('quote-collector');
        }
      } else {
        // 从收藏中移除
        this.favorites.splice(index, 1);
        this.isCurrentFavorite = false;
      }
      
      // 保存收藏
      this.saveFavorites();
    },
    
    copyQuote() {
      const textToCopy = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        // 显示复制成功提示
        this.showCopyToast = true;
        setTimeout(() => {
          this.showCopyToast = false;
        }, 2000);
        
        // 增加复制计数
        this.quoteStats.copyCount++;
        this.updateStats();
        
        // 检查"传播智慧"成就 - 复制3次名言
        if (this.quoteStats.copyCount >= 3 && !this.achievementsUnlocked.quoteMaster) {
          this.achievementsUnlocked.quoteMaster = true;
          this.unlockAchievement('quote-sharer');
        }
      });
    },
    
    shareQuote() {
      const quote = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;
      
      // 增加分享计数
      this.quoteStats.shareCount++;
      this.updateStats();
      
      // 如果支持网页分享API
      if (navigator.share) {
        navigator.share({
          title: '每日灵感',
          text: quote,
        })
        .catch(error => console.log('分享失败', error));
      } else {
        // 后备方案：复制到剪贴板
        this.copyQuote();
      }
      
      // 检查"分享智慧"成就 - 分享任意名言
      if (!this.achievementsUnlocked.quoteSharing) {
        this.achievementsUnlocked.quoteSharing = true;
        this.unlockAchievement('quote-sharer');
      }
    },
    
    setQuote(quote) {
      this.currentQuote = quote;
      this.showFavorites = false;
      this.isCurrentFavorite = true;
    },
    
    removeFavorite(index) {
      this.favorites.splice(index, 1);
      this.saveFavorites();
      this.checkIfFavorite();
    },
    
    saveFavorites() {
      localStorage.setItem('inspire-favorites', JSON.stringify(this.favorites));
    },
    
    loadFavorites() {
      const saved = localStorage.getItem('inspire-favorites');
      if (saved) {
        try {
          this.favorites = JSON.parse(saved);
          this.checkIfFavorite();
          
          // 检查"名言收藏家"成就
          if (this.favorites.length >= 5 && !this.achievementsUnlocked.quoteCollector) {
            this.achievementsUnlocked.quoteCollector = true;
            this.unlockAchievement('quote-collector');
          }
        } catch (e) {
          console.error('加载收藏失败', e);
          this.favorites = [];
        }
      }
    },
    
    checkIfFavorite() {
      this.isCurrentFavorite = this.favorites.some(fav => 
        fav.text === this.currentQuote.text && fav.author === this.currentQuote.author
      );
    },
    
    // 成就系统相关方法
    unlockAchievement(achievementId) {
      // 通过事件总线触发成就解锁事件
      eventBus.emit('achievement-unlocked', achievementId);
      
      // 隐藏成就提示
      this.showAchievementHint = false;
      
      // 保存解锁状态
      this.saveAchievementStatus();
    },
    
    loadStats() {
      const saved = localStorage.getItem('inspire-stats');
      if (saved) {
        try {
          this.quoteStats = JSON.parse(saved);
        } catch (e) {
          console.error('加载数据统计失败', e);
          this.quoteStats = {
            refreshCount: 0,
            favoriteCount: 0,
            copyCount: 0,
            shareCount: 0,
            viewedCount: 0
          };
        }
      }
      
      // 加载成就状态
      const achievements = localStorage.getItem('inspire-achievements');
      if (achievements) {
        try {
          this.achievementsUnlocked = JSON.parse(achievements);
        } catch (e) {
          console.error('加载成就状态失败', e);
        }
      }
    },
    
    updateStats() {
      // 保存统计数据
      localStorage.setItem('inspire-stats', JSON.stringify(this.quoteStats));
      
      // 检查成就
      this.checkAchievements();
    },
    
    saveAchievementStatus() {
      localStorage.setItem('inspire-achievements', JSON.stringify(this.achievementsUnlocked));
    },
    
    checkAchievements() {
      // 检查是否有未解锁的成就
      const hasUnlockedAll = Object.values(this.achievementsUnlocked).every(v => v === true);
      
      // 如果还有未解锁的成就，且查看次数达到一定值，显示提示
      if (!hasUnlockedAll && this.quoteStats.viewedCount >= 3) {
        this.showAchievementHint = true;
      }
    },
    
    checkShowAchievementHint() {
      // 检查成就系统中是否已解锁相关成就
      const achievementsData = localStorage.getItem('wenturc-achievements');
      if (achievementsData) {
        try {
          const achievements = JSON.parse(achievementsData);
          
          // 如果已经解锁了所有与每日灵感相关的成就，不显示提示
          const hasUnlockedAll = 
            (achievements['quote-favorited'] && achievements['quote-favorited'].unlocked) &&
            (achievements['quote-collector'] && achievements['quote-collector'].unlocked) &&
            (achievements['quote-sharer'] && achievements['quote-sharer'].unlocked) &&
            (achievements['quote-explorer'] && achievements['quote-explorer'].unlocked);
          
          this.showAchievementHint = !hasUnlockedAll;
        } catch (e) {
          console.error('解析成就数据失败', e);
        }
      } else {
        // 没有成就数据，显示提示
        this.showAchievementHint = true;
      }
    }
  }
};
</script>

<style scoped>
.inspire-widget {
  margin-bottom: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.inspire-card {
  position: relative;
  width: 100%;
  padding: 18px;
  box-sizing: border-box;
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg, rgba(255, 255, 255, 0.8))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  border: 4px solid transparent;
  border-radius: 16px;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
}

.inspire-card.hovered {
  transform: translateX(0) scale(1.02);
  background:
    linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.95)), var(--card-bg-hover, rgba(255, 255, 255, 0.95))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(91, 81, 200, 0.25));
}

/* 标题栏 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--icon-primary, #5e60ce);
}

.inspire-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.inspire-icon i {
  color: white;
  font-size: 16px;
  transition: all 0.5s ease;
}

/* 引用区域 */
.quote-container {
  position: relative;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border-radius: 12px;
  padding: 25px 15px;
  margin-bottom: 20px;
  box-shadow: 0 3px 10px var(--card-shadow, rgba(91, 81, 200, 0.1));
  display: flex;
  align-items: center;
  min-height: 100px;
}

.quote-decorator {
  font-size: 24px;
  color: var(--icon-primary, #5e60ce);
  opacity: 0.5;
  position: absolute;
}

.quote-decorator.left {
  top: 10px;
  left: 10px;
}

.quote-decorator.right {
  bottom: 10px;
  right: 10px;
}

.quote-content {
  width: 100%;
  text-align: center;
  padding: 0 20px;
}

.quote-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color, #333);
  margin: 0 0 10px 0;
  font-style: italic;
}

.quote-author {
  font-size: 14px;
  color: var(--icon-primary, #5e60ce);
  margin: 0;
  font-weight: 500;
}

/* 操作按钮区 */
.quote-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--card-bg, rgba(255, 255, 255, 0.8));
  box-shadow: 
    0 2px 5px var(--card-shadow, rgba(91, 81, 200, 0.15)),
    0 0 0 2px var(--divider-color, rgba(94, 96, 206, 0.15));
}

.action-btn i {
  font-size: 16px;
  color: var(--icon-primary, #5e60ce);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 5px 12px var(--card-shadow, rgba(91, 81, 200, 0.25)),
    0 0 0 2px var(--button-border, rgba(94, 96, 206, 0.3));
}

.action-btn:hover i {
  color: var(--icon-accent, #6b90ff);
  transform: scale(1.2);
}

.like-btn.active {
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
}

.like-btn.active i {
  color: white;
}

/* 收藏区域 */
.favorites-section {
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  border-radius: 10px;
  padding: 12px;
  margin-top: 5px;
  box-shadow: 0 2px 8px var(--card-shadow, rgba(91, 81, 200, 0.1)) inset;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.favorites-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--icon-primary, #5e60ce);
}

.close-favorites {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.close-favorites i {
  font-size: 14px;
  color: var(--text-color, #333);
  opacity: 0.6;
}

.close-favorites:hover i {
  opacity: 1;
}

.favorites-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
}

.favorites-list::-webkit-scrollbar {
  width: 4px;
}

.favorites-list::-webkit-scrollbar-track {
  background: transparent;
}

.favorites-list::-webkit-scrollbar-thumb {
  background: var(--button-border, rgba(94, 96, 206, 0.3));
  border-radius: 2px;
}

.favorite-item {
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fav-text {
  font-size: 12px;
  margin: 0;
  color: var(--text-color, #333);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fav-actions {
  display: flex;
  gap: 5px;
}

.fav-actions button {
  background: transparent;
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.fav-actions button:hover {
  background: var(--button-active, rgba(94, 96, 206, 0.1));
}

.fav-actions button i {
  font-size: 12px;
  color: var(--icon-primary, #5e60ce);
}

.no-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  color: var(--text-color, #333);
  opacity: 0.5;
}

.no-favorites i {
  font-size: 25px;
  margin-bottom: 10px;
}

.no-favorites p {
  font-size: 13px;
  margin: 0;
}

.view-favorites {
  text-align: center;
  margin-top: 10px;
}

.view-favorites-btn {
  background: transparent;
  border: none;
  font-size: 13px;
  color: var(--icon-primary, #5e60ce);
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.view-favorites-btn:hover {
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
}

/* 复制成功提示 */
.copy-toast {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 12px;
  animation: fadeInOut 2s forwards;
  box-shadow: 0 3px 15px var(--card-shadow, rgba(91, 81, 200, 0.3));
}

/* 成就提示样式 */
.achievement-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
  border-radius: 8px;
  font-size: 13px;
  color: var(--icon-primary, #5e60ce);
  border: 1px dashed var(--button-border, rgba(94, 96, 206, 0.3));
  margin-top: 10px;
  animation: pulse-hint 2s infinite alternate;
}

.hint-icon {
  color: gold;
  animation: rotate-icon 3s infinite ease;
}

@keyframes pulse-hint {
  from { opacity: 0.8; transform: scale(0.99); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes rotate-icon {
  0% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
  100% { transform: rotate(-15deg); }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 10px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -10px); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .quote-text {
    font-size: 14px;
  }
  
  .quote-author {
    font-size: 12px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
  
  .action-btn i {
    font-size: 14px;
  }
}
</style>