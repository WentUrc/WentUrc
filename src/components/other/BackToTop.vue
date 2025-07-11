<template>
  <transition name="back-to-top-fade">
    <div 
      v-if="showBackToTop" 
      class="back-to-top-btn" 
      @click="scrollToTop"
      :title="'返回顶部'"
    >
      <i class="fas fa-chevron-up"></i>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  data() {
    return {
      showBackToTop: false,
      scrollThreshold: 300, // 滚动300px后显示按钮
      navbarHeight: 0 // 导航栏高度
    };
  },
  methods: {
    handleScroll() {
      // 获取当前滚动位置
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.showBackToTop = scrollTop > this.scrollThreshold;
    },
    
    scrollToTop() {
      // 平滑滚动到顶部，考虑导航栏高度
      const targetPosition = this.navbarHeight;
      
      // 使用现代浏览器的scrollTo API
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        // 兼容旧浏览器的平滑滚动
        this.smoothScrollTo(targetPosition);
      }
    },
    
    smoothScrollTo(target) {
      const start = window.pageYOffset;
      const distance = target - start;
      const duration = 600; // 滚动持续时间（毫秒）
      let startTime = null;
      
      const animationFrame = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // 使用缓动函数
        const ease = this.easeInOutCubic(progress);
        window.scrollTo(0, start + (distance * ease));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animationFrame);
        }
      };
      
      requestAnimationFrame(animationFrame);
    },
    
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
  },
  
  mounted() {
    // 添加滚动事件监听器
    window.addEventListener('scroll', this.handleScroll);
    // 初始检查
    this.handleScroll();
  },
  
  beforeDestroy() {
    // 移除滚动事件监听器
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
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

.back-to-top-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient, linear-gradient(135deg, #dcbff8, #d1ecf9));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.back-to-top-btn i {
  position: relative;
  z-index: 1;
  color: var(--icon-primary, #5e60ce);
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.back-to-top-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 8px 16px var(--card-shadow, rgba(0, 0, 0, 0.15)),
    0 0 0 2px var(--icon-primary, rgba(94, 96, 206, 0.5));
}

.back-to-top-btn:hover::before {
  opacity: 0.3;
}

.back-to-top-btn:hover i {
  color: var(--icon-accent, #6b90ff);
  transform: scale(1.1);
}

.back-to-top-btn:active {
  transform: translateY(-1px) scale(1);
  transition-duration: 0.1s;
}

/* 淡入淡出动画 */
.back-to-top-fade-enter-active, .back-to-top-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-fade-enter, .back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-to-top-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .back-to-top-btn {
    bottom: 15px;
    right: 15px;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .back-to-top-btn {
    border: 2px solid var(--text-color);
    background: var(--card-bg) !important;
    color: var(--text-color) !important;
  }
  
  .back-to-top-btn:hover {
    background: var(--card-bg-hover) !important;
    color: var(--icon-primary) !important;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .back-to-top-btn,
  .back-to-top-fade-enter-active,
  .back-to-top-fade-leave-active {
    transition: none;
  }
  
  .back-to-top-btn:hover {
    transform: none;
  }
}</style> 