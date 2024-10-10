// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '../src/router/index'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'

import LogoMachi from '@comp/LogoMachi.vue'

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
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import FileUpload from 'primevue/fileupload'
import Toolbar from 'primevue/toolbar'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'
import FloatLabel from 'primevue/floatlabel'
import Calendar from 'primevue/calendar'
import ToggleButton from 'primevue/togglebutton'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'

import './style.css'

const app = createApp(App)
app.component('LogoMachi', LogoMachi)

app.use(createPinia())
app.use(VueSweetalert2)
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
app.component('SelectButton', SelectButton)
app.component('Textarea', Textarea)
app.component('FileUpload', FileUpload)
app.component('Toolbar', Toolbar)
app.component('Rating', Rating)
app.component('Tag', Tag)
app.component('FloatLabel', FloatLabel)
app.component('Calendar', Calendar)
app.component('ToggleButton', ToggleButton)
app.component('MultiSelect', MultiSelect)
app.component('Checkbox', Checkbox)

app.mount('#app')