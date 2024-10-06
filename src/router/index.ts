// src/router/index.ts

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@components/Home.vue'
import Shad from '@components/shad/Shad.vue'
import Orders from '@components/orders/Orders.vue'
import Cmc from '@components/Cmc.vue'
import Update from '@components/Update.vue'
import Strategy from '@components/Strategy.vue'
import Trades from '@components/trades/Trades.vue'
import Converter from '@components/Converter.vue'
import Login from '@components/Login.vue'
import Signup from '@components/Signup.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: Home },
  { path: '/update', name: 'update', component: Update },
  { path: '/orders', name: 'orders', component: Orders },
  { path: '/cmc', name: 'cmc', component: Cmc },
  { path: '/shad', name: 'shad', component: Shad },
  { path: '/strategy', name: 'strategy', component: Strategy },
  { path: '/trades', name: 'trades', component: Trades },
  { path: '/converter', name: 'converter', component: Converter },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', name: 'signup', component: Signup },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
