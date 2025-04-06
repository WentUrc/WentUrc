<template>
  <div class="logo-banner" :class="{ 'not-at-top': !isAtTop }">
    <a href="https://wenturc.com" target="_blank">
      <img src="/favicon.webp" alt="Logo" draggable="false" @contextmenu.prevent />
      <span class="logo-text">WentUrc</span>
    </a>
  </div>
</template>

<script>
export default {
  name: 'Logo',
  data() {
    return {
      isAtTop: true
    }
  },
  methods: {
    onScroll() {
      this.isAtTop = window.pageYOffset === 0;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  }
}
</script>

<style scoped>
/* 通过 @font-face 引入自定义字体 */
@font-face {
  font-family: "SHOECARD GOTHIC";
  src: url('/fonts/Showcard-Gothic.woff2') format('woff2'),
       url('/fonts/Showcard-Gothic.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.logo-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.8); /* 半透明背景 */
  border-bottom: 4px solid transparent;
  border-image: linear-gradient(-45deg, #dcbff8, #d1ecf9, #c6e2ff, #f9d1dc) 1;
  z-index: 1000;
  cursor: pointer;
  transition: opacity 0.3s ease;
  opacity: 1;
}

/* 当不在页面顶部时，降低能见度并禁用点击事件 */
.logo-banner.not-at-top {
  opacity: 0;
  pointer-events: none;
}

.logo-banner a {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-banner a img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border: 3px solid #bdbbbb; 
  border-radius: 10px; 
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none; 
}

.logo-text {
  margin-left: 20px;
  font-weight: bold;
  font-size: 2rem;
  font-family: "SHOECARD GOTHIC", sans-serif;
  background: linear-gradient(45deg, #6b90ff, #1c36f8, #505ce3);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
}

/* 渐变动画 */
@keyframes gradient {
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
</style>