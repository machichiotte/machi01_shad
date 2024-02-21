<!-- AddTrades.vue -->

<template>
  <div class="page">
    <h1>Add new trades manually</h1>
    <div id="table">
      <form @submit.prevent="addTrades">
        <AddTradeForm :trades="trades" @removeRow="removeRow" />
        <div style="text-align: center; margin-top: 10px">
          <Button
            type="button"
            @click="addRow"
            style="font-size: 18px; margin: 4px; padding: 10px 20px"
          >
            Add Row
          </Button>
          <Button type="submit" style="font-size: 18px; margin: 4px; padding: 10px 20px">
            Add Trades
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Importing necessary modules and components
import AddTradeForm from "@/components/AddTradeForm.vue";
import { successSpin, errorSpin } from "../js/spinner.js";
import { ref, onMounted } from 'vue';
import Button from "primevue/button";

// Define server host
const serverHost = import.meta.env.VITE_SERVER_HOST;

// Define reactive data
const trades = ref([]);

// Define methods
async function addTrades() {
  successSpin(
    "calcul test",
    `Résultat : ${JSON.stringify(trades.value)}`,
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
        trades_data: trades.value,
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
}

function removeRow(index) {
  trades.value.splice(index, 1);
}

function addRow() {
  trades.value.push({
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
}

// Fetch data on component mount
onMounted(() => {
  addRow();
});
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
