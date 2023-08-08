<template>
  <div>
    <h1 style="font-size: 24px;">Add trades</h1>
    <form @submit.prevent="addTrade">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between;">
          <label for="date" style="font-size: 18px; text-align: right;">Date:</label>
          <input type="date" v-model="tradeData.date" required style="font-size: 18px;">
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <label for="altA" style="font-size: 18px; text-align: right;">altA:</label>
          <input type="text" v-model="tradeData.altA" required style="font-size: 18px;">
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <label for="altB" style="font-size: 18px; text-align: right;">altB:</label>
          <select v-model="tradeData.altB" required style="font-size: 18px;">
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="USD">USD</option>
          </select>
        </div>
        
        <!-- ... (autres champs du formulaire) ... -->
        
        <div style="display: flex; justify-content: space-between;">
          <label for="platform" style="font-size: 18px; text-align: right;">Platform:</label>
          <select v-model="tradeData.platform" required style="font-size: 18px;">
            <option value="" disabled>Select a platform</option>
            <option value="binance">Binance</option>
            <option value="kucoin">Kucoin</option>
            <option value="huobi">Huobi</option>
            <option value="okex">Okex</option>
            <option value="gateio">Gateio</option>
          </select>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <label for="explatform" style="font-size: 18px; text-align: right;">Ex Platform:</label>
          <select v-model="tradeData.explatform" style="font-size: 18px;">
            <option value="" disabled>Select an exchange platform</option>
            <option value="binance">Binance</option>
            <option value="kucoin">Kucoin</option>
            <option value="huobi">Huobi</option>
            <option value="okex">Okex</option>
            <option value="gateio">Gateio</option>
          </select>
        </div>
        
        <div style="text-align: center;">
          <button type="submit" style="font-size: 18px; padding: 10px 20px;">Add Trade</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  methods: {
    async addTrade() {
      try {
        const response = await fetch('/add/trade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.tradeData),
        });

        if (response.ok) {
          // Réinitialiser le formulaire ou afficher un message de succès
          // this.tradeData = { ... } // Réinitialiser les champs
          // alert('Trade ajouté avec succès !');
        } else {
          // Gérer les erreurs ici, par exemple afficher un message d'erreur
        }
      } catch (error) {
        console.error(error);
        // Gérer les erreurs ici, par exemple afficher un message d'erreur
      }
    },
  },
  data() {
    return {
      tradeData: {
        date: '',
        altA: '',
        altB: 'USDT',
        type: 'buy',
        price: 0,
        amount: 0,
        total: 0,
        fee: 0,
        feecoin: '',
        platform: '',
        explatform: '',
      },
    };
  },
};
</script>