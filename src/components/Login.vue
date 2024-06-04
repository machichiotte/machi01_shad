<!-- src/components/Login.vue -->
<template>
    <div class="row">
        <div class="col-md-6 offset-md-3">
            <div>
                <div>
                    <h3>Login</h3>
                    <hr />
                </div>
                <div class="alert alert-danger" v-if="error">
                    {{ error }}
                </div>
                <form @submit.prevent="onLogin()">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="text" class="form-control" v-model.trim="email" />
                        <div class="error" v-if="errors.email">
                            {{ errors.email }}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" class="form-control" v-model.trim="password" />
                        <div class="error" v-if="errors.password">
                            {{ errors.password }}
                        </div>
                    </div>

                    <div class="my-3">
                        <button type="submit" class="btn btn-primary">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import SignupValidations from '../services/SignupValidations';
import {
    IS_USER_AUTHENTICATE_GETTER,
    LOADING_SPINNER_SHOW_MUTATION,
    LOGIN_ACTION,
} from '../store/storeconstants';

const store = useStore();

const email = ref('');
const password = ref('');
const errors = ref([]);
const error = ref('');

const onLogin = async () => {
    let validations = new SignupValidations(email.value, password.value);

    errors.value = validations.checkValidations();
    if (errors.value.length) {
        return false;
    }
    error.value = '';

    store.commit(LOADING_SPINNER_SHOW_MUTATION, true);

    try {
        await store.dispatch(LOGIN_ACTION, {
            email: email.value,
            password: password.value,
        });

        if (store.getters[IS_USER_AUTHENTICATE_GETTER]) {
            store.commit(LOADING_SPINNER_SHOW_MUTATION, false);
            router.push('/shad'); // Assurez-vous d'importer router et de l'utiliser ici
        }
    } catch (e) {
        error.value = e;
        store.commit(LOADING_SPINNER_SHOW_MUTATION, false);
    }
};
</script>
