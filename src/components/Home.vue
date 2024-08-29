<!-- src/components/HomePage.vue -->
<template>
  <div class="page">
    <h1>Balances</h1>
    <div class="pie-charts-container">
      <div v-for="(balances, platform) in groupedBalances" :key="platform">
        <PieChart v-if="loaded && balances.length" :platform="platform" :balances="balances"
          style="width: 300px; height: 300px;" />
      </div>
    </div>
  </div>
</template>

<script>
import PieChart from "@/components/PieChart.vue";
import { getShad } from '../js/fetchFromServer.js';

export default {
  name: "HomePage",
  data() {
    return {
      loaded: false, // Suivre si les données ont été chargées
      balances: []
    };
  },
  methods: {
    async getHomeData() {
      try {
        console.log('Fetching home data...');
        this.balances = await getShad(); // Appel à la fonction getShad pour récupérer les données
        this.loaded = true; // Marquer les données comme chargées
        console.log('Home data:', this.balances);
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error);
      }
    },
  },
  async mounted() {
    try {
      console.log('Mounted component, fetching data...');
      await this.getHomeData();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error);
    }
  },
  computed: {
    groupedBalances() {
      const groups = this.balances.reduce((groups, balance) => {
        groups[balance.platform] = (groups[balance.platform] || []).concat(balance);
        return groups;
      }, {});
      console.log('Grouped balances:', groups);
      return groups;
    },
  },
  components: {
    PieChart,
  },
};
</script>

<style scoped>
.pie-charts-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
}

.pie-chart {
  width: 400px;
  height: 400px;
  margin: 10px;
}
</style>