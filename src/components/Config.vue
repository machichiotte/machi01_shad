// src/components/Config.vue
<script>
import { updateKey } from '../js/server/config';
import { PLATFORMS } from '../types/platform';

export default {
  data() {
    return {
      payloadCMC: {
        type: 'cmc',
        apiKey: ''
      },
      payloadPlatform: {
        type: 'platform',
        platform: '',
        apiKey: '',
        secretKey: '',
        passphrase: ''
      },
      PLATFORMS: PLATFORMS
    };
  },
  computed: {
    isPassphraseRequired() {
      return this.payloadPlatform.platform === 'kucoin' || this.payloadPlatform.platform === 'htx';
    }
  },
  methods: {
    async sendKeyToServer(payload) {
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
  <div class="config-container">
    <h1>Configuration</h1>

    <!-- Configuration CoinMarketCap -->
    <div class="config-section">
      <h2>Configuration CoinMarketCap</h2>
      <form @submit.prevent="sendKeyToServer(payloadCMC)">
        <div class="form-group">
          <label for="cmcApiKey">Clé API CoinMarketCap:</label>
          <input type="text" id="cmcApiKey" v-model="payloadCMC.apiKey" required
            placeholder="Entrez votre clé API CMC" />
        </div>
        <button type="submit">Mettre à jour la clé CMC</button>
      </form>
    </div>

    <!-- Configuration Plateforme d'Échange -->
    <div class="config-section">
      <h2>Configuration Plateforme d'Échange</h2>
      <form @submit.prevent="sendKeyToServer(payloadPlatform)">
        <div class="form-group">
          <label for="platform">Plateforme:</label>
          <select id="platform" v-model="payloadPlatform.platform" required>
            <option value="" disabled selected>Sélectionnez une plateforme</option>
            <option v-for="platform in PLATFORMS" :key="platform" :value="platform">
              {{ platform }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="platformApiKey">Clé API:</label>
          <input type="text" id="platformApiKey" v-model="payloadPlatform.apiKey" required
            placeholder="Entrez votre clé API" />
        </div>
        <div class="form-group">
          <label for="secretKey">Clé Secrète:</label>
          <input type="text" id="secretKey" v-model="payloadPlatform.secretKey" required
            placeholder="Entrez votre clé secrète" />
        </div>
        <div v-if="isPassphraseRequired" class="form-group">
          <label for="passphrase">Passphrase:</label>
          <input type="text" id="passphrase" v-model="payloadPlatform.passphrase" required
            placeholder="Entrez votre passphrase" />
        </div>
        <button type="submit">Mettre à jour la configuration plateforme</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.config-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 15px;
}

.config-section {
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 15px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  background-color: #333;
}

h1 {
  text-align: center;
  margin-bottom: 15px;
}

h2 {
  margin-bottom: 8px;
  font-size: 1.2em;
}

.form-group {
  margin-bottom: 4px;
}

label {
  display: block;
  margin: 0;
  padding: 0;
  margin-bottom: 1px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 6px;
  color: #ccc;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #333;
}

button {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 6px;
}

button:hover {
  background-color: #007bff;
}
</style>
