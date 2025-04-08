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
import { dialogueScripts } from '../utils/rpg'
import { roles } from '../utils/rpg'
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
    // 自定义每行的不规则字体大小
    fontSizes() {
      return ['10rem', '6rem', '12rem', '14rem', '8rem']
    },
    // 自定义每行动画时长
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
  background: linear-gradient(-45deg, #faf3f3, #f0f4ff, #dbe1ff, #d6d6fc);
  background-size: 400% 400%;
  animation: gradientMotion 15s ease infinite;
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
  background: linear-gradient(to right, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc);
  z-index: 2;
}

@keyframes gradientMotion {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
  opacity: 0.1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

/* 每行容器：字体大小由内联 style 设置 */
.background-words > div {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  transform: rotate(-15deg);
  color: #6a73c9;
  font-weight: bold;
}

/* 偶数行整体向左往返移动 */
.row-left {
  animation-name: rowLeft;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes rowLeft {
  0% { transform: rotate(-15deg) translateX(0); }
  100% { transform: rotate(-15deg) translateX(-100px); }
}

/* 奇数行整体向右往返移动 */
.row-right {
  animation-name: rowRight;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes rowRight {
  0% { transform: rotate(-15deg) translateX(0); }
  100% { transform: rotate(-15deg) translateX(100px); }
}

.dialogue-box {
  position: relative;
  z-index: 3;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 80%;
  max-width: 500px;
  border: 2px solid transparent;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

.dialogue-box:hover {
  border-color: #6a73c9;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.dialogue-title {
  color: #5e67ce;
  font-size: 24px;
  margin-bottom: 15px;
}

.dialogue-content {
  background: #f9f9ff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #e0e0ff;
}

.dialogue-line {
  color: #555;
  font-size: 18px;
  line-height: 1.5;
  animation: fadeIn 0.5s ease-in-out;
}

.dialogue-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.dialogue-button {
  padding: 12px 24px;
  font-size: 18px;
  background: #5e67ce;
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.3s, background 0.3s;
}

.dialogue-button:hover {
  background: #5750d3;
  transform: scale(1.05);
}

.dialogue-button.back {
  background: #7c84db;
  color: #fff;
}

.dialogue-button.back:hover {
  background: #6a73c9;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>