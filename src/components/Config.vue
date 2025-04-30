<!-- src/components/Config.vue -->
<script setup lang="ts">

import { ref, computed } from 'vue';
import { updateKey } from '../server/config';
import { PLATFORMS } from '../types/platform';

// Déclaration réactive de l'objet pour la configuration CoinMarketCap
const payloadCMC = ref({
  type: 'cmc',
  apiKey: ''
});

const payloadGemini = ref({
  type: 'gemini',
  apiKey: ''
});

// Déclaration réactive de l'objet pour la configuration de la plateforme d'échange
const payloadPlatform = ref({
  type: 'platform',
  platform: '',
  apiKey: '',
  secretKey: '',
  passphrase: ''
});

// Liste des plateformes disponibles importée du module de types
const platforms = PLATFORMS;

// Propriété calculée pour déterminer si une passphrase est requise
const isPassphraseRequired = computed(() => {
  return payloadPlatform.value.platform === 'kucoin' || payloadPlatform.value.platform === 'htx';
});

// Fonction asynchrone pour envoyer la configuration au serveur
const sendKeyToServer = async (payload: any) => {
  try {
    const response = await updateKey(payload);
    alert(response.message);
  } catch (error: any) {
    console.error('Error updating API key:', error);
    alert('An error occurred while updating the API key: ' + error.message);
  }
};
</script>

<template>
  <div class="config-container">
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

    <div class="config-section">
      <h2>Configuration Google Gemini</h2>
      <form @submit.prevent="sendKeyToServer(payloadGemini)">
        <div class="form-group">
          <label for="geminiApiKey">Clé API Google Gemini:</label>
          <input type="text" id="geminiApiKey" v-model="payloadGemini.apiKey" required
            placeholder="Entrez votre clé API Gemini" />
        </div>
        <button type="submit">Mettre à jour la clé Gemini</button>
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
            <option v-for="platform in platforms" :key="platform" :value="platform">
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
  padding: 1rem;
}

.config-section {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: var(--card-dark-bg);
}

h2 {
  margin-bottom: 8px;
  font-size: 1.2em;
}

.form-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.form-group label {
  width: 180px;
  text-align: right;
  font-weight: bold;
}

.form-group input,
.form-group select {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--searchbar-border);
  background-color: var(--searchbar-bg);
  color: var(--searchbar-text);
}

button {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

</style>
