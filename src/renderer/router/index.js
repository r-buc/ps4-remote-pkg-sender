import store from '@/store'
import routes from './routes'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  base: '/',
  routes
})

export default router
