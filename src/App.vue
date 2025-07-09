<template>
  <div id="app">
    <ProfileCard />
    <router-view />
    <Footer />
    <Logo />
    <EasterEgg />
    <Achievements />
  </div>
</template>

<script>
import ProfileCard from './components/body/ProfileCard.vue';
import Footer from './components/buttom/Footer.vue';
import Logo from './components/top/Logo.vue';
import EasterEgg from './components/other/EasterEgg.vue';
import Achievements from './components/other/Achievements.vue';
import newYearTracker from './components/other/achievements/easter-eggs/NewYearTracker.js';
import midnightTracker from './components/other/achievements/easter-eggs/MidnightTracker.js';
import achievementHunterTracker from './components/other/achievements/easter-eggs/AchievementHunterTracker.js';
import achievementMasterTracker from './components/other/achievements/easter-eggs/AchievementMasterTracker.js';

export default {
  name: 'App',
  components: {
    ProfileCard,
    Footer,
    Logo,
    EasterEgg,
    Achievements,
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