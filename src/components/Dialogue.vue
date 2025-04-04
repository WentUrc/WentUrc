<template>
  <div class="dialogue-container">
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
  created() {
    const storedRole = localStorage.getItem('selectedRole')
    if (storedRole) {
      const parsedRole = JSON.parse(storedRole)
      this.role = {
        ...parsedRole,
        route: parsedRole.route || this.getRoleRoute(parsedRole.name) // 确保 route 正确
      }
      this.script = dialogueScripts[this.role.name] || ["冒险开始了！"]
    } else {
      this.$router.push({ name: 'Home' })
    }
  },
  methods: {
    proceed() {
      if (this.role.route) {
        window.location.href = this.role.route // ✅ 跳转到 role 的外部网址
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 750px;
  background: linear-gradient(to bottom, #222223, #4c4c4d);
}

.dialogue-box {
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
  text-align: center;
  width: 80%;
  max-width: 500px;
}

.dialogue-title {
  color: #a96df8;
  font-size: 24px;
  margin-bottom: 15px;
}

.dialogue-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.dialogue-line {
  color: #ffffff;
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
  background: #a96df8;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}

.dialogue-button:hover {
  background: #a96df8;
  transform: scale(1.05);
}

/* 可选：为返回按钮设置不同样式 */
.dialogue-button.back {
  background: #666;
}

.dialogue-button.back:hover {
  background: #555;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
