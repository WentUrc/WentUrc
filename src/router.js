import { createRouter, createWebHashHistory } from 'vue-router'
import RoleSelection from './components/body/RoleSelection.vue'
import Dialogue from './components/body/Dialogue.vue'

const routes = [
  { path: '/', name: 'Home', component: RoleSelection },
  { path: '/dialogue', name: 'Dialogue', component: Dialogue },
]

const router = createRouter({
  history: createWebHashHistory(), // 改为哈希模式路由
  routes
})

export default router
