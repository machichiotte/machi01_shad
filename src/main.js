// main.js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/index'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import VueGoodTablePlugin from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

import vClickOutside from 'v-click-outside'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-light-green/theme.css'

import Button from 'primevue/button'
import LogoMachi from './components/LogoMachi.vue'

const app = createApp(App)
app.component('LogoMachi', LogoMachi)

app.use(createPinia())
app.use(router)
app.use(VueSweetalert2)
app.use(VueGoodTablePlugin)
app.use(vClickOutside)
app.use(PrimeVue)

app.component('PrimeButton', Button)

app.mount('#app')
