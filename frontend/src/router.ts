// src/router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from './components/Home.vue'
import DashboardView from './components/dashboard/DashboardView.vue'
import InvestCalculator from './components/form/InvestmentCalculator.vue'
import Orders from './components/order/Orders.vue'
import Cmc from './components/cmc/Cmc.vue'
import Strategy from './components/strat/Strategy.vue'
import Trades from './components/trade/Trades.vue'
import Stuff from './components/Stuff.vue'
import Config from './components/Config.vue'
import RssFeedDisplay from './components/rss/RssFeedDisplay.vue'
import Livedata from './components/livedata/Livedata.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/order', name: 'order', component: Orders },
  { path: '/invest', name: 'invest', component: InvestCalculator },
  { path: '/cmc', name: 'cmc', component: Cmc },
  { path: '/home', name: 'balance', component: Home },
  { path: '/strategy', name: 'strategy', component: Strategy },
  { path: '/trade', name: 'trade', component: Trades },
  { path: '/stuff', name: 'stuff', component: Stuff },
  { path: '/config', name: 'config', component: Config },
  { path: '/rss', name: 'rss', component: RssFeedDisplay },
  { path: '/livedata', name: 'livedata', component: Livedata },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
