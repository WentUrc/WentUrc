import { createRouter, createWebHashHistory } from 'vue-router'
import HomeIntroVideo from './components/body/HomeIntroVideo.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeIntroVideo }
]

const router = createRouter({
  history: createWebHashHistory(), // 哈希模式路由
  routes
})

// Vercel Analytics：在哈希路由下手动上报 pageview
router.afterEach(() => {
  if (typeof window !== 'undefined' && typeof window.va === 'function') {
    try {
      window.va('pageview')
    } catch (e) {
      // 静默失败，避免影响导航
    }
  }
})

export default router
