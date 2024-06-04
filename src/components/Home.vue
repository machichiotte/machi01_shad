<!-- src/components/HomePage.vue -->
<template>
  <div class="page">
    <h1>Balances</h1>
    <div class="pie-charts-container">
      <div v-for="(balances, platform) in this.groupedBalances" :key="platform">
        <PieChart v-if="loaded && balances && platform" :platform="platform" :balances="balances"
          style="width: 300px; height: 300px;" />
      </div>
    </div>
  </div>
</template>

<script>
import PieChart from "@/components/PieChart.vue";
import { getBalances, getCmc, getTickers } from '../js/getter.js';

export default {
  name: "HomePage",
  data() {
    return {
      loaded: false, // Ajoutez une propriété pour suivre si les données ont été chargées
      balances: [],
      cmc: [],
      tickers: null
    };
  },
  methods: {
    async getHomeData() {
      try {
        console.log('on entre ici');
        this.tickers = await getTickers();
        console.log('on devrait avoir les tickers ici');
        console.log('this.tickers', this.tickers);

        this.cmc = await getCmc();
        this.balances = await getBalances();
        this.loaded = true; // Mettez à jour la propriété loaded une fois que les données sont chargées
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error);
      }
    },
    calculateBalanceValue(balance) {
      console.log('balance', balance);
      console.log('tickers', this.tickers);
        if (this.tickers && this.tickers[balance.platform]) {
          console.log('enter in tickers');
          const tic = this.tickers[balance.platform];
          const tick = tic.find(tick => tick.symbol === balance.symbol);

          const value = (parseFloat(balance.balance) * parseFloat(tick.last)).toFixed(2);

          return {
            ...balance,
            value: value,
          };
        } else {
          //return 0; // Si les données de CMC ne sont pas disponibles, renvoyer la balance telle quelle
          return {
            ...balance,
            value: 0,
          };
        }
    },
  },
  async mounted() {
    try {
      await this.getHomeData();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error);
    }
  },
  computed: {
    groupedBalances() {
      return this.balances.reduce((groups, balance) => {
        groups[balance.platform] = (groups[balance.platform] || []).concat(this.calculateBalanceValue(balance));
        return groups;
      }, {});
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
  /* Ajustez selon vos préférences */
  align-items: center;
  /* Ajustez selon vos préférences */
  flex-wrap: wrap;
  /* Pour passer à la ligne si l'espace est insuffisant */
}

.pie-chart {
  width: 400px;
  /* Ajustez la largeur selon vos préférences */
  height: 400px;
  /* Ajustez la hauteur selon vos préférences */
  margin: 10px;
  /* Ajustez la marge selon vos préférences */
}
</style>
