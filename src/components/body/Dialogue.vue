<template>
  <div class="dialogue-container">
    <!-- 使用多行来排列背景文字，每行设置独特的字体大小和移动速度 -->
    <div class="background-words">
      <div 
        v-for="(row, rowIndex) in 5" 
        :key="rowIndex" 
        :class="(rowIndex % 2 === 0) ? 'row-left' : 'row-right'"
        :style="{
          animationDelay: (rowIndex * 0.5) + 's',
          fontSize: fontSizes[rowIndex],
          animationDuration: durations[rowIndex]
        }">
        <!-- 每行显示10个文字 -->
        <span v-for="n in 10" :key="n">{{ 'ViaLonga Somniviva' }}</span>
      </div>
    </div>
    <div class="dialogue-box">
      <h1 class="dialogue-title">{{ role.name }}的冒险开始了！</h1>
      <div class="dialogue-content">
        <p v-for="(line, index) in script" :key="index" class="dialogue-line">{{ line }}</p>
      </div>
      <div class="dialogue-buttons">
        <button class="dialogue-button adventure" @click="proceed">
          <i class="fas fa-compass"></i>
          <span>进入冒险</span>
        </button>
        <button class="dialogue-button back" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>后悔啦？</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { dialogueScripts } from '../../utils/rpg'
import { roles } from '../../utils/rpg'
import { gsap } from 'gsap'

export default {
  name: 'Dialogue',
  data() {
    return {
      role: {},
      script: []
    }
  },
  computed: {
    fontSizes() {
      return ['10rem', '6rem', '12rem', '14rem', '8rem']
    },
    durations() {
      return ['5s', '4s', '6s', '5s', '7s']
    }
  },
  created() {
    const storedRole = localStorage.getItem('selectedRole')
    if (storedRole) {
      const parsedRole = JSON.parse(storedRole)
      this.role = {
        ...parsedRole,
        route: parsedRole.route || this.getRoleRoute(parsedRole.name)
      }
      this.script = dialogueScripts[this.role.name] || ["冒险开始了！"]
    } else {
      this.$router.push({ name: 'Home' })
    }
  },
  mounted() {
    gsap.from(this.$el.querySelector('.dialogue-box'), {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power2.out"
    })
  },
  methods: {
    proceed() {
      if (this.role.route) {
        window.location.href = this.role.route
      } else {
        console.error('角色没有配置 route，跳转失败')
        alert('未找到冒险的目的地！')
      }
    },
    goBack() {
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
.dialogue-container {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  background-size: 400% 400%;
  transition: background 0.3s ease; /* 添加背景过渡效果 */
  box-sizing: border-box;
  min-height: 60vh;
}

/* 桌面端：固定高度 + 内部滚动 */
@media (min-width: 769px) {
  .dialogue-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* 移动端：自适应高度 + 传统布局 */
@media (max-width: 768px) {
  .dialogue-container {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}

/* 背景文字区域，按行排列 */
.background-words {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.12;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  overflow: hidden;
  /* 使用mask实现顶部自然淡出效果 */
  -webkit-mask: linear-gradient(to bottom, transparent 0%, transparent 60px, rgba(255,255,255,1) 120px, rgba(255,255,255,1) 100%);
  mask: linear-gradient(to bottom, transparent 0%, transparent 60px, rgba(255,255,255,1) 120px, rgba(255,255,255,1) 100%);
}

/* 每行容器：字体大小由内联 style 设置 */
.background-words > div {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  transform: rotate(-15deg);
  color: var(--icon-primary, #1e90ff);
  font-weight: bold;
  white-space: nowrap;
  letter-spacing: -1px;
}

/* 偶数行整体向左往返移动 */
.row-left {
  animation-name: rowLeft;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes rowLeft {
  0% { transform: rotate(-15deg) translateX(0); }
  100% { transform: rotate(-15deg) translateX(-120px); }
}

/* 奇数行整体向右往返移动 */
.row-right {
  animation-name: rowRight;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes rowRight {
  0% { transform: rotate(-15deg) translateX(0); }
  100% { transform: rotate(-15deg) translateX(120px); }
}

.dialogue-box {
  position: relative;
  z-index: 3;
  background: 
    linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.95)), var(--card-bg-hover, rgba(255, 255, 255, 0.95))) padding-box,
  linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box;
  padding: 28px 30px;
  border-radius: 18px;
  border: 2px solid transparent;
  box-shadow: 
    0 10px 25px -5px var(--card-shadow, rgba(0, 0, 0, 0.1)),
    0 5px 10px -5px var(--card-shadow, rgba(0, 0, 0, 0.05));
  text-align: center;
  width: 80%;
  height: 420px;
  max-width: 500px;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              box-shadow 0.3s ease,
              background 0.3s ease;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  overflow: hidden; /* 添加溢出隐藏，使装饰元素不超出边界 */
  transform: translateY(-40px); /* 向上移动40px */
}

/* 添加卡片装饰元素 - 角落小圆点 */
.dialogue-box::before {
  content: "";
  position: absolute;
  width: 150px;
  height: 150px;
  background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff));
  border-radius: 50%;
  top: -75px;
  right: -75px;
  opacity: 0.15;
  transition: all 0.5s ease;
}

/* 添加卡片装饰元素 - 底部波浪 */
.dialogue-box::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: -10%;
  width: 120%;
  height: 60px;
  background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff));
  opacity: 0.07;
  border-radius: 50%;
  transform: scale(1, 0.2);
  z-index: -1;
  transition: all 0.5s ease;
}

.dialogue-box:hover {
  transform: translateY(-46px); /* 在基础-40px基础上再向上6px */
  background: 
    linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.98)), var(--card-bg-hover, rgba(255, 255, 255, 0.98))) padding-box,
  linear-gradient(to right, var(--border-gradient, #9fd6ff, #73c2fb, #1e90ff, #9fd6ff)) border-box;
  box-shadow: 
    0 15px 30px -10px var(--card-shadow, rgba(0, 0, 0, 0.15)),
    0 8px 15px -5px var(--card-shadow, rgba(0, 0, 0, 0.1));
}

/* 悬停时的装饰元素动画 */
.dialogue-box:hover::before {
  transform: scale(1.1) rotate(15deg);
  opacity: 0.2;
}

.dialogue-box:hover::after {
  transform: scale(1.1, 0.22);
  opacity: 0.1;
}

/* 适配暗色主题 */
:root[data-theme="dark"] .dialogue-box {
  background: 
    linear-gradient(var(--card-bg-hover, rgba(40, 40, 40, 0.95)), var(--card-bg-hover, rgba(40, 40, 40, 0.95))) padding-box,
  linear-gradient(to right, var(--border-gradient, #4aa3e0, #73c2fb, #4da3ff, #5aa9f6)) border-box;
}

:root[data-theme="dark"] .dialogue-box:hover {
  background: 
    linear-gradient(var(--card-bg-hover, rgba(45, 45, 45, 0.98)), var(--card-bg-hover, rgba(45, 45, 45, 0.98))) padding-box,
    linear-gradient(to right, var(--border-gradient, #9b8dda, #6b90ff, #7294d5, #b98db6)) border-box;
}

.dialogue-title {
  color: var(--icon-primary, #5e67ce);
  font-size: 28px;
  margin-bottom: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  position: relative;
  display: inline-block;
}

/* 标题下方装饰线 */
.dialogue-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 10%;
  width: 80%;
  height: 3px;
  background: var(--primary-gradient, linear-gradient(to right, #73c2fb, #1e90ff));
  border-radius: 3px;
  opacity: 0.7;
}

.dialogue-content {
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  padding: 22px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid var(--divider-color, #e0e0ff);
  flex: 1;
  overflow-y: auto;
  box-shadow: inset 0 1px 3px var(--card-shadow, rgba(0, 0, 0, 0.05));
  scrollbar-width: thin;
  scrollbar-color: var(--icon-primary, #6a73c9) transparent;
  text-align: left;
  position: relative; /* 为内部装饰元素定位 */
}

/* 内容区角落装饰 */
.dialogue-content::before {
  content: "✧";
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 20px;
  color: var(--icon-primary, #1e90ff);
  opacity: 0.3;
}

/* 自定义滚动条样式 (Webkit浏览器) */
.dialogue-content::-webkit-scrollbar {
  width: 5px;
}

.dialogue-content::-webkit-scrollbar-track {
  background: transparent;
}

.dialogue-content::-webkit-scrollbar-thumb {
  background-color: var(--icon-primary, #1e90ff);
  border-radius: 10px;
}

.dialogue-line {
  color: var(--text-color, #555);
  font-size: 17px;
  line-height: 1.7;
  margin-bottom: 14px;
  animation: fadeIn 0.8s cubic-bezier(0.215, 0.61, 0.355, 1);
  text-align: left;
  letter-spacing: 0.2px;
}

.dialogue-line:last-child {
  margin-bottom: 0;
}

/* 简化的按钮容器样式 */
.dialogue-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
}

/* 简化后的按钮基本样式 */
.dialogue-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  /* 使用主题系统的变量，而不是硬编码的颜色 */
  background: var(--primary-gradient, linear-gradient(135deg, var(--icon-primary, #1e90ff) 0%, var(--icon-accent, #73c2fb) 100%));
  border-radius: 30px;
  color: white;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 0.5px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px var(--card-shadow, rgba(91, 81, 200, 0.3));
}

/* 移除特定颜色设置，使用主题变量 */
.dialogue-button.adventure {
  background: var(--primary-gradient, linear-gradient(135deg, var(--icon-primary, #1e90ff) 0%, var(--icon-accent, #73c2fb) 100%));
}

/* 修改返回按钮样式，使用主题系统变量 */
.dialogue-button.back {
  /* 使用同样的主题渐变变量，但调整方向和透明度使其看起来不同 */
  background: var(--primary-gradient-alt, linear-gradient(135deg, 
    var(--icon-accent, #73c2fb) 0%, 
    var(--icon-primary, #1e90ff) 100%));
}

.dialogue-button i {
  font-size: 18px;
}

.dialogue-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--card-shadow, rgba(30, 144, 255, 0.4));
}

.dialogue-button:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px var(--card-shadow, rgba(30, 144, 255, 0.25));
}

/* 适配暗色主题 */
:root[data-theme="dark"] .dialogue-button {
  box-shadow: 0 4px 15px var(--card-shadow, rgba(0, 0, 0, 0.3));
}

:root[data-theme="dark"] .dialogue-button:hover {
  box-shadow: 0 6px 20px var(--card-shadow, rgba(0, 0, 0, 0.4));
}

/* 移除特定颜色的暗色主题设置，完全依赖CSS变量 */


/* 响应式调整 */
@media (max-width: 768px) {
  .dialogue-box {
    width: 90%;
    padding: 22px;
  }
  
  .dialogue-title {
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .dialogue-content {
    padding: 18px;
  }
  
  .dialogue-line {
    font-size: 16px;
  }
  
  .dialogue-buttons {
    flex-direction: column;
    gap: 16px;
  }
  
  .dialogue-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
  }
}
</style>