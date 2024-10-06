<!-- src/components/SelectPlatform.vue -->
<template>
  <select v-model="selectedPlatform" @change="$emit('change', selectedPlatform)">
    <option value="">Select a platform</option>
    <option v-for="platform in options" :key="platform.value" :value="platform.value">
      {{ platform.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true
  }
});

const selectedPlatform = ref<string>('');
</script>
