<template>
  <div>
    <h1>Add trades</h1>
    <form @submit.prevent="addTrade">
      <div>
        <label for="date">Date:</label>
        <input type="date" v-model="tradeData.date" required>
      </div>
      
      <div>
        <label for="altA">altA:</label>
        <input type="text" v-model="tradeData.altA" required>
      </div>
      
      <div>
        <label for="altB">altB:</label>
        <select v-model="tradeData.altB" required>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="USD">USD</option>
        </select>
      </div>
      
      <div>
        <label for="type">Type:</label>
        <select v-model="tradeData.type" required>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      
      <div>
        <label for="price">Price:</label>
        <input type="number" v-model="tradeData.price" required>
      </div>
      
      <div>
        <label for="amount">Amount:</label>
        <input type="number" v-model="tradeData.amount" required>
      </div>
      
      <div>
        <label for="total">Total:</label>
        <input type="number" v-model="tradeData.total" required>
      </div>
      
      <div>
        <label for="fee">Fee:</label>
        <input type="number" v-model="tradeData.fee" required>
      </div>
      
      <div>
        <label for="feecoin">Fee Coin:</label>
        <input type="text" v-model="tradeData.feecoin" required>
      </div>
      
      <div>
        <label for="platform">Platform:</label>
        <select v-model="tradeData.platform" required>
          <option value="" disabled>Select a platform</option>
          <option value="binance">Binance</option>
          <option value="kucoin">Kucoin</option>
          <option value="huobi">Huobi</option>
          <option value="okex">Okex</option>
          <option value="gateio">Gateio</option>
        </select>
      </div>
      
      <div>
        <label for="explatform">Ex Platform:</label>
        <select v-model="tradeData.explatform">
          <option value="" disabled>Select an exchange platform</option>
          <option value="binance">Binance</option>
          <option value="kucoin">Kucoin</option>
          <option value="huobi">Huobi</option>
          <option value="okex">Okex</option>
          <option value="gateio">Gateio</option>
        </select>
      </div>
      
      <div>
        <button type="submit">Add Trade</button>
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