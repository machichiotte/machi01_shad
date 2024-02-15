// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "@/components/Home.vue";
import AddTrades from "@/components/AddTrades.vue";
import Shad from "@/components/Shad.vue";
import Orders from "@comp/Orders.vue";
import Cmc from "@/components/Cmc.vue";
import Update from "@/components/Update.vue";
import Strategy from "@/components/Strategy.vue";
import Trades from "@/components/Trades.vue";
import Converter from "@/components/Converter.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/addtrades", component: AddTrades },
  { path: "/update", component: Update },
  { path: "/orders", component: Orders },
  { path: "/cmc", component: Cmc },
  { path: "/shad", component: Shad },
  { path: "/strategy", component: Strategy },
  { path: "/trades", component: Trades },
  { path: "/converter", component: Converter },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
