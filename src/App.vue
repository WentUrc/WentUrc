<template>
  <div id="app">
    <ProfileCard />
    <router-view />
  </div>
</template>

<script>
import ProfileCard from './components/ProfileCard.vue'

export default {
  name: 'App',
  components: {
    ProfileCard
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
