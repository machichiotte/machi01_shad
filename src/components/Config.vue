// src/components/Config.vue
<script>
import { updateKey } from '../js/server/config';
import { PLATFORMS } from '../types/platform';

export default {
  data() {
    return {
      payload: {
        type: 'cmc',
        apiKey: '',
        platform: '',
        secretKey: '',
        passphrase: ''
      },
      PLATFORMS: PLATFORMS
    };
  },
  computed: {
    isPassphraseRequired() {
      return this.payload.platform === 'kucoin' || this.payload.platform === 'htx';
    }
  },
  methods: {
    async sendKeyToServer() {
      const payload = {
        type: this.payload.type,
        platform: this.payload.platform,
        apiKey: this.payload.apiKey,
        secretKey: this.payload.secretKey,
        passphrase: this.payload.passphrase
      }; 

      try {
        const response = await updateKey(payload);
        alert(response.message);
      } catch (error) {
        console.error('Error updating API key:', error);
        alert('An error occurred while updating the API key: ' + error.message);
      }
    }
  }
};
</script>

<template>
  <div>
    <h1>Configuration</h1>
    <form @submit.prevent="sendKeyToServer">
      <div>
        <label for="type">Type:</label>
        <select v-model="payload.type">
          <option value="cmc">CMC</option>
          <option value="platform">Platform</option>
        </select>
      </div>
      <div v-if="payload.type === 'cmc'">
        <label for="apiKey">API Key:</label>
        <input type="text" v-model="payload.apiKey" required />
      </div>
      <div v-if="payload.type === 'platform'">
        <label for="platform">Platform:</label>
        <select v-model="payload.platform">
          <option v-for="platform in PLATFORMS" :key="platform" :value="platform">{{ platform }}</option>
        </select>
        <label for="apiKey">API Key:</label>
        <input type="text" v-model="payload.apiKey" required />
        <label for="secretKey">Secret Key:</label>
        <input type="text" v-model="payload.secretKey" required />
        <div v-if="isPassphraseRequired">
          <label for="passphrase">Passphrase:</label>
          <input type="text" id="passphrase" v-model="payload.passphrase" required />
        </div>
      </div>
      <button type="submit">Envoyer</button>
    </form>
  </div>
</template>
