<!-- src/components/PlatformSelector.vue -->
<template>
    <div class="platform-selector">
      <Button
        v-for="platform in platformOptions"
        :key="platform.id"
        :label="platform.name"
        :class="['platform-button', { selected: selectedPlatforms.includes(platform.id) }]"
        @click="togglePlatform(platform.id)"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  
  // Define props to receive initial selected platforms from the parent
  const props = defineProps({
    initialSelectedPlatforms: {
      type: Array,
      default: () => ['binance', 'kucoin', 'htx', 'okx', 'gateio'] // Default selection: all platforms
    }
  })
  
  // Emit an event to communicate the selected platforms to the parent
  const emit = defineEmits(['update:selectedPlatforms'])
  
  const platformOptions = computed(() => [
    { id: 'binance', name: 'Binance' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'htx', name: 'HTX' },
    { id: 'okx', name: 'OKX' },
    { id: 'gateio', name: 'Gate.io' }
  ])
  
  // Initialize selected platforms with the prop value
  const selectedPlatforms = ref([...props.initialSelectedPlatforms])
  
  function togglePlatform(platformId) {
    if (selectedPlatforms.value.includes(platformId)) {
      selectedPlatforms.value = selectedPlatforms.value.filter(id => id !== platformId)
    } else {
      selectedPlatforms.value.push(platformId)
    }
    // Emit the updated selected platforms to the parent
    emit('update:selectedPlatforms', selectedPlatforms.value)
  }
  
  // Watch for changes in props to reactively update the selection
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
  