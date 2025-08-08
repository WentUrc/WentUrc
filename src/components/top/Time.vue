<template>
  <div class="time-widget" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="time-card" :class="{ 'hovered': isHovered }">
      <!-- 标题栏 -->
      <div class="header-row">
        <div class="card-title">时间喵✨</div>
        <div class="time-icon">
          <i class="fas fa-clock"></i>
        </div>
      </div>
      
      <!-- 时间显示 -->
      <div class="time-display">
        <div class="current-time">{{ currentTime }}</div>
        <div class="date-container">
          <div class="current-date">{{ currentDate }}</div>
          <div class="day-of-week">{{ dayOfWeek }}</div>
        </div>
      </div>
  <!-- 明确的底部留白，占位使日期与底部边框有稳定距离 -->
  <div class="bottom-spacer" aria-hidden="true"></div>
      
      <!-- 装饰性时钟指针 -->
      <div class="clock-hands">
        <div class="hand hour-hand" :style="hourRotation"></div>
        <div class="hand minute-hand" :style="minuteRotation"></div>
        <div class="hand second-hand" :style="secondRotation"></div>
        <div class="center-point"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeWidget',
  data() {
    return {
      currentTime: '00:00:00',
      currentDate: '',
      dayOfWeek: '',
      timer: null,
      isHovered: false,
      hourAngle: 0,
      minuteAngle: 0,
      secondAngle: 0
    }
  },
  computed: {
    hourRotation() {
      return {
        transform: `rotate(${this.hourAngle}deg)`
      }
    },
    minuteRotation() {
      return {
        transform: `rotate(${this.minuteAngle}deg)`
      }
    },
    secondRotation() {
      return {
        transform: `rotate(${this.secondAngle}deg)`
      }
    }
  },
  methods: {
    updateTime() {
      const now = new Date();
      
      // 更新时钟角度
      this.secondAngle = now.getSeconds() * 6; // 6度每秒
      this.minuteAngle = now.getMinutes() * 6 + now.getSeconds() * 0.1; // 6度每分钟
      this.hourAngle = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5; // 30度每小时
      
      // 格式化时间 HH:MM:SS
      this.currentTime = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // 格式化日期 YYYY年MM月DD日
      this.currentDate = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // 获取星期几
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      this.dayOfWeek = days[now.getDay()];
    }
  },
  mounted() {
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
}
</script>

<style scoped>
.time-widget {
  margin-bottom: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.time-card {
  position: relative;
  width: 100%;
  margin-top: 5px;
  padding: 15px;
  padding-bottom: 28px; /* 增加内部底部留白 */
  box-sizing: border-box;
  overflow: hidden;
  height: 160px;
  background: 
    linear-gradient(var(--card-bg, rgba(255, 255, 255, 0.8)), var(--card-bg, rgba(255, 255, 255, 0.8))) padding-box,
  linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box;
  border: 4px solid transparent;
  border-radius: 16px;
  transform: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.time-card.hovered {
  transform: translateX(0) scale(1.02);
  background:
    linear-gradient(var(--card-bg-hover, rgba(255, 255, 255, 0.95)), var(--card-bg-hover, rgba(255, 255, 255, 0.95))) padding-box,
    linear-gradient(to right, var(--border-gradient, #cfefff, #d6f3ff, #bfe4ff, #e0f7ff)) border-box;
  box-shadow: 0 8px 20px var(--card-shadow, rgba(30, 144, 255, 0.25));
}

/* 底部占位留白，确保日期与边框的间距稳定可见 */
.bottom-spacer {
  height: 14px;
}

/* 标题行 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--icon-primary, #1e90ff);
}

.time-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient, linear-gradient(135deg, #73c2fb, #1e90ff));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-icon i {
  color: white;
  font-size: 16px;
}

/* 时间显示 */
.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px; /* 增大与下方边框的外间距 */
  padding-bottom: 8px; /* 增加内部底部留白 */
  position: relative;
  z-index: 2;
}

.current-time {
  font-size: 42px;
  font-weight: 700;
  background: var(--primary-gradient, linear-gradient(45deg, #73c2fb, #1e90ff));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px var(--card-shadow, rgba(30, 144, 255, 0.2));
}

.date-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
}

.current-date {
  font-size: 16px;
  color: var(--text-color, #666);
}

.day-of-week {
  font-size: 16px;
  color: var(--icon-primary, #1e90ff);
  font-weight: 500;
}

/* 装饰性时钟 */
.clock-hands {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 60px;
  height: 60px;
  border: 2px solid var(--divider-color, rgba(30, 144, 255, 0.2));
  border-radius: 50%;
  transform: translateY(-50%);
  opacity: 0.25;
  transition: opacity 0.4s ease;
}

.time-card.hovered .clock-hands {
  opacity: 0.7;
}

.hand {
  position: absolute;
  background: var(--icon-primary, #1e90ff);
  transform-origin: bottom center;
  border-radius: 4px;
  left: 50%;
}

.hour-hand {
  width: 3px;
  height: 15px;
  top: 15px;
  margin-left: -1.5px;
}

.minute-hand {
  width: 2px;
  height: 20px;
  top: 10px;
  margin-left: -1px;
}

.second-hand {
  width: 1px;
  height: 25px;
  top: 5px;
  margin-left: -0.5px;
  background: var(--icon-accent, #ff6b6b);
}

.center-point {
  position: absolute;
  background: var(--icon-primary, #1e90ff);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .time-card {
    height: 150px;
  }
  
  .time-display {
    margin-bottom: 12px;
    padding-bottom: 6px;
  }
  
  .current-time {
    font-size: 36px;
  }
  
  .clock-hands {
    width: 50px;
    height: 50px;
    right: 15px;
  }
  
  .bottom-spacer {
    height: 10px;
  }
}
</style>