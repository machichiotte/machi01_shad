// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/index';

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import VueGoodTablePlugin from 'vue-good-table-next';
import 'vue-good-table-next/dist/vue-good-table-next.css'

import vClickOutside from 'v-click-outside'

const app = createApp(App);

app.use(router)
app.use(VueSweetalert2)
app.use(VueGoodTablePlugin)
app.use(vClickOutside)
app.mount('#app')