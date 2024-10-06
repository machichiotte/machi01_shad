<!-- src/components/Home.vue -->
<template>
  <div class="page">
    <h1>Balances</h1>
    <div class="pie-charts-container">
      <div v-for="(balances, platform) in groupedBalances" :key="platform">
        <PieChart v-if="loaded && balances.length" :platform="platform" :balances="balances" class="pie-chart" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import PieChart from "@/components/PieChart.vue";
import { fetchShad } from '../js/fetchFromServer';

export default {
  name: "HomePage",
  data() {
    return {
      loaded: false,
      balances: []
    };
  },
  methods: {
    /**
     * @async
     */
    async getHomeData() {
      try {
        console.log('Fetching home data...');
        this.balances = await fetchShad();
        this.loaded = true;
        console.log('Home data:', this.balances);
      } catch (error) {
        console.error("An error occurred while retrieving data:", error);
      }
    },
  },
  async mounted() {
    try {
      console.log('Mounted component, fetching data...');
      await this.getHomeData();
    } catch (error) {
      console.error("An error occurred while retrieving data:", error);
    }
  },
  computed: {
    /**
     * @returns {Object}
     */
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
  width: 300px;
  height: 300px;
}
</style>