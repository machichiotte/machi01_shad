// src/components/Config.vue
<script>
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
      PLATFORMS: ['kucoin', 'htx', 'binance', 'okx', 'gateio']
    };
  },
  computed: {
    isPassphraseRequired() {
      return this.payload.platform === 'kucoin' || this.payload.platform === 'htx';
    }
  },
  methods: {
    submitConfig() {
      // Logique pour envoyer les données au serveur
      console.log(this.payload);
      // Ici, vous pouvez utiliser axios ou fetch pour envoyer les données
    }
  }
};
</script>

<template>
  <div>
    <h1>Configuration</h1>
    <form @submit.prevent="submitConfig">
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
