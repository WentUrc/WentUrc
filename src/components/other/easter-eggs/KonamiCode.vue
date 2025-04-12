<template>
  <div class="konami-container" v-if="active">
    <div class="secret-message konami-style">
      <div class="konami-header">
        <div class="konami-badge">KONAMI</div>
        <h3 v-if="!isUnlocked">老玩家成就解锁喵～</h3>
        <h3 v-else>欢迎回来，游戏达人喵～</h3>
      </div>
      
      <div class="konami-animation">
        <div class="key-sequence">
          <div class="key" v-for="(key, index) in konamiSequence" :key="index" :style="`--i: ${index}`">
            {{ key }}
          </div>
        </div>
        <div class="konami-character">👾</div>
      </div>
      
      <div class="konami-info">
        <p><span class="highlight">Konami密码</span>是电子游戏史上最著名的秘籍，</p>
        <p>首次出现在1986年的《魂斗罗》游戏中喵～</p>
        <p class="easter-egg-hint">在很多游戏中输入这个密码都能获得特殊能力喵！</p>
      </div>
      
      <button class="konami-button" @click="close">
        {{ isUnlocked ? '我知道了喵～' : '继续探索喵～' }}
      </button>
      
      <!-- 关闭按钮 -->
      <button class="close-button" @click="close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KonamiCode',
  props: {
    active: {
      type: Boolean,
      required: true
    },
    isUnlocked: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      konamiSequence: ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A']
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
}
</script>
  
  <style scoped>
  .konami-container {
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
  
  /* 改进的Konami密码彩蛋样式 */
  .konami-style {
    position: relative;
    text-align: center;
    padding: 30px;
    background: linear-gradient(to bottom, #1f1f3f, #2d2b5f);
    color: white;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    width: 90%;
    max-width: 500px;
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .konami-style::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.1) 10px,
      rgba(0, 0, 0, 0.2) 10px,
      rgba(0, 0, 0, 0.2) 20px
    );
    z-index: 0;
  }
  
  .konami-style * {
    position: relative;
    z-index: 1;
  }
  
  .konami-header {
    margin-bottom: 25px;
    position: relative;
  }
  
  .konami-badge {
    font-family: 'Press Start 2P', monospace, sans-serif;
    background: #ff0066;
    color: white;
    display: inline-block;
    padding: 5px 15px;
    border-radius: 4px;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 15px;
    transform: rotate(-2deg);
    box-shadow: 3px 3px 0 rgba(0,0,0,0.2);
  }
  
  .konami-style h3 {
    font-size: 26px;
    background: linear-gradient(45deg, #ffcc00, #ff6600);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 10px 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }
  
  .konami-animation {
    margin: 30px auto;
    position: relative;
  }
  
  .key-sequence {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }
  
  .key {
    width: 35px;
    height: 35px;
    background: rgba(255, 255, 255, 0.9);
    color: #1f1f3f;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    box-shadow: 0 3px 0 #999, 0 5px 10px rgba(0,0,0,0.2);
    animation: keyPress 0.5s ease infinite alternate;
    animation-delay: calc(var(--i, 0) * 0.1s);
  }
  
  .konami-character {
    font-size: 65px;
    animation: floatCharacter 2s ease infinite;
    margin: 20px 0;
    filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.6));
  }
  
  .konami-info {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 15px;
    margin: 15px 0;
  }
  
  .konami-info p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.5;
    color: #e0e0ff;
  }
  
  .highlight {
    color: #ffcc00;
    font-weight: bold;
  }
  
  .easter-egg-hint {
    font-style: italic;
    color: #aaeeee;
    font-size: 13px;
  }
  
  .konami-button {
    background: linear-gradient(45deg, #ff6600, #ff9900);
    border: none;
    color: white;
    padding: 12px 25px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: bold;
    margin-top: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 0 #cc5500, 0 5px 10px rgba(0,0,0,0.2);
  }
  
  .konami-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 0 #cc5500, 0 8px 15px rgba(0,0,0,0.3);
  }
  
  .konami-button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #cc5500;
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
    color: white;
    transition: all 0.3s ease;
  }
  
  .close-button:hover {
    transform: scale(1.2) rotate(90deg);
    color: #ff9900;
  }
  
  /* 动画定义 */
  @keyframes keyPress {
    from { transform: translateY(0); }
    to { transform: translateY(-3px); box-shadow: 0 6px 0 #999, 0 8px 15px rgba(0,0,0,0.1); }
  }
  
  @keyframes floatCharacter {
    0%, 100% { transform: translateY(0) rotate(5deg); }
    50% { transform: translateY(-10px) rotate(-5deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  /* 响应式适配 */
  @media (max-width: 480px) {
    .konami-style {
      padding: 20px 15px;
    }
    
    .konami-style h3 {
      font-size: 22px;
    }
    
    .key {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
    
    .konami-character {
      font-size: 50px;
    }
    
    .konami-info p {
      font-size: 13px;
    }
  }
  </style>