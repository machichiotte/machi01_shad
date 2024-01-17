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
import { getBalances, getCmcData, getTickers } from '../js/getter.js';

export default {
  name: "HomePage",
  data() {
    return {
      loaded: false, // Ajoutez une propriété pour suivre si les données ont été chargées
      balances: [],
      cmcData: [],
      tickers : null
    };
  },
  methods: {
    async getData() {
      try {
       // await fetch(`http://localhost:10000/api/tickers/update`)
        this.tickers = await getTickers();
        this.cmcData = await getCmcData();
        this.balances = await getBalances();
        this.loaded = true; // Mettez à jour la propriété loaded une fois que les données sont chargées
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error);
      }
    },
    calculateBalanceValue(balances) {
      console.log('balances',balances);
      console.log('tickers',this.tickers);
      return balances.map(balance => {
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

/*
        const cmcCoin = this.cmcData.find(coin => coin.symbol === balance.symbol);
        if (cmcCoin && cmcCoin.quote && cmcCoin.quote.USD) {

          const value = (parseFloat(balance.balance) * parseFloat(cmcCoin.quote.USD.price)).toFixed(2);

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
        }*/
      });
    },
  },
  async mounted() {
    try {
      await this.getData();
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error);
    }
  },
  computed: {
    groupedBalances() { 
      // Filtrer les balances par plateforme (Binance dans ce cas)
      const binanceBalances = this.balances.filter(balance => balance.platform === 'binance');
      const kucoinBalances = this.balances.filter(balance => balance.platform === 'kucoin');
      const htxBalances = this.balances.filter(balance => balance.platform === 'htx');
      const okxBalances = this.balances.filter(balance => balance.platform === 'okx');

      // Calculer la valeur en USD ou USDT pour chaque balance
      const binanceBalancesWithValue = this.calculateBalanceValue(binanceBalances);
      const kucoinBalancesWithValue = this.calculateBalanceValue(kucoinBalances);
      const htxBalancesWithValue = this.calculateBalanceValue(htxBalances);
      const okxBalancesWithValue = this.calculateBalanceValue(okxBalances);

      // Regrouper les balances par plateforme avec la valeur calculée
      const groupedBalances = {
        binance: binanceBalancesWithValue,
        kucoin: kucoinBalancesWithValue,
        htx: htxBalancesWithValue,
        okx: okxBalancesWithValue,
      };

      return groupedBalances;
    },
  },
  components: {
    PieChart,
  },
};
</script>

<style scoped>
/* Ajoutez des styles au besoin */

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
}</style>
