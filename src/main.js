import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "./assets/css/reset.css"
import "./assets/css/color.css"
import playlistData from "./assets/data/playlist.json"
import notificationService from './utils/notificationService'
import devToolsDetector from './utils/devToolsDetector'
import seasonTracker from './components/other/achievements/easter-eggs/SeasonTracker'
import silentBrowsingTracker from './components/other/achievements/easter-eggs/SilentBrowsingTracker.js';

import { initializeTheme } from './utils/root'
initializeTheme()

// 启用开发者工具检测
devToolsDetector.enable();

// 启用季节追踪器
seasonTracker.enable();

// 初始化静音浏览跟踪器
silentBrowsingTracker.initialize();

// 注册页面卸载事件，清理资源
window.addEventListener('beforeunload', () => {
  silentBrowsingTracker.cleanup();
});

const app = createApp(App)
app.config.globalProperties.$playlistData = playlistData
app.config.globalProperties.$notify = notificationService
app.use(router).mount('#app')

// 开发环境调试
if (import.meta.env.DEV) {
  window.$notify = notificationService
}