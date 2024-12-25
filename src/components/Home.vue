<!-- src/components/Home.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';

// State variables
const loaded = ref(false);

// Method to fetch home data
const getHomeData = async () => {
  try {
    loaded.value = true;
  } catch (error) {
    console.error('An error occurred while retrieving data:', error);
  }
};

// Fetch data on component mount
onMounted(async () => {
  console.info('Mounted component, fetching data...');
  await getHomeData();
});
</script>

<template>
  <div class="page">
    <h1>Balances</h1>
    <div class="pie-charts-container">
    </div>
  </div>
</template>

<style scoped>
.pie-charts-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.pie-chart {
  width: 300px;
  height: 300px;
}
</style>