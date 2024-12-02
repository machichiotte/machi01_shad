// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'

import LogoMachi from './components/LogoMachi.vue'

import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import DialogService from 'primevue/dialogservice'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import FloatLabel from 'primevue/floatlabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import MultiSelect from 'primevue/multiselect'
import ProgressBar from 'primevue/progressbar'
import RadioButton from 'primevue/radiobutton'
import Rating from 'primevue/rating'
import Row from 'primevue/row'
import Select from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import ToastService from 'primevue/toastservice'
import ToggleButton from 'primevue/togglebutton'
import Toolbar from 'primevue/toolbar'
import Tooltip from 'primevue/tooltip';


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
app.component('Calendar', Calendar)
app.component('Card', Card)
app.component('Checkbox', Checkbox)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('DataTable', DataTable)
app.component('Dialog', Dialog)
app.component('Dropdown', Dropdown)
app.component('FileUpload', FileUpload)
app.component('FloatLabel', FloatLabel)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('InputNumber', InputNumber)
app.component('InputText', InputText)
app.component('Menubar', Menubar)
app.component('MultiSelect', MultiSelect)
app.component('ProgressBar', ProgressBar)
app.component('RadioButton', RadioButton)
app.component('Rating', Rating)
app.component('Row', Row)
app.component('Select', Select)
app.component('SelectButton', SelectButton)
app.component('Tag', Tag)
app.component('Textarea', Textarea)
app.component('ToggleButton', ToggleButton)
app.component('Toolbar', Toolbar)

app.directive('tooltip', Tooltip)

app.mount('#app')