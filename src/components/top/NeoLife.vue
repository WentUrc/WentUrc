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
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'InspireWidget',
    data() {
      return {
        isHovered: false,
        currentQuote: { text: '', author: '' },
        quotes: [
          { text: "相信自己，你比想象中更强大。", author: "佚名" },
          { text: "每一次失败，都是成功的开始。", author: "托马斯·爱迪生" },
          { text: "伟大的事业不是靠力气、速度和身体的敏捷完成的，而是靠性格、意志和知识的力量。", author: "塞缪尔·约翰逊" },
          { text: "人生就像骑自行车，为了保持平衡，你必须保持前进。", author: "阿尔伯特·爱因斯坦" },
          { text: "成功不是终点，失败也不是终结，只有勇气才是永恒。", author: "温斯顿·丘吉尔" },
          { text: "人的一生可能燃烧也可能腐朽，我不能腐朽，我愿意燃烧起来。", author: "奥斯特洛夫斯基" },
          { text: "世界上那些最容易的事情中，拖延时间最不费力。", author: "维斯塔" },
          { text: "意志坚强的人能把世界放在手中像泥块一样任意揉捏。", author: "歌德" },
          { text: "生活就是一场即兴表演，没有彩排。", author: "亨利·卡森" },
          { text: "我们必须接受失望，因为它是有限的，但千万不可失去希望，因为它是无穷的。", author: "马丁·路德·金" },
          { text: "如果你想要看到彩虹，那么你必须忍受雨水。", author: "多丽·帕顿" },
          { text: "不管发生什么，都不要失去希望。希望是所有事物中最重要的东西。", author: "亚里士多德" },
          { text: "把你的脸迎向阳光，那么你就看不到阴影。", author: "海伦·凯勒" },
          { text: "不要等待机会，而要创造机会。", author: "林肯" },
          { text: "要成功，就要坚持不懈地努力。", author: "乔布斯" }
        ],
        favorites: [],
        showFavorites: false,
        showCopyToast: false,
        isCurrentFavorite: false,
      }
    },
    mounted() {
      // 设置初始名言
      this.setRandomQuote();
      
      // 加载收藏的名言
      this.loadFavorites();
    },
    methods: {
      setRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        this.currentQuote = this.quotes[randomIndex];
        this.checkIfFavorite();
      },
      
      refreshQuote() {
        this.setRandomQuote();
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
        });
      },
      
      shareQuote() {
        const quote = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;
        
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