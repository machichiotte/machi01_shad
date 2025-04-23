<!-- src/components/machi/PlatformSelector.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Définition des types pour les options de plateforme
interface PlatformOption {
  id: string;
  name: string;
}

// Définition des props avec types
const props = defineProps<{
  initialSelectedPlatforms: string[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedPlatforms', selectedPlatforms: string[]): void;
}>();

// Options de plateforme
const platformOptions = computed<PlatformOption[]>(() => [
  { id: 'binance', name: 'Binance' },
  { id: 'kucoin', name: 'KuCoin' },
  { id: 'htx', name: 'HTX' },
  { id: 'okx', name: 'OKX' },
  { id: 'gateio', name: 'Gate.io' }
]);

// Sélection des plateformes
const selectedPlatforms = ref<string[]>([...props.initialSelectedPlatforms]);

// Fonction pour basculer la sélection d'une plateforme
function togglePlatform(platformId: string): void {
  if (selectedPlatforms.value.includes(platformId)) {
    selectedPlatforms.value = selectedPlatforms.value.filter(id => id !== platformId);
  } else {
    selectedPlatforms.value.push(platformId);
  }
  emit('update:selectedPlatforms', selectedPlatforms.value);
}

// Surveiller les changements dans les plateformes sélectionnées
watch(
  () => props.initialSelectedPlatforms,
  (newVal) => {
    selectedPlatforms.value = [...newVal];
  }
);
</script>

<template>
  <div class="platform-selector">
    <Button v-for="platform in platformOptions" :key="platform.id" :label="platform.name"
      :class="['platform-button', { selected: selectedPlatforms.includes(platform.id) }]"
      @click="togglePlatform(platform.id)" />
  </div>
</template>

<style scoped>
.platform-selector {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.platform-button {
  margin: 0 0.2rem;
  flex: 0 0 auto;
}

.platform-button.selected {
  border: 1px solid #ccc;
  background-color: #ddd;
  color: #333;
}
</style>