<!-- src/components/FetchFromServerSelector.vue -->
<template>
    <div class="fetch-from-server-selector">
      <!-- Add any additional controls or buttons related to fetching data here -->
      <Button label="Fetch Data" @click="fetchData" class="fetch-button" />
    </div>
  </template>
  
  <script setup>
  function fetchData() {
    // Placeholder function for fetching data from server
    console.log('Fetching data from server...')
  }
  </script>
  
  <style scoped>
  .fetch-from-server-selector {
    display: flex;
    align-items: center;
    margin: 1rem 0;
  }
  
  .fetch-button {
    margin: 0 0.5rem;
  }
  </style>
  