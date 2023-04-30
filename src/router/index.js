// router/index.js
/*import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App'
import HomePage from '@/components/HomePage';
import AdminPage from '@/components/AdminPage';
import MarketAnalysisPage from '@/components/MarketAnalysisPage';
import OrderManagementPage from '@/components/OrderManagementPage';
import PortfolioManagementPage from '@/components/PortfolioManagementPage';

const routes = [
    { path: '/', component: HomePage },
    { path: '/admin', component: AdminPage },
    { path: '/market-analysis', component: MarketAnalysisPage },
    { path: '/order-management', component: OrderManagementPage },
    { path: '/portfolio', component: PortfolioManagementPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const app = createApp(App)

app.use(router)

app.mount('#app')*/

// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage';
import AdminPage from '@/components/AdminPage';
import MarketAnalysisPage from '@/components/MarketAnalysisPage';
import OrderManagementPage from '@/components/OrderManagementPage';
import PortfolioManagementPage from '@/components/PortfolioManagementPage';

const routes = [
  { path: '/', component: HomePage },
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