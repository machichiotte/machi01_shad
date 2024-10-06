<!-- src/components/shad/PlatformSelector.vue -->
<template>
  <div class="platform-selector">
    <Button v-for="platform in platformOptions" :key="platform.id" :label="platform.name"
      :class="['platform-button', { selected: selectedPlatforms.includes(platform.id) }]"
      @click="togglePlatform(platform.id)" />
  </div>
</template>

<script setup lang="ts">
/**
 * @component PlatformSelector
 * @props {Array<string>} initialSelectedPlatforms
 * @emits {Array<string>} update:selectedPlatforms
 */

import { ref, computed, watch } from 'vue'

const props = defineProps<{
  initialSelectedPlatforms: string[]
}>({
  initialSelectedPlatforms: {
    type: Array,
    default: () => ['binance', 'kucoin', 'htx', 'okx', 'gateio']
  }
})

const emit = defineEmits<{
  (e: 'update:selectedPlatforms', platforms: string[]): void
}>()

const platformOptions = computed(() => [
  { id: 'binance', name: 'Binance' },
  { id: 'kucoin', name: 'KuCoin' },
  { id: 'htx', name: 'HTX' },
  { id: 'okx', name: 'OKX' },
  { id: 'gateio', name: 'Gate.io' }
])

const selectedPlatforms = ref<string[]>([...props.initialSelectedPlatforms])

/**
 * @param {string} platformId
 */
function togglePlatform(platformId: string) {
  if (selectedPlatforms.value.includes(platformId)) {
    selectedPlatforms.value = selectedPlatforms.value.filter(id => id !== platformId)
  } else {
    selectedPlatforms.value.push(platformId)
  }
  emit('update:selectedPlatforms', selectedPlatforms.value)
}

watch(
  () => props.initialSelectedPlatforms,
  (newVal) => {
    selectedPlatforms.value = [...newVal]
  }
)
</script>

<style scoped>
.platform-selector {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  background-color: red;

}

.platform-button {
  margin: 0 0.5rem;
  flex: 0 0 auto;
}

.platform-button.selected {
  background-color: blue;
  color: white;
}
</style>