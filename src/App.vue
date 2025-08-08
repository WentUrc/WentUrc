<template>
  <div id="app">
    <ProfileCard />
    <div class="app-layout">
      <TabNavigation />
      <div class="content-container">
        <router-view />
      </div>
    </div>
    <Footer />
    <Logo />
    <EasterEgg />
    <Achievements />
    <BackToTop />
    <Analytics />
    <SpeedInsights />
  </div>
</template>

<script>
import ProfileCard from './components/body/ProfileCard.vue';
import TabNavigation from './components/body/TabNavigation.vue';
import Footer from './components/buttom/Footer.vue';
import Logo from './components/top/Logo.vue';
import EasterEgg from './components/other/EasterEgg.vue';
import Achievements from './components/other/Achievements.vue';
import BackToTop from './components/other/BackToTop.vue';
import newYearTracker from './components/other/achievements/easter-eggs/NewYearTracker.js';
import midnightTracker from './components/other/achievements/easter-eggs/MidnightTracker.js';
import achievementHunterTracker from './components/other/achievements/easter-eggs/AchievementHunterTracker.js';
import achievementMasterTracker from './components/other/achievements/easter-eggs/AchievementMasterTracker.js';
import { Analytics } from '@vercel/analytics/vue';
import { SpeedInsights } from "@vercel/speed-insights/vue"

export default {
  name: 'App',
  components: {
    ProfileCard,
    TabNavigation,
    Footer,
    Logo,
    EasterEgg,
    Achievements,
    BackToTop,
    Analytics,
    SpeedInsights
  },
  mounted() {
    // 初始化新年跟踪器
    newYearTracker.initialize();
    // 初始化时间相关成就跟踪器
    midnightTracker.initialize();
    // 初始化成就猎人跟踪器
    achievementHunterTracker.initialize();
    // 初始化成就大师跟踪器
    achievementMasterTracker.initialize();

    // 延迟后再检查一次，确保所有成就数据都已加载
    setTimeout(() => {
      achievementHunterTracker.checkAndUnlockImmediately();
      achievementMasterTracker.checkAndUnlockImmediately();
    }, 2000);
  },
  beforeDestroy() {
    // 清理资源
    midnightTracker.cleanup();
    achievementHunterTracker.cleanup();
    achievementMasterTracker.cleanup();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* 固定视口布局 */
.app-layout {
  display: flex;
  flex-direction: column;
}

/* 桌面端：固定视口布局 */
@media (min-width: 769px) {
  .app-layout {
    height: 100vh;
    overflow: hidden;
  }
}

/* 移动端：自适应布局 */
@media (max-width: 768px) {
  .app-layout {
    min-height: 100vh;
    overflow: visible;
  }
}

.content-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 桌面端：固定视口布局 */
@media (min-width: 769px) {
  .content-container {
    height: calc(100vh - 130px); /* 减去TabNavigation高度 */
    overflow: hidden; /* 禁止容器滚动 */
  }
  
  .content-container > * {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  /* 桌面端滚动条美化 */
  .content-container > *::-webkit-scrollbar {
    width: 8px;
  }
  
  .content-container > *::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .content-container > *::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb, rgba(30, 144, 255, 0.3));
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  
  .content-container > *::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover, rgba(30, 144, 255, 0.5));
  }
}

/* 移动端：传统自适应布局 */
@media (max-width: 768px) {
  .content-container {
    height: auto;
    overflow: visible;
  }
  
  .content-container > * {
    height: auto;
    min-height: auto;
    overflow: visible;
  }
}

/* 基础样式 */
.content-container > * {
  box-sizing: border-box;
}

</style>