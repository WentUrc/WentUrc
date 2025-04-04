import { createRouter, createWebHistory } from 'vue-router'
import RoleSelection from './components/RoleSelection.vue'
import Dialogue from './components/Dialogue.vue'

const routes = [
  { path: '/', name: 'Home', component: RoleSelection },
  { path: '/dialogue', name: 'Dialogue', component: Dialogue },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
