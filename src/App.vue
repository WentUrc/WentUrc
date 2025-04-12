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
import ProfileCard from './components/body/ProfileCard.vue'
import Footer from './components/buttom/Footer.vue'
import Logo from './components/top/Logo.vue'
import EasterEgg from './components/other/EasterEgg.vue'
import Achievements from './components/other/Achievements.vue'

export default {
  name: 'App',
  components: {
    ProfileCard,
    Footer,
    Logo,
    EasterEgg,
    Achievements
  }
}
</script>