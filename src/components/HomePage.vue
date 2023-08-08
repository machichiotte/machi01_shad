<template>
  <div>
    <h1>Add trades</h1>
    <form @submit.prevent="addTrade">
      <label for="date">Date:</label>
      <input type="date" v-model="tradeData.date" required>
      
      <label for="altA">altA:</label>
      <input type="text" v-model="tradeData.altA" required>
      
      <label for="altB">altB:</label>
      <select v-model="tradeData.altB" required>
        <option value="USDT">USDT</option>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
        <option value="USD">USD</option>
      </select>
      
      <label for="type">Type:</label>
      <select v-model="tradeData.type" required>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      
      <label for="price">Price:</label>
      <input type="number" v-model="tradeData.price" required>
      
      <label for="amount">Amount:</label>
      <input type="number" v-model="tradeData.amount" required>
      
      <label for="total">Total:</label>
      <input type="number" v-model="tradeData.total" required>
      
      <label for="fee">Fee:</label>
      <input type="number" v-model="tradeData.fee" required>
      
      <label for="feecoin">Fee Coin:</label>
      <input type="text" v-model="tradeData.feecoin" required>
      
      <label for="platform">Platform:</label>
      <input type="text" v-model="tradeData.platform" required>
      
      <label for="explatform">Exchange Platform:</label>
      <input type="text" v-model="tradeData.explatform">
      
      <button type="submit">Add Trade</button>
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