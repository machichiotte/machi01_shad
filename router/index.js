// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home';
import AddTrades from '@/components/AddTrades';
import Shad from '@/components/Shad';
import Orders from '@/components/Orders';
import Cmc from '@/components/Cmc';
import Update from '@/components/Update';
import Strategy from '@/components/Strategy';
import Trades from '@/components/Trades';
import Converter from '@/components/Converter';

const routes = [
  { path: '/', component: Home },
  { path: '/addtrades', component: AddTrades },
  { path: '/update', component: Update },
  { path: '/orders', component: Orders },
  { path: '/cmc', component: Cmc },
  { path: '/shad', component: Shad },
  { path: '/strategy', component: Strategy },
  { path: '/trades', component: Trades },
  { path: '/converter', component: Converter },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;