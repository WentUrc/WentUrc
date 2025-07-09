import { createRouter, createWebHashHistory } from 'vue-router'
import RoleSelection from './components/body/RoleSelection.vue'
import Dialogue from './components/body/Dialogue.vue'
import RecordsPage from './components/body/RecordsPage.vue'
import MessageBoardPage from './components/body/MessageBoardPage.vue'
import FriendLinksPage from './components/body/FriendLinksPage.vue'

const routes = [
  { path: '/', name: 'Home', component: RoleSelection },
  { path: '/dialogue', name: 'Dialogue', component: Dialogue },
  { path: '/records', name: 'Records', component: RecordsPage, meta: { title: 'NeverNever_Land 记录' } },
  { path: '/message-board', name: 'MessageBoard', component: MessageBoardPage, meta: { title: '留言板' } },
  { path: '/friend-links', name: 'FriendLinks', component: FriendLinksPage, meta: { title: '友情链接' } },
]

const router = createRouter({
  history: createWebHashHistory(), // 改为哈希模式路由
  routes
})

export default router
