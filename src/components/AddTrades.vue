<!-- AddTrades.vue -->

<template>
  <div class="page">
    <h1>Add new trades manually</h1>
    <div id="table">
      <form @submit.prevent="addTrades">
        <AddTradeForm :trades="trades" @removeRow="removeRow" />
        <div style="text-align: center; margin-top: 10px">
          <prime-button
            type="button"
            @click="addRow"
            style="font-size: 18px; margin: 4px; padding: 10px 20px"
          >
            Add Row
          </prime-button>
          <prime-button type="submit" style="font-size: 18px; margin: 4px; padding: 10px 20px">
            Add Trades
          </prime-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AddTradeForm from "@/components/AddTradeForm.vue";
import { successSpin, errorSpin } from "../js/spinner.js";

const serverHost = import.meta.env.VITE_SERVER_HOST;

export default {
  name: "AddTradesPage",
  components: {
    AddTradeForm,
  },
  methods: {
    async addTrades() {
      successSpin(
        "calcul test",
        `Résultat : ${JSON.stringify(this.trades)}`,
        true,
        true
      );
      try {
        const response = await fetch(`${serverHost}/add/trades`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trades_data: this.trades,
          }),
        });
        console.log("resp:: " + response);
        /*  if (response.ok) {
              const responseData = await response.json();
              successSpin('Save completed', 'Trades added successfully.' + responseData, true, true);
            } else {
              const responseData = await response.json();
              errorSpin('Error', responseData.error, false, true);
            } */
      } catch (error) {
        errorSpin(
          "Error",
          "An error occurred while adding the trades: " + error,
          false,
          true
        );
      }
    },
    removeRow(index) {
      this.trades.splice(index, 1);
    },
    addRow() {
      this.trades.push({
        date: "",
        altA: "",
        altB: "USDT",
        pair: "",
        type: "buy",
        price: "0",
        amount: "0",
        total: "0",
        fee: "0",
        feecoin: "",
        platform: "",
        explatform: "",
      });
    },
  },
  mounted() {
    this.addRow();
  },
  data() {
    return {
      trades: [],
    };
  },
};
</script>

<style scoped>
.page {
  overflow-x: auto;
}

#table {
  height: 700px;
  width: auto;
}
</style>
