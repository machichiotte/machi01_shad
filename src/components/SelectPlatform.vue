<template>
  <!-- Using a select dropdown to choose a platform -->
  <select v-model="selectedPlatform" @change="$emit('change', selectedPlatform)">
    <option value="">Select a platform</option>
    <!-- Looping through options to populate the dropdown -->
    <option v-for="platform in options" :key="platform.value" :value="platform.value">
      {{ platform.label }}
    </option>
  </select>
</template>

<script setup>
// Importing necessary functions from Vue
import { ref, defineProps } from 'vue';

// Props declaration
const props = defineProps({
  options: {
    type: Array,
    required: true
  }
});

// Declaring a reactive variable using ref for selectedPlatform
const selectedPlatform = ref('');
</script>
