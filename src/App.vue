<template>
  <div id="app">
    <BackgroundMusic />
    <ProfileCard />
    <router-view />
    <Footer />
    <Logo />
  </div>
</template>

<script>
import ProfileCard from './components/ProfileCard.vue'
import BackgroundMusic from './components/BackgroundMusic.vue'
import Footer from './components/Footer.vue'
import Logo from './components/Logo.vue'

export default {
  name: 'App',
  components: {
    ProfileCard,
    BackgroundMusic,
    Footer,
    Logo
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
#app {
  text-align: center;
}
</style>