// shadColumns.js

//import { VGridVueTemplate } from "@revolist/vue3-datagrid";
//import MySellButton from "../components/MySellButton.vue";
//import { createColoredCell, createOnClickCell, createPlatformColoredCell } from "./cells.js";
//import { createColoredCell, createPlatformColoredCell, createOnClickCell } from "./cells.js";

const cmcColumns = [
  { label:'Rank', field : 'rank'},
  { label:'Name', field : 'name'},
  { label:'Symbol', field : 'symbol'},
]

const activeOrdersColumns = [
  { label: 'oId', field: 'oId' },
  { label: 'Platform', field: 'platform' },
  { label: 'Symbol', field: 'symbol' },
  { label: 'Type', field: 'type' },
  { label: 'Side', field: 'side' },
  { label: 'Amount', field: 'amount' },
  { label: 'Price', field: 'price' },
]

const tradesColumns = [
  { label: 'altA', field: 'altA' },
  { label: 'altB', field: 'altB' },
  { label: 'Date', field: 'date' },
  { label: 'Pair', field: 'pair' },
  { label: 'Type', field: 'type' },
  { label: 'Price', field: 'price' },
  { label: 'Amount', field: 'amount' },
  { label: 'Total', field: 'total' },
  { label: 'Fee', field: 'fee' },
  { label: 'Feecoin', field: 'feecoin' },
  { label: 'Platform', field: 'platform' },
  { label: 'Explatform', field: 'explatform' }
]

const shadColumns = [
  {
    label: 'Icon',
    field: "iconUrl",
    html: true,
  },
  {
    label: "Asset", field: "asset",
  },
  { label: "Ratio", field: "ratioShad" },
  { label: "Total shad", field: "totalShad" },
  { label: "Rank", field: "rank" },
  { label: "Average Entry Price", field: "averageEntryPrice" },
  { label: "Total buy", field: "totalBuy" },
  { label: "Max wanted", field: "maxWanted" },
  {
    label: "Percentage Difference", field: "percentageDifference", type: "percentage"
  },
  { label: "Current Price", field: "currentPrice" },

  { label: "Wallet", field: "currentPossession" },
  { label: "Profit", field: "profit" },

  { label: "Total sell", field: "totalSell" },
  { label: "Recup shad", field: "recupShad" },
  /*{
    label:'Open Orders',
    children: [*/
  { label: "Buy", field: "openBuyOrders" },
  { label: "Sell", field: "openSellOrders" },
  /*]
},*/
  { label: "Quantite total achetee", field: "totalAmount" },
  { label: "Balance", field: "balance" },
  /*{
    label:'Recup',
    children: [*/
  { label: "tp1", field: "recupTp1" },
  { label: "tpX", field: "recupTpX" },
  /* ]
 },*/
  /*{
    label:'TP1',
    children: [*/
  { label: "amount", field: "amountTp1" },
  { label: "price", field: "priceTp1" },
  /*]
},
{
  label:'TP2',
  children: [*/
  { label: "amount", field: "amountTp2" },
  { label: "price", field: "priceTp2" },
  /* ]
 },
 {
   label:'TP3',
   children: [*/
  { label: "amount", field: "amountTp3" },
  { label: "price", field: "priceTp3" },
  /*]
},
{
  label:'TP4',
  children: [*/
  { label: "amount", field: "amountTp4" },
  { label: "price", field: "priceTp4" },
  /*]
},
{
  label:'TP5',
  children: [*/
  { label: "amount", field: "amountTp5" },
  { label: "price", field: "priceTp5" },
  /*]
},
{
  label:'Percent Change',
  children: [*/
  { label: "24h", field: "cryptoPercentChange24h", type: "percentage" },
  { label: "7d", field: "cryptoPercentChange7d", type: "percentage" },
  { label: "30d", field: "cryptoPercentChange30d", type: "percentage" },
  { label: "60d", field: "cryptoPercentChange60d", type: "percentage" },
  { label: "90d", field: "cryptoPercentChange90d", type: "percentage" },
  /*]
},*/
  { label: "Exchange", field: "exchangeId" }

];

module.exports = { cmcColumns, activeOrdersColumns, tradesColumns, shadColumns }