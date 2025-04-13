/**
 * Logo游戏彩蛋 - 减少DOM依赖，增加事件代理
 */
import eventBus from '../../../../utils/eventBus.js';

class LogoGame {
  constructor() {
    this.clickCount = 0;
    this.clickTimeout = null;
    this.logoRef = null; 
    this.isGameActive = false;
    this.gameStarted = false;
    
    // 绑定方法
    this.handleLogoClick = this.handleLogoClick.bind(this);
  }
  
  /**
   * 初始化Logo游戏喵～
   * @param {Object} options - 配置对象，包含Vue引用喵～
   */
  initialize(options = {}) {
    const { element, vueComponent } = options;
    
    if (element) {
      this.logoRef = { element };
      console.log('Logo游戏初始化成功喵～使用DOM元素');
    } else if (vueComponent && vueComponent.$refs && vueComponent.$refs.logoImg) {
      this.logoRef = { element: vueComponent.$refs.logoImg };
      console.log('Logo游戏初始化成功喵～使用Vue Options API');
    } else if (vueComponent && vueComponent.value) {
      this.logoRef = { element: vueComponent.value };
      console.log('Logo游戏初始化成功喵～使用Vue Composition API');
    } else {
      console.warn('Logo游戏初始化失败喵～：缺少有效元素引用');
      return false;
    }
    
    console.log('Logo引用已设置喵～:', this.logoRef);
    return true;
  }
  
  /**
   * 处理Logo点击事件
   */
  handleLogoClick(e) {
    e.stopPropagation();
    
    this.clickCount++;
    
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    if (this.clickCount >= 5 && !this.gameStarted) {
      this.startGame();
      return;
    }
    
    this.clickTimeout = setTimeout(() => {
      this.clickCount = 0;
    }, 2000);
  }

  /**
   * 处理点击事件喵～（供外部调用）
   * @param {number} clickCount - 当前点击次数
   * @returns {boolean} - 是否已处理点击
   */
  handleClick(clickCount) {
    if (clickCount >= 5) {
      this.startGame();
      return true;
    }
    
    return false;
  }

  /**
   * 启动Logo游戏
   */
  startGame() {
    if (!this.logoRef || !this.logoRef.element) {
      console.warn('无法启动游戏：Logo元素不可用');
      return;
    }
    
    this.gameStarted = true;
    this.isGameActive = true;
    
    this.logoRef.element.classList.add('game-active');
    
    setTimeout(() => {
      if (this.logoRef && this.logoRef.element) {
        this.logoRef.element.classList.remove('game-active');
      }
      this.isGameActive = false;
      
      eventBus.emit('achievement-unlocked', 'logo-game');
      
      setTimeout(() => {
        this.gameStarted = false;
        this.clickCount = 0;
      }, 5000);
    }, 2000);
  }

  /**
   * 清理资源喵～
   */
  cleanup() {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    this.logoRef = null;
    this.isGameActive = false;
    this.clickCount = 0;
  }
}

// 导出单例
export default new LogoGame();