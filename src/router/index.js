// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
//import HomePage from '@/components/HomePage';
import AdminPage from '@/components/AdminPage';
import MarketAnalysisPage from '@/components/MarketAnalysisPage';
import OrderManagementPage from '@/components/OrderManagementPage';
import PortfolioManagementPage from '@/components/PortfolioManagementPage';

const routes = [
  { path: '/', component: AdminPage },
  { path: '/portfolio', component: PortfolioManagementPage },
  { path: '/market-analysis', component: MarketAnalysisPage },
  { path: '/order-management', component: OrderManagementPage },
  { path: '/admin', component: AdminPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;