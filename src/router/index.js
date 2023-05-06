// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
//import HomePage from '@/components/HomePage';
import Admin from '@/components/AdminPage';
import ActiveOrders from '@/components/ActiveOrdersPage';
import ShowData from '@/components/ShowDataPage';
import Update from '@/components/UpdatePage';
import Strat from '@/components/StratPage';

const routes = [
  { path: '/', component: Admin },
  { path: '/update', component: Update },
  { path: '/active-orders', component: ActiveOrders },
  { path: '/show-data', component: ShowData },
  { path: '/admin', component: Admin },
  { path: '/strat', component: Strat },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;