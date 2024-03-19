// src/store/modules/calcul/index.js

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export default {
    namespaced: true,
    state() {
        return {
            balances: [],
            trades: [],
            strats: [],
            orders: [],
            cmc: [],
            buyOrders: [],
            sellOrders: [],
        };
    },
    mutations,
    getters,
    actions,
};
