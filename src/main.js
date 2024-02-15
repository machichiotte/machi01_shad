// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/index';

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import VueGoodTablePlugin from 'vue-good-table-next';
import 'vue-good-table-next/dist/vue-good-table-next.css'

import vClickOutside from 'v-click-outside'

import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/aura-light-green/theme.css'

import Button from "primevue/button"
import DataTable from "primevue/datatable"

const app = createApp(App);
app.component('logoMachi', {
    template: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" width="300" height="150" viewBox="250 250 500 500">
    <g transform="matrix(0.7,0,0,0.7,149.5757635564118,375.3727490229102)">
      <svg viewBox="0 0 396 141" data-background-color="#ffffff" preserveAspectRatio="xMidYMid meet" height="356" width="1000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="tight-bounds" transform="matrix(1,0,0,1,0.2399966921794885,0.015418891531538748)">
          <svg viewBox="0 0 395.52 140.96916221693695" height="140.96916221693695" width="395.52">
            <g>
              <svg viewBox="0 0 395.52 140.96916221693695" height="140.96916221693695" width="395.52">
                <g transform="matrix(1,0,0,1,0,87.12459765237239)">
                  <svg viewBox="0 0 395.52 53.844564564564564" height="53.844564564564564" width="395.52">
                    <g id="textblocktransform">
                      <svg viewBox="0 0 395.52 53.844564564564564" height="53.844564564564564" width="395.52" id="textblock">
                        <g>
                          <svg viewBox="0 0 395.52 53.844564564564564" height="53.844564564564564" width="395.52">
                            <g transform="matrix(1,0,0,1,0,0)">
                              <svg width="395.52" viewBox="2.450000047683716 -33.5 249.72999572753906 34" height="53.844564564564564" data-palette-color="#034f74">
                                <path 
                                d="M14.1 0L2.45 0 2.45-0.8 6.6-2.85 7.65-30.15 3.3-32.2 3.3-33 14.4-33 25.05-8.3 35.65-33 46.3-33 46.3-32.2 42.05-30.5 42.9-2.85 46.55-0.8 46.55 0 32.9 0 32.9-0.8 36.8-2.8 36.3-26.9 24.7 0.25 22.1 0.25 10.5-26.65 9.85-2.8 14.1-0.8 14.1 0ZM61.05 0L50.25 0 50.25-0.8 53.35-2.5 66.3-33.25 69.8-33.25 82.6-2.6 86-0.8 86 0 71.6 0 71.6-0.8 75.95-2.55 72.4-11.25 60.4-11.25 56.9-2.55 61.05-0.8 61.05 0ZM66.4-25.95L61.55-14 71.25-14 66.4-25.95ZM107.15 0.5L107.15 0.5Q101.95 0.5 98.12-1.6 94.3-3.7 92.2-7.38 90.1-11.05 90.1-15.7L90.1-15.7Q90.1-19.35 91.55-22.58 93-25.8 95.5-28.25 98-30.7 101.2-32.1 104.4-33.5 107.95-33.5L107.95-33.5Q110.5-33.5 112.27-33.18 114.05-32.85 115.42-32.33 116.8-31.8 118.2-31.1L118.2-31.1 118.65-22 117.75-22 113.75-29Q112.2-30.05 110.95-30.53 109.7-31 108.05-31L108.05-31Q104.8-31 102.2-29.2 99.6-27.4 98.1-24.15 96.6-20.9 96.6-16.65L96.6-16.65Q96.6-12.1 98.05-8.85 99.5-5.6 101.97-3.85 104.45-2.1 107.5-2.1L107.5-2.1Q109.75-2.1 111.37-2.7 113-3.3 114.4-4.15L114.4-4.15 118.25-10.3 119.1-10.3 118.45-2.05Q116.35-0.9 113.67-0.2 111 0.5 107.15 0.5ZM140.04 0L125.64 0 125.64-0.8 129.84-2.85 129.84-30.15 125.64-32.2 125.64-33 140.04-33 140.04-32.2 136.09-30.15 136.09-18.4 151.24-18.4 151.24-30.15 147.29-32.2 147.29-33 161.64-33 161.64-32.2 157.54-30.15 157.54-2.85 161.64-0.8 161.64 0 147.29 0 147.29-0.8 151.24-2.85 151.24-15.65 136.09-15.65 136.09-2.85 140.04-0.8 140.04 0ZM181.69 0L167.09 0 167.09-0.8 171.24-2.85 171.24-30.15 167.09-32.2 167.09-33 181.69-33 181.69-32.2 177.54-30.15 177.54-2.85 181.69-0.8 181.69 0ZM200.64-11.1L186.89-11.1 186.89-14.6 200.64-14.6 200.64-11.1ZM216.44 0.5L216.44 0.5Q212.74 0.5 210.09-1.55 207.44-3.6 206.06-7.43 204.69-11.25 204.69-16.5L204.69-16.5Q204.69-21.4 206.19-25.23 207.69-29.05 210.31-31.28 212.94-33.5 216.44-33.5L216.44-33.5Q220.14-33.5 222.79-31.45 225.44-29.4 226.81-25.58 228.19-21.75 228.19-16.5L228.19-16.5Q228.19-11.6 226.69-7.78 225.19-3.95 222.54-1.73 219.89 0.5 216.44 0.5ZM217.34-1.9L217.34-1.9Q218.79-1.9 219.76-3.6 220.74-5.3 221.24-8.25 221.74-11.2 221.74-14.95L221.74-14.95Q221.74-19.6 221.09-23.28 220.44-26.95 219.11-29.05 217.79-31.15 215.69-31.15L215.69-31.15Q214.24-31.15 213.21-29.5 212.19-27.85 211.66-24.93 211.14-22 211.14-18.15L211.14-18.15Q211.14-13.45 211.79-9.78 212.44-6.1 213.81-4 215.19-1.9 217.34-1.9ZM252.18 0L237.33 0 237.33-0.8 241.98-2.65 241.98-27.6 233.48-23.6 233.48-25.5 245.78-33 248.03-33 248.03-2.65 252.18-0.8 252.18 0Z" opacity="1" transform="matrix(1,0,0,1,0,0)" 
                                :fill="color" 
                                class="wordmark-text-0" 
                                data-fill-palette-color="primary" 
                                id="text-0">
                                </path>
                              </svg>
                            </g>
                          </svg>
                        </g>
                      </svg>
                    </g>
                  </svg>
                </g>
                <g transform="matrix(1,0,0,1,160.9701860802841,0)">
                  <svg viewBox="0 0 73.5796278394318 74.41318822822824" height="74.41318822822824" width="73.5796278394318">
                    <g>
                      <svg version="1.1" x="7.9999999999999964" y="0" viewBox="12.982999801635742 1 75.68599700927734 97.81300354003906" enable-background="new 0 0 100 100" xml:space="preserve" height="74.41318822822824" width="57.5796278394318" class="icon-icon-0" data-fill-palette-color="accent" id="icon-0">
                        <g :fill="color" data-fill-palette-color="accent">
                          <polygon fill-rule="evenodd" clip-rule="evenodd" points="12.983,10.59 30.001,98.813 24.129,39.764 53.15,37.872 53.096,27.989    64.549,1 53.622,18.977  " :fill="color" data-fill-palette-color="accent"></polygon>
                          <polygon fill-rule="evenodd" clip-rule="evenodd" points="59.389,54.548 64.549,1.007 55.809,40.723 36.197,41.768 37.767,62.23    30.001,98.813 42.058,58.914  " :fill="color" data-fill-palette-color="accent"></polygon>
                          <polygon fill-rule="evenodd" clip-rule="evenodd" points="62.8,67.182 63.349,56.729 47.37,60.484 47.338,72.281 30.001,98.813    51.681,71.197  " :fill="color" data-fill-palette-color="accent"></polygon>
                          <polygon fill-rule="evenodd" clip-rule="evenodd" points="65.711,62.394 80.552,57.663 82.061,45.131 66.162,47.226  " :fill="color" data-fill-palette-color="accent"></polygon>
                          <polygon fill-rule="evenodd" clip-rule="evenodd" points="72.07,44.502 83.058,43.085 84.639,32.807 76.56,32.434 64.549,1    72.979,31.967  " :fill="color" data-fill-palette-color="accent"></polygon>
                          <polygon fill-rule="evenodd" clip-rule="evenodd" points="87.413,31.294 88.669,21.788 79.125,19.094 64.549,1 79.032,23.437    78.61,30.437  " :fill="color" data-fill-palette-color="accent"></polygon>
                        </g>
                      </svg>
                    </g>
                  </svg>
                </g>
                <g>
                  <rect width="160.9701860802841" height="4.855758400023063" y="68.55742982820517" x="234.5498139197159" :fill="color" data-fill-palette-color="accent"></rect>
                  <rect width="160.9701860802841" height="4.855758400023063" y="68.55742982820517" x="0" :fill="color" data-fill-palette-color="accent"></rect>
                  <rect width="160.9701860802841" height="4.855758400023063" y="58.845913028159046" x="234.5498139197159" :fill="color" data-fill-palette-color="accent"></rect>
                  <rect width="160.9701860802841" height="4.855758400023063" y="58.845913028159046" x="0" :fill="color" data-fill-palette-color="accent"></rect>
                </g>
              </svg>
            </g>
            <defs></defs>
          </svg>
          <rect width="395.52" height="140.96916221693695" fill="none" stroke="none" visibility="hidden"></rect>
        </g>
      </svg>
    </g>
  </svg>`,
    props: ['color']
  })
app.use(router)
app.use(VueSweetalert2)
app.use(VueGoodTablePlugin)
app.use(vClickOutside)
app.use(PrimeVue);

app.component('PrimeButton', Button);
app.component('PrimeButton', DataTable);

app.mount('#app')