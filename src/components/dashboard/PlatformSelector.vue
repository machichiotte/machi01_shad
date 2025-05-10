<!-- src/components/dashboard/PlatformSelector.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface PlatformOption {
  id: string;
  name: string;
}

const props = defineProps<{
  initialSelectedPlatforms: string[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedPlatforms', selectedPlatforms: string[]): void;
}>();

const platformOptions = computed<PlatformOption[]>(() => [
  { id: 'binance', name: 'Binance' },
  { id: 'kucoin', name: 'KuCoin' },
  { id: 'htx', name: 'HTX' },
  { id: 'okx', name: 'OKX' },
  { id: 'gateio', name: 'Gate.io' }
]);

const selectedPlatforms = ref<string[]>([...props.initialSelectedPlatforms]);

watch(
  () => props.initialSelectedPlatforms,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(selectedPlatforms.value)) {
      selectedPlatforms.value = [...newVal];
    }
  },
  { deep: true }
);

watch(selectedPlatforms, (newSelection) => {
  emit('update:selectedPlatforms', newSelection);
});

function togglePlatform(id: string) {
  const index = selectedPlatforms.value.indexOf(id);
  if (index === -1) {
    selectedPlatforms.value.push(id);
  } else {
    selectedPlatforms.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="platform-selector">
    <button
      v-for="platform in platformOptions"
      :key="platform.id"
      :class="['platform-button', { active: selectedPlatforms.includes(platform.id) }]"
      @click="() => togglePlatform(platform.id)"
    >
      {{ platform.name }}
    </button>
  </div>
</template>

<style scoped>
.platform-selector {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.platform-button {
  margin: 0 0.3rem;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  background-color: #eee;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;
  transition: background-color 0.2s;
}

.platform-button:hover {
  background-color: #ddd;
}

.platform-button.active {
  background-color: var(--primary-color, #007bff);
  color: white;
}
</style>
