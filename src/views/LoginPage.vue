<template>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        v-model="username"
        label="Username"
        filled
        :rules="[(val) => !!val || 'Username is required']"
      />
      <q-input
        v-model="password"
        label="Password"
        filled
        type="password"
        :rules="[(val) => !!val || 'Password is required']"
      />
      <div>
        <q-btn label="Login" type="submit" color="primary" />
      </div>
    </q-form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api, setAuthToken } from '../boot/axios';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();

    const onSubmit = async () => {
      try {
        const response = await api.post('/auth/login', {
          username: username.value,
          password: password.value,
        });

        const token = response.data.token;
        if (!token) {
          throw new Error('未收到 token，請檢查 API 回應');
        }

        // 將 token 儲存到記憶體中
        setAuthToken(token);
        router.push('/orders');
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials.');
      }
    };

    return { username, password, onSubmit };
  },
};
</script>
