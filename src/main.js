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
import 'primeicons/primeicons.css'

import LogoMachi from './components/LogoMachi.vue'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Toolbar from 'primevue/toolbar'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'

const app = createApp(App)
app.component('LogoMachi', LogoMachi)

app.use(createPinia())
app.use(VueSweetalert2)
app.use(VueGoodTablePlugin)
app.use(vClickOutside)
app.use(PrimeVue)
app.use(router)

app.use(DialogService)
app.use(ToastService);

app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('InputText', InputText)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('Row', Row)
app.component('Dialog', Dialog)
app.component('Dropdown', Dropdown)
app.component('InputNumber', InputNumber)
app.component('RadioButton', RadioButton)
app.component('Textarea', Textarea)
app.component('FileUpload', FileUpload)
app.component('Toolbar', Toolbar)
app.component('Rating', Rating)
app.component('Tag', Tag)


app.mount('#app')
