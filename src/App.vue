<template>
  <div id="app">
    <ProfileCard />
    <router-view />
    <Footer />
    <Logo />
  </div>
</template>

<script>
import ProfileCard from './components/body/ProfileCard.vue'
import Footer from './components/buttom/Footer.vue'
import Logo from './components/top/Logo.vue'

export default {
  name: 'App',
  components: {
    ProfileCard,
    Footer,
    Logo
  }
}
</script>