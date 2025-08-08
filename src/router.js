import { createRouter, createWebHashHistory } from 'vue-router'
import RoleSelection from './components/body/RoleSelection.vue'
import Dialogue from './components/body/Dialogue.vue'
import MessageBoardPage from './components/body/MessageBoardPage.vue'
import FriendLinksPage from './components/body/FriendLinksPage.vue'

const routes = [
  { path: '/', name: 'Home', component: RoleSelection },
  { path: '/dialogue', name: 'Dialogue', component: Dialogue },
  { path: '/message-board', name: 'MessageBoard', component: MessageBoardPage, meta: { title: '留言板' } },
  { path: '/friend-links', name: 'FriendLinks', component: FriendLinksPage, meta: { title: '友情链接' } },
]

const router = createRouter({
  history: createWebHashHistory(), // 改为哈希模式路由
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
