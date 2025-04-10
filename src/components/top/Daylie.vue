<template>
  <div class="daylie-widget" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="daylie-card" :class="{ 'hovered': isHovered }">
      <!-- 标题栏 -->
      <div class="header-row">
        <div class="card-title">今日喵语✨</div>
        <div class="daylie-icon">
          <i class="fas fa-feather-alt"></i>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="daylie-content">
        <div class="quote-container">
          <div class="quote-text">{{ currentQuote.text }}</div>
          <div class="quote-source">{{ currentQuote.source }}</div>
        </div>
        
        <!-- 分隔线 -->
        <div class="divider"></div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="action-btn refresh-btn" @click="refreshQuote" :class="{ 'refreshing': isRefreshing }">
            <i class="fas fa-sync-alt"></i> 
            <span>换一句</span>
          </button>
          <button class="action-btn favorite-btn" @click="toggleFavorite">
            <i :class="isFavorited ? 'fas fa-heart' : 'far fa-heart'"></i> 
            <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DaylieWidget',
  data() {
    return {
      isHovered: false,
      isRefreshing: false,
      isFavorited: false,
      currentQuote: {
        text: '所谓的奇迹，要通过不懈的努力才能创造出来的啊',
        source: '《魔法少女小圆》',
        id: '1'
      },
      favorites: [],
      quotes: [
        {
          text: '所谓的奇迹，要通过不懈的努力才能创造出来的啊',
          source: '《魔法少女小圆》',
          id: '1'
        },
        {
          text: '不要因为走得太远，而忘记了为什么出发',
          source: '《千与千寻》',
          id: '2'
        },
        {
          text: '爱，其实很简单，困难的是接受它',
          source: '《海上钢琴师》',
          id: '3'
        },
        {
          text: '我们终将改变潮水的方向，我们终将成为我们想成为的人',
          source: '《三体》',
          id: '4'
        },
        {
          text: '希望是个好东西，也许是最好的，好东西是不会消亡的',
          source: '《肖申克的救赎》',
          id: '5'
        },
        {
          text: '人生就像一盒巧克力，你永远不知道下一颗是什么味道',
          source: '《阿甘正传》',
          id: '6'
        },
        {
          text: '世上只有一种英雄主义，就是认清生活真相后依然热爱生活',
          source: '罗曼·罗兰',
          id: '7'
        },
        {
          text: '你的眼中,明暗交杂一笑生花,遣我如何不向你沉沦',
          source: '台州府志',
          id: '8'
        },
        {
          text: '最是人间留不住，朱颜辞镜花辞树',
          source: '王国维',
          id: '9'
        },
        {
          text: '我见青山多妩媚，料青山见我应如是',
          source: '辛弃疾',
          id: '10'
        }
      ]
    };
  },
  methods: {
    refreshQuote() {
      this.isRefreshing = true;
      
      // 从列表中随机选择一个不同的引言
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * this.quotes.length);
      } while (this.quotes[newIndex].id === this.currentQuote.id && this.quotes.length > 1);
      
      // 模拟网络请求延时
      setTimeout(() => {
        this.currentQuote = this.quotes[newIndex];
        this.isRefreshing = false;
        this.checkIfFavorited();
      }, 600);
    },
    
    toggleFavorite() {
      if (this.isFavorited) {
        // 从收藏中移除
        const index = this.favorites.findIndex(q => q.id === this.currentQuote.id);
        if (index !== -1) {
          this.favorites.splice(index, 1);
        }
      } else {
        // 添加到收藏
        this.favorites.push({ ...this.currentQuote });
      }
      
      // 更新状态和本地存储
      this.isFavorited = !this.isFavorited;
      this.saveFavorites();
    },
    
    checkIfFavorited() {
      this.isFavorited = this.favorites.some(q => q.id === this.currentQuote.id);
    },
    
    saveFavorites() {
      localStorage.setItem('daylie-favorites', JSON.stringify(this.favorites));
    },
    
    loadFavorites() {
      const savedFavorites = localStorage.getItem('daylie-favorites');
      if (savedFavorites) {
        this.favorites = JSON.parse(savedFavorites);
        this.checkIfFavorited();
      }
    },
    
    loadRandomQuote() {
      // 每天显示固定的一句话，或者随机选择
      const today = new Date().toLocaleDateString();
      const savedDate = localStorage.getItem('daylie-date');
      
      if (today === savedDate) {
        // 如果是同一天，加载保存的引言
        const savedQuote = localStorage.getItem('daylie-quote');
        if (savedQuote) {
          this.currentQuote = JSON.parse(savedQuote);
          return;
        }
      }
      
      // 新的一天或没有保存的引言，选择一个随机引言
      const randomIndex = Math.floor(Math.random() * this.quotes.length);
      this.currentQuote = this.quotes[randomIndex];
      
      // 保存今天的日期和引言
      localStorage.setItem('daylie-date', today);
      localStorage.setItem('daylie-quote', JSON.stringify(this.currentQuote));
    }
  },
  mounted() {
    this.loadFavorites();
    this.loadRandomQuote();
  }
}
</script>

<style scoped>
.daylie-widget {
  margin-bottom: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.daylie-card {
  position: relative;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg, rgba(255, 255, 255, 0.8))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
  border: 4px solid transparent;
  border-radius: 16px;
  transition: all 0.4s ease;
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.daylie-card.hovered {
  transform: translateX(0) scale(1.02);
  border: 4px solid transparent;
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

.daylie-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.daylie-icon i {
  color: white;
  font-size: 16px;
}

/* 内容区域 */
.daylie-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.quote-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.quote-text {
  font-size: 18px;
  line-height: 1.5;
  color: var(--text-color, #333);
  margin-bottom: 15px;
  text-align: center;
  font-weight: 500;
}

.quote-source {
  font-size: 14px;
  color: var(--text-color, #666);
  opacity: 0.8;
  text-align: right;
  font-style: italic;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--divider-color, rgba(94, 96, 206, 0.2)), transparent);
  margin: 15px 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px 0;
  border: 1px solid var(--button-border, rgba(94, 96, 206, 0.3));
  border-radius: 8px;
  background: var(--card-bg, white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--icon-primary, #5e60ce);
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 5px;
}

.action-btn:hover {
  background: var(--button-hover, rgba(94, 96, 206, 0.05));
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0);
  background: var(--button-active, rgba(94, 96, 206, 0.1));
}

.refresh-btn.refreshing i {
  animation: spin 1s infinite linear;
}

/* 收藏按钮特殊样式处理 */
.favorite-btn.favorited {
  color: #ff6b6b;
}

.favorite-btn:hover {
  color: #ff6b6b;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .quote-text {
    font-size: 16px;
  }
  
  .action-btn {
    padding: 6px 0;
    font-size: 12px;
  }
}
</style>