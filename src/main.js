import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "./assets/css/color.css"
import playlistData from "./assets/data/playlist.json"

const app = createApp(App)
app.config.globalProperties.$playlistData = playlistData  // 挂载到全局属性
app.use(router).mount('#app')