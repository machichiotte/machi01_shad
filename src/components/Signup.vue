<!-- src/components/Signup.vue -->
<template>
    <div class="row">
        <div class="col-md-6 offset-md-3">
            <div>
                <div>
                    <h3>Sign up</h3>
                    <hr />
                </div>
                <div class="alert alert-danger" v-if="error">
                    {{ error }}
                </div>
                <form @submit.prevent="onSignup()">
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
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeRouteLeave, onBeforeRouteEnter } from 'vue';
import SignupValidations from '../services/SignupValidations';
import { useAuthStore } from '../store/authStore';

const email = ref('');
const password = ref('');
const errors = ref<string[]>([]);
const error = ref('');

onMounted(() => {
    console.log('Component is now mounted !');
});

onBeforeRouteLeave((to, from, next) => {
    console.log('route leaving');
    console.log(this.$pinia);
    next();
});

onBeforeRouteEnter((to, from, next) => {
    next((vm) => {
        console.log('route entering');
        console.log(vm.$pinia.state.auth);
    });
});

const onSignup = async () => {
    let validations = new SignupValidations(
        email.value,
        password.value,
    );

    errors.value = validations.checkValidations();
    if (errors.value.length) {
        return false;
    }
    error.value = '';

    const authStore = useAuthStore();

    authStore.showLoading(true);
    try {
        const isSigned = await authStore.signup({
            email: email.value,
            password: password.value,
        });

        if (isSigned) {
            authStore.showLoading(false);
            router.push('/login');
        }

    } catch (error) {
        error.value = error;
        authStore.showLoading(false);
    }
};
</script>