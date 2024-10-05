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
<script>
import SignupValidations from '../services/SignupValidations';
import { useAuthStore } from '../store/authStore';

export default {
    data() {
        return {
            email: '',
            password: '',
            errors: [],
            error: '',
        };
    },
    beforeRouteLeave() {
        console.log('route leaving');
        console.log(this.$pinia);
    },
    beforeRouteEnter(_, _1, next) {
        next((vm) => {
            console.log('route entering');
            console.log(vm.$pinia.state.auth);
        });
    },
    methods: {
        /**
         * @returns {Promise<void>}
         */
        async onSignup() {
            let validations = new SignupValidations(
                this.email,
                this.password,
            );

            this.errors = validations.checkValidations();
            if (this.errors.length) {
                return false;
            }
            this.error = '';

            const authStore = useAuthStore();

            authStore.showLoading(true);
            try {
                const isSigned = await authStore.signup({
                    email: this.email,
                    password: this.password,
                });

                if (isSigned) {
                    authStore.showLoading(false);
                    this.$router.push('/login');
                }

            } catch (error) {
                this.error = error;
                authStore.showLoading(false);
            }
        },
    },
};
</script>../store/authStore