// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
//import HomePage from '@/components/HomePage';
import AdminPage from '@/components/AdminPage';
import ActiveOrders from '@/components/ActiveOrdersPage';
import ShowData from '@/components/ShowDataPage';
import Update from '@/components/UpdatePage';

const routes = [
  { path: '/', component: AdminPage },
  { path: '/update', component: Update },
  { path: '/active-orders', component: ActiveOrders },
  { path: '/show-data', component: ShowData },
  { path: '/admin', component: AdminPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;