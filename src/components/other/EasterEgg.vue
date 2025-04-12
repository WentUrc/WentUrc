<template>
  <!-- 这个组件默认不显示任何内容，只在触发彩蛋时显示 -->
  <div class="easter-egg-container" v-if="showEasterEgg">
    <!-- 彩蛋内容区域 -->
    <div class="easter-egg-content" :class="activeEasterEgg" v-if="activeEasterEgg !== 'konami-code'">
      <!-- Logo点击彩蛋 -->
      <div v-if="activeEasterEgg === 'logo-game'" class="mini-game">
        <h3>喵喵小游戏～</h3>
        <div class="game-content" v-if="!gameEnded">
          <div class="game-score">得分: {{ gameScore }}</div>
          <div class="game-character" @click="incrementScore">🐱</div>
          <div class="game-instructions">
            快速点击小猫咪获得分数喵～<br>
            在10秒内看看能得多少分～
          </div>
          <div class="game-timer">剩余时间: {{ gameTime }}秒</div>
        </div>
        
        <!-- 游戏结束状态 -->
        <div class="game-results" v-else>
          <div class="result-icon">🏆</div>
          <h4 class="result-title">游戏结束喵～</h4>
          <div class="result-score">你的得分: <span>{{ gameScore }}</span></div>
          
          <div class="high-score-info" v-if="isNewHighScore">
            <div class="new-record-badge">新纪录!</div>
            <div class="confetti">🎉</div>
          </div>
          <div class="high-score-display" v-else>
            历史最高分: <span>{{ highScore }}</span>
          </div>
          
          <button class="restart-button" @click="startGame">
            <i class="fas fa-redo"></i> 再玩一次
          </button>
        </div>
      </div>
      
      <!-- 关闭按钮 -->
      <button class="close-button" @click="hideEasterEgg">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- 引入独立的Konami密码组件 -->
    <konami-code 
      v-if="activeEasterEgg === 'konami-code'" 
      :active="true"
      :isUnlocked="isAchievementUnlocked('konami-code')"
      @close="hideEasterEgg"
    />
  </div>
</template>

<script>
import eventBus from '../../utils/eventBus.js'
import KonamiCode from './easter-eggs/KonamiCode.vue'

export default {
  name: 'EasterEgg',
  components: {
    KonamiCode
  },
  data() {
    return {
      showEasterEgg: false,
      activeEasterEgg: null,
      gameScore: 0,
      gameTime: 10,
      gameTimer: null,
      gameEnded: false,
      highScore: 0,
      isNewHighScore: false,
      clickSequences: {
        'logo': {
          element: '.logo-link',
          maxClicks: 5,  
          currentClicks: 0,
          timeout: 2000,
          timer: null,
          easterEgg: 'logo-game'
        }
      },
      keySequences: {
        'konami': {
          sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
          current: 0,
          easterEgg: 'konami-code'
        }
      },
      scrollPosition: 0
    }
  },
  mounted() {
    this.initClickListeners();
    this.initKeyListeners();
    this.loadHighScore();
  },
  beforeDestroy() {
    this.removeClickListeners();
    this.removeKeyListeners();
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    this.enableScroll();
  },
  methods: {
    // 检查成就是否已解锁的方法
    isAchievementUnlocked(achievementId) {
      try {
        const achievements = JSON.parse(localStorage.getItem('wenturc-achievements') || '{}');
        return achievements[achievementId] && achievements[achievementId].unlocked;
      } catch (e) {
        console.error('读取成就状态失败', e);
        return false;
      }
    },
    
    // 禁用页面滚动功能
    disableScroll() {
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
      
      document.body.classList.add('easter-egg-active');
    },
    
    // 恢复页面滚动功能
    enableScroll() {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
  
      window.scrollTo(0, this.scrollPosition);
      document.body.classList.remove('easter-egg-active');
    },
    
    initClickListeners() {
      Object.keys(this.clickSequences).forEach(key => {
        const sequence = this.clickSequences[key];
        setTimeout(() => {
          const element = document.querySelector(sequence.element);
          if (element) {
            const boundHandler = this.handleElementClick.bind(this, key);
            element.addEventListener('click', boundHandler);
            sequence.handler = boundHandler;
          }
        }, 1000);
      });
    },
    
    removeClickListeners() {
      Object.keys(this.clickSequences).forEach(key => {
        const sequence = this.clickSequences[key];
        
        if (sequence.handler) {
          const element = document.querySelector(sequence.element);
          if (element) {
            element.removeEventListener('click', sequence.handler);
          }
        }
        
        if (sequence.timer) {
          clearTimeout(sequence.timer);
        }
      });
    },
    
    initKeyListeners() {
      document.addEventListener('keydown', this.handleKeyPress);
    },
    
    removeKeyListeners() {
      document.removeEventListener('keydown', this.handleKeyPress);
    },
    
    handleElementClick(sequenceKey) {
      const sequence = this.clickSequences[sequenceKey];
      if (sequence.timer) {
        clearTimeout(sequence.timer);
      }
      sequence.currentClicks++;
      sequence.timer = setTimeout(() => {
        sequence.currentClicks = 0;
      }, sequence.timeout);
      if (sequence.currentClicks >= sequence.maxClicks) {
        this.triggerEasterEgg(sequence.easterEgg);
        sequence.currentClicks = 0;
      }
    },
    
    handleKeyPress(event) {
      Object.keys(this.keySequences).forEach(key => {
        const sequence = this.keySequences[key];
        const expectedKey = sequence.sequence[sequence.current];
        
        if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
          sequence.current++;
          if (sequence.current >= sequence.sequence.length) {
            this.triggerEasterEgg(sequence.easterEgg);
            sequence.current = 0;
          }
        } else {
          sequence.current = 0;
        }
      });
    },
    
    triggerEasterEgg(easterEggKey) {
      this.showEasterEgg = true;
      this.activeEasterEgg = easterEggKey;
      this.disableScroll();
      
      // 初始化游戏状态（如果是游戏彩蛋）
      if (easterEggKey === 'logo-game') {
        this.loadHighScore(); 
        this.startGame();
      }
      if (!this.isAchievementUnlocked(easterEggKey)) {
        this.unlockAchievement(easterEggKey);
      }
    },
    
    hideEasterEgg() {
      this.showEasterEgg = false;
      this.activeEasterEgg = null;
      this.gameEnded = false;
      this.enableScroll();
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
        this.gameTimer = null;
      }
    },
    
    startGame() {
      this.gameScore = 0;
      this.gameTime = 10;
      this.gameEnded = false;
      this.isNewHighScore = false;
      this.gameTimer = setInterval(() => {
        this.gameTime--;
        if (this.gameTime <= 0) {
          clearInterval(this.gameTimer);
          this.gameTimer = null;
          this.endGame();
        }
      }, 1000);
    },
    
    endGame() {
      this.gameEnded = true;
      this.saveHighScore();
    },
    
    incrementScore() {
      if (this.gameTimer && !this.gameEnded) {
        this.gameScore++;
      }
    },
    
    loadHighScore() {
      const savedScores = localStorage.getItem('wenturc-game-scores') || '{}';
      try {
        const scores = JSON.parse(savedScores);
        this.highScore = scores['logo-game'] || 0;
      } catch (e) {
        console.error('解析游戏分数失败');
        this.highScore = 0;
      }
    },
    
    saveHighScore() {
      const savedScores = localStorage.getItem('wenturc-game-scores') || '{}';
      let scores = {};
      
      try {
        scores = JSON.parse(savedScores);
      } catch (e) {
        console.error('解析游戏分数失败');
      }
      
      // 检查成就解锁条件 - 移到外部，无论是否为新高分
      if (this.gameScore >= 20) {
        this.unlockAchievement('game-master');
      }
      
      if (!scores['logo-game'] || this.gameScore > scores['logo-game']) {
        scores['logo-game'] = this.gameScore;
        localStorage.setItem('wenturc-game-scores', JSON.stringify(scores));
        this.highScore = this.gameScore;
        this.isNewHighScore = true;
      }
    },
    
    unlockAchievement(key) {
      // 从localStorage获取已有成就
      const saved = localStorage.getItem('wenturc-achievements') || '{}';
      let achievements = {};
      
      try {
        achievements = JSON.parse(saved);
      } catch (e) {
        console.error('解析已有成就失败');
      }
      
      // 添加新成就（如果尚未解锁）
      if (!achievements[key]) {
        achievements[key] = {
          unlocked: true,
          timestamp: new Date().toISOString(),
          isNew: true
        };
        
        localStorage.setItem('wenturc-achievements', JSON.stringify(achievements));
        eventBus.emit('achievement-unlocked', key);
      }
    }
  }
}
</script>

<style scoped>
.easter-egg-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.easter-egg-content {
  background: var(--card-bg, rgba(255, 255, 255, 0.95));
  border-radius: 20px;
  padding: 25px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
  position: relative;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 4px solid transparent;
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.95)), var(--card-bg, rgba(255, 255, 255, 0.95))) padding-box,
    linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc)) border-box;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
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

/* 小游戏样式 */
.mini-game {
  text-align: center;
  padding: 20px;
}

.mini-game h3 {
  margin-bottom: 25px;
  font-size: 24px;
  color: var(--icon-primary, #5e60ce);
  background: var(--primary-gradient, linear-gradient(45deg, #6b90ff, #5e60ce));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.game-score {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-color, #333);
}

.game-character {
  font-size: 60px;
  cursor: pointer;
  transition: transform 0.1s ease;
  user-select: none;
  animation: bounce 1s infinite alternate;
}

.game-character:hover {
  transform: scale(1.2);
}

.game-character:active {
  transform: scale(0.9);
}

.game-instructions {
  font-size: 14px;
  color: var(--text-color, #666);
  margin: 15px 0;
  line-height: 1.5;
}

.game-timer {
  font-size: 18px;
  font-weight: bold;
  color: var(--icon-accent, #6b90ff);
}

/* 游戏结果样式 */
.game-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  animation: fadeIn 0.5s ease;
  padding: 15px 0;
}

.result-icon {
  font-size: 50px;
  margin-bottom: 10px;
  animation: bounce 1.5s infinite alternate;
}

.result-title {
  font-size: 22px;
  color: var(--icon-primary, #5e60ce);
  margin: 0;
}

.result-score {
  font-size: 24px;
  font-weight: 500;
  color: var(--text-color, #333);
  margin: 10px 0;
}

.result-score span {
  font-size: 30px;
  font-weight: bold;
  color: var(--icon-primary, #5e60ce);
}

.high-score-info {
  position: relative;
  margin: 15px 0;
}

.new-record-badge {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 16px;
  animation: pulse 1s infinite alternate;
  box-shadow: 0 3px 10px rgba(255, 193, 7, 0.3);
}

.confetti {
  position: absolute;
  font-size: 24px;
  top: -15px;
  right: -20px;
  animation: spin 2s infinite linear;
}

.high-score-display {
  font-size: 16px;
  color: var(--text-color, #666);
  margin: 10px 0;
}

.high-score-display span {
  font-weight: bold;
  color: var(--icon-accent, #6b90ff);
}

.restart-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  border: none;
  border-radius: 30px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(107, 144, 255, 0.3);
}

.restart-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(107, 144, 255, 0.4);
}

.restart-button:active {
  transform: translateY(-1px);
}

.restart-button i {
  margin-right: 6px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>