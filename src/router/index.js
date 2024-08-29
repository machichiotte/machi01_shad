// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import Home from '@comp/Home.vue'
import Shad from '@comp/shad/Shad.vue'
import Orders from '@comp/orders/Orders.vue'
import Cmc from '@comp/Cmc.vue'
import Update from '@comp/Update.vue'
import Strategy from '@comp/Strategy.vue'
import Trades from '@comp/Trades.vue'
import Converter from '@comp/Converter.vue'
import Login from '@comp/Login.vue'
import Signup from '@comp/Signup.vue'

const routes = [
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
