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
import { ref } from 'vue';;
import { useAuthStore } from '../store/authStore';
import SignupValidations from '../services/SignupValidations';

const authStore = useAuthStore();
const loadingStore = useLoadingStore();

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

    loadingStore.setLoading(true);

    try {
        await authStore.login({
            email: email.value,
            password: password.value,
        });

        if (authStore.isAuthenticated) {
            loadingStore.setLoading(false);
            router.push('/shad'); // Make sure to import router and use it here
        }
    } catch (e) {
        error.value = e;
        loadingStore.setLoading(false);
    }
};
</script>
../store/authStore