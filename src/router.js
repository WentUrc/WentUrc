import { createRouter, createWebHistory } from 'vue-router'
import RoleSelection from './components//body/RoleSelection.vue'
import Dialogue from './components/body/Dialogue.vue'

const routes = [
  { path: '/', name: 'Home', component: RoleSelection },
  { path: '/dialogue', name: 'Dialogue', component: Dialogue },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
