// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../components/Home.vue'
import Machi from '../components/machi/Machi.vue'
import Orders from '../components/order/Orders.vue'
import Cmc from '../components/Cmc.vue'
import Strategy from '../components/Strategy.vue'
import Trades from '../components/trade/Trades.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: Home },
  { path: '/orders', name: 'orders', component: Orders },
  { path: '/cmc', name: 'cmc', component: Cmc },
  { path: '/machi', name: 'machi', component: Machi },
  { path: '/strategy', name: 'strategy', component: Strategy },
  { path: '/trades', name: 'trades', component: Trades },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
