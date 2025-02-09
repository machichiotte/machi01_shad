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
  <div class="config-container">
    <h1>Configuration</h1>

    <div class="config-section">
      <h2>Configuration CoinMarketCap</h2>
      <form @submit.prevent="payload.type = 'cmc'; sendKeyToServer()">
        <div class="form-group">
          <label for="cmcApiKey">Clé API CoinMarketCap:</label>
          <input type="text" id="cmcApiKey" v-model="payload.apiKey" required placeholder="Entrez votre clé API CMC" />
        </div>
        <button type="submit">Mettre à jour la clé CMC</button>
      </form>
    </div>

    <div class="config-section">
      <h2>Configuration Plateforme d'Échange</h2>
      <form @submit.prevent="payload.type = 'platform'; sendKeyToServer()">
        <div class="form-group">
          <label for="platform">Plateforme:</label>
          <select id="platform" v-model="payload.platform" required>
            <option value="" disabled selected>Sélectionnez une plateforme</option>
            <option v-for="platform in PLATFORMS" :key="platform" :value="platform">
              {{ platform }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="platformApiKey">Clé API:</label>
          <input type="text" id="platformApiKey" v-model="payload.apiKey" required placeholder="Entrez votre clé API" />
        </div>
        <div class="form-group">
          <label for="secretKey">Clé Secrète:</label>
          <input type="text" id="secretKey" v-model="payload.secretKey" required
            placeholder="Entrez votre clé secrète" />
        </div>
        <div v-if="isPassphraseRequired" class="form-group">
          <label for="passphrase">Passphrase:</label>
          <input type="text" id="passphrase" v-model="payload.passphrase" required
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
