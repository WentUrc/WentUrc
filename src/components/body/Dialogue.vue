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
        <span v-for="n in 10" :key="n">{{ 'WentUrc' }}</span>
      </div>
    </div>
    <div class="dialogue-box">
      <h1 class="dialogue-title">{{ role.name }}的冒险开始了！</h1>
      <div class="dialogue-content">
        <p v-for="(line, index) in script" :key="index" class="dialogue-line">{{ line }}</p>
      </div>
      <div class="dialogue-buttons">
        <button class="dialogue-button" @click="proceed">进入冒险</button>
        <button class="dialogue-button back" @click="goBack">后悔啦？</button>
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
  align-items: center;
  height: 750px;
  background: var(--card-bg, rgba(255, 255, 255, 0.8));
  background-size: 400% 400%;
  overflow: hidden;
}

/* 新增渐变色上边框 */
.dialogue-container::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  z-index: 2;
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
}

/* 每行容器：字体大小由内联 style 设置 */
.background-words > div {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  transform: rotate(-15deg);
  color: var(--icon-primary, #6a73c9);
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
  background: var(--card-bg-hover, rgba(255, 255, 255, 0.95));
  padding: 28px 30px;
  border-radius: 18px;
  box-shadow: 
    0 10px 25px -5px var(--card-shadow, rgba(0, 0, 0, 0.1)),
    0 5px 10px -5px var(--card-shadow, rgba(0, 0, 0, 0.05));
  text-align: center;
  width: 80%;
  height: 420px;
  max-width: 500px;
  border: 2px solid transparent;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              border 0.3s ease, 
              box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  overflow: hidden; /* 添加溢出隐藏，使装饰元素不超出边界 */
}

/* 添加卡片装饰元素 - 角落小圆点 */
.dialogue-box::before {
  content: "";
  position: absolute;
  width: 150px;
  height: 150px;
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
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
  background: var(--primary-gradient, linear-gradient(135deg, #5e60ce, #6b90ff));
  opacity: 0.07;
  border-radius: 50%;
  transform: scale(1, 0.2);
  z-index: -1;
  transition: all 0.5s ease;
}

.dialogue-box:hover {
  transform: translateY(-6px);
  border-color: var(--icon-primary, #6a73c9);
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
  background: var(--primary-gradient, linear-gradient(to right, #6b90ff, #5e60ce));
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
  color: var(--icon-primary, #6a73c9);
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
  background-color: var(--icon-primary, #6a73c9);
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

.dialogue-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 4px;
  position: relative; /* 为按钮装饰定位 */
}

/* 按钮周围的微光效果 */
.dialogue-buttons::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 30px;
  background: var(--primary-gradient, linear-gradient(90deg, transparent, var(--icon-primary, #5e67ce), transparent));
  opacity: 0.1;
  top: -15px;
  filter: blur(10px);
  border-radius: 50%;
}

.dialogue-button {
  padding: 12px 28px;
  font-size: 17px;
  background: var(--icon-primary, #5e67ce);
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 
    0 5px 15px -3px var(--card-shadow, rgba(0, 0, 0, 0.2)),
    0 2px 5px -2px var(--card-shadow, rgba(0, 0, 0, 0.1));
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* 统一按钮的hover效果方向：改为从上到下 */
.dialogue-button::before {
  content: "";
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--icon-accent, #5750d3);
  z-index: -1;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  opacity: 0.9;
}

.dialogue-button:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 
    0 8px 20px -5px var(--card-shadow, rgba(0, 0, 0, 0.3)),
    0 4px 10px -3px var(--card-shadow, rgba(0, 0, 0, 0.2));
  letter-spacing: 0.8px;
}

.dialogue-button:hover::before {
  top: 0; /* 从上到下的覆盖效果 */
}

.dialogue-button:active {
  transform: translateY(0) scale(0.98);
}

/* 修改后的返回按钮样式 - 使其更醒目 */
.dialogue-button.back {
  background: var(--icon-primary, #5e67ce);
  color: #fff;
  opacity: 0.9;
}

.dialogue-button.back::before {
  background: var(--icon-accent, #5750d3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

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
    gap: 12px;
  }
  
  .dialogue-button {
    width: 100%;
  }
}
</style>