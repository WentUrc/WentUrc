<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>
        &copy; 2024 - present 
        <span class="gradient-text">WentUrc. 冰苷晶</span>
      </p>
      <p class="gradient-text">All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.app-footer {
  position: relative;
  color: var(--text-color, #f1f1f1);
  padding: 20px;
  text-align: center;
  background: linear-gradient(-45deg, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  z-index: 1;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
}

/* 添加一个背景调整层 - 默认为浅色模式 */
.app-footer::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6); /* 浅色模式下添加白色半透明叠加，使背景更淡 */
  z-index: -1;
  transition: background 0.3s ease;
}

/* 在深色模式下添加半透明黑色叠加以增加对比度 */
[data-theme="dark"] .app-footer::after {
  background: rgba(0, 0, 0, 0.5);
}

/* 渐变上边框 */
.app-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, var(--border-gradient, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc));
  z-index: 2;
}

.footer-content p {
  margin: 5px 0;
  font-weight: bold;
  position: relative;
  z-index: 2;
  letter-spacing: 0.02em; /* 添加轻微字间距提升可读性 */
}

/* 渐变文本效果 - 移除阴影 */
.gradient-text {
  font-size: 16px;
  display: inline-block;
  background: var(--primary-gradient, linear-gradient(to right, #4facfe, #00f2fe, #f77062, #fe5196));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400%;
  background-position: 0% 50%;
  transition: background-position 0.5s ease-in-out;
  font-family: inherit; /* 确保继承父元素字体 */
}

/* 深色模式下调整文字亮度 */
[data-theme="dark"] .gradient-text {
  filter: brightness(150%) contrast(120%); /* 增加亮度以提升可见度 */
}

.gradient-text:hover {
  background-position: 100% 50%;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@media (max-width: 768px) {
  .app-footer {
    animation: none;
  }
}
</style>