import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "./assets/css/reset.css"
import "./assets/css/color.css"
import playlistData from "./assets/data/playlist.json"

import { initializeTheme } from './utils/root'
initializeTheme()

const app = createApp(App)
app.config.globalProperties.$playlistData = playlistData
app.use(router).mount('#app')