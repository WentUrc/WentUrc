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
  color: #5e60ce;
  padding: 20px;
  text-align: center;
  /* 采用更丰富的背景渐变 */
  background: linear-gradient(-45deg, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

/* 渐变上边框 */
.app-footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc);
}

.footer-content p {
  margin: 5px 0;
  font-weight: bold;
}

/* 渐变文本效果 */
.gradient-text {
  font-size: 16px;
  display: inline-block;
  background: linear-gradient(to right, #4facfe, #00f2fe, #f77062, #fe5196);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 400%;
  background-position: 0% 50%;
  transition: background-position 0.5s ease-in-out;
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