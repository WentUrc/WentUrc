<template>
  <div id="app">
    <div class="content-container">
      <div class="section">
        <ProfileCard />
      </div>
      <div class="section">
        <HomeIntroVideo />
      </div>
      <div class="section">
        <AboutMe />
      </div>
      <div class="section section-footer">
        <Footer />
      </div>
    </div>
    <Logo />
    <EasterEgg />
    <Achievements />
    <Analytics />
    <SpeedInsights />
  </div>
</template>

<script>
import ProfileCard from './components/body/ProfileCard.vue';
import HomeIntroVideo from './components/body/HomeIntroVideo.vue';
import AboutMe from './components/body/AboutMe.vue';
import Footer from './components/buttom/Footer.vue';
import Logo from './components/top/Logo.vue';
import EasterEgg from './components/other/EasterEgg.vue';
import Achievements from './components/other/Achievements.vue';
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
    HomeIntroVideo,
    AboutMe,
    Footer,
    Logo,
    EasterEgg,
    Achievements,
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

/* 内容容器（开启纵向滚动吸附） */
.content-container {
  width: 100%;
  height: 100vh; /* 作为独立滚动容器 */
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-type: y mandatory; /* 开启吸附 */
}

/* 通用全屏段落样式，便于扩展多个区块 */
.section {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  /* 使用 scroll-margin 顶部对齐，避免减少区块高度 */
  scroll-margin-top: var(--topbar-height, 60px);
}

/* 让 footer 段为自适应高度，并吸附到视口底部 */
.section-footer {
  height: auto;
  min-height: auto;
  scroll-snap-align: end;
  scroll-snap-stop: normal;
  display: block;
}

/* 桌面端与移动端统一为自适应布局 */
@media (min-width: 769px) {
  .content-container {
    height: 100vh;
  }
}

@media (max-width: 768px) {
  .content-container {
    height: 100vh;
  }
}

/* 基础样式 */
.content-container > * {
  box-sizing: border-box;
}
</style>