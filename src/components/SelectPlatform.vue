<template>
    <select :v-model="selectedPlatform" @change="$emit('change', selectedPlatform)">
      <option value="">Select a platform</option>
      <option v-for="platform in options" :key="platform.value" :value="platform.value">{{ platform.label }}</option>
    </select>
  </template>
  
  <script>
  export default {
    props: {
      options: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        selectedPlatform: "",
      };
    },
  };
  </script>