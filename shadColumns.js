// shadColumns.js

import { VGridVueTemplate } from "@revolist/vue3-datagrid";
import MySellButton from "./src/components/MySellButton.vue";
import { createColoredCell, createPlatformColoredCell } from "./cells.js";

export const columns = [
  { name: "Asset", prop: "asset", pin: 'colPinStart', autoSize: true, sortable: true, order: "asc" },
  { name: "Actions", cellTemplate: VGridVueTemplate(MySellButton), autoSize: true, canFocus: false },

  { name: "Ratio", prop: "ratioShad", autoSize: true, sortable: true, order: "desc", },
  { name: "Total shad", prop: "totalShad", sortable: true, order: "desc", type: 'number' },
  { name: "Rank", prop: "rank", sortable: true, order: "desc", type: 'number' },
  { name: "Average Entry Price", prop: "averageEntryPrice", sortable: true, order: "desc", type: 'number' },
  { name: "Total buy", prop: "totalBuy", sortable: true, order: "desc", type: 'number' },
  { name: "Max wanted", prop: "maxWanted", sortable: true, order: "desc", type: 'number' },
  { name: "Percentage Difference", prop: "percentageDifference", sortable: true, order: "desc", cellTemplate: createColoredCell },
  { name: "Current Price", prop: "currentPrice", sortable: true, order: "desc", type: 'number' },

  { name: "Wallet", prop: "currentPossession", sortable: true, order: "desc", type: 'number' },
  { name: "Profit", prop: "profit", sortable: true, order: "desc", type: 'number' },

  { name: "Total sell", prop: "totalSell", sortable: true, order: "desc", type: 'number' },
  { name: "Recup shad", prop: "recupShad", sortable: true, order: "desc", type: 'number' },
  {
    name: 'Open Orders',
    children: [
      { name: "Buy", prop: "openBuyOrders", sortable: true, order: "desc", type: 'number' },
      { name: "Sell", prop: "openSellOrders", sortable: true, order: "desc", type: 'number' },
    ]
  },
  { name: "Quantite total achetee", prop: "totalAmount", sortable: true, order: "desc", type: 'number' },
  { name: "Balance", prop: "balance", sortable: true, order: "desc", type: 'number' },
  {
    name: 'Recup',
    children: [
      { name: "tp1", prop: "recupTp1", sortable: true, order: "desc", type: 'number' },
      { name: "tpX", prop: "recupTpX", sortable: true, order: "desc", type: 'number' },
    ]
  },
  {
    name: 'TP1',
    children: [
      { name: "amount", prop: "amountTp1", sortable: true, order: "desc", type: 'number' },
      { name: "price", prop: "priceTp1", sortable: true, order: "desc", type: 'number' },
    ]
  },
  {
    name: 'TP2',
    children: [
      { name: "amount", prop: "amountTp2", sortable: true, order: "desc", type: 'number' },
      { name: "price", prop: "priceTp2", sortable: true, order: "desc", type: 'number' },
    ]
  },
  {
    name: 'TP3',
    children: [
      { name: "amount", prop: "amountTp3", sortable: true, order: "desc", type: 'number' },
      { name: "price", prop: "priceTp3", sortable: true, order: "desc", type: 'number' },
    ]
  },
  {
    name: 'TP4',
    children: [
      { name: "amount", prop: "amountTp4", sortable: true, order: "desc", type: 'number' },
      { name: "price", prop: "priceTp4", sortable: true, order: "desc", type: 'number' },
    ]
  },
  {
    name: 'TP5',
    children: [
      { name: "amount", prop: "amountTp5", sortable: true, order: "desc", type: 'number' },
      { name: "price", prop: "priceTp5", sortable: true, order: "desc", type: 'number' },
    ]
  },
  {
    name: 'Percent Change',
    children: [
      { name: "24h", prop: "cryptoPercentChange24h", sortable: true, order: "desc", cellTemplate: createColoredCell },
      { name: "7d", prop: "cryptoPercentChange7d", sortable: true, order: "desc", cellTemplate: createColoredCell },
      { name: "30d", prop: "cryptoPercentChange30d", sortable: true, order: "desc", cellTemplate: createColoredCell },
      { name: "60d", prop: "cryptoPercentChange60d", sortable: true, order: "desc", cellTemplate: createColoredCell },
      { name: "90d", prop: "cryptoPercentChange90d", sortable: true, order: "desc", cellTemplate: createColoredCell },
    ]
  },
  { name: "Exchange", prop: "exchangeId", pin: 'colPinEnd', sortable: true, order: "desc", cellTemplate: createPlatformColoredCell }

];
