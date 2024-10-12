<!-- src/components/Home.vue -->
<template>
  <div class="page">
    <h1>Balances</h1>
    <div class="pie-charts-container">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
//import { fetchMachi } from '../js/server/fetchFromServer.js';

// Define the interface for the Balance object
interface Balance {
  platform: string;
  amount: number;
  currency: string;
}

// State variables
const loaded = ref(false);
const balances = ref<Balance[]>([]);

// Method to fetch home data
const getHomeData = async () => {
  try {
    console.log('Fetching home data...');
    //balances.value = await fetchMachi(); // Assuming fetchMachi() returns a Promise<Balance[]>
    loaded.value = true;
    console.log('Home data:', balances.value);
  } catch (error) {
    console.error('An error occurred while retrieving data:', error);
  }
};

// Fetch data on component mount
onMounted(async () => {
  console.log('Mounted component, fetching data...');
  await getHomeData();
});
</script>

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