// src/store/modules/auth/index.js

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

export default {
    namespaced: true,
    state() {
        return {
            token: '',
            email: '',
            userId: '',
            token: '',
            expiresIn: 0,
            autoLogout: false,
        };
    },
    mutations,
    getters,
    actions,
};
