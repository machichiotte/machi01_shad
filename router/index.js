// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage';
import Shad from '@/components/ShadPage';
import ActiveOrders from '@/components/ActiveOrdersPage';
import ShowData from '@/components/ShowDataPage';
import Update from '@/components/UpdatePage';
import Strat from '@/components/StratPage';
import Trades from '@/components/TradesPage';

const routes = [
  { path: '/', component: Home },
  { path: '/update', component: Update },
  { path: '/active-orders', component: ActiveOrders },
  { path: '/show-data', component: ShowData },
  { path: '/shad', component: Shad },
  { path: '/strat', component: Strat },
  { path: '/trades', component: Trades },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;