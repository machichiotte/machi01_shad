// src/store/store.js
import { createStore } from 'vuex';
import { LOADING_SPINNER_SHOW_MUTATION } from './storeconstants';

import auth from './modules/auth/index';
import calcul from './modules/calcul/index';

const store = createStore({
    modules: {
        auth,
        calcul
    },
    state() {
        return {
            showLoading: false,
        };
    },
    mutations: {
        [LOADING_SPINNER_SHOW_MUTATION](state, payload) {
            state.showLoading = payload;
        },
    },
});

export default store;