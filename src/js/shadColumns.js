// shadColumns.js

//import { VGridVueTemplate } from "@revolist/vue3-datagrid";
//import MySellButton from "../components/MySellButton.vue";
//import { createColoredCell, createOnClickCell, createPlatformColoredCell } from "./cells.js";
//import { createColoredCell, createPlatformColoredCell, createOnClickCell } from "./cells.js";

const cmcColumns = [
  { label:'Rank', field : 'rank', numeric: true},
  { label:'Name', field : 'name'},
  { label:'Symbol', field : 'symbol'},
]

const activeOrdersColumns = [
  { label: 'oId', field: 'oId' },
  { label: 'Platform', field: 'platform' },
  { label: 'Symbol', field: 'symbol' },
  { label: 'Type', field: 'type' },
  { label: 'Side', field: 'side' },
  { label: 'Amount', field: 'amount' , numeric: true},
  { label: 'Price', field: 'price' , numeric: true},
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
  { label: "Rank", field: "rank" , type: 'number'},
 { label: "Average Entry Price", field: "averageEntryPrice"
 , type: 'number'},  { label: "Total buy", field: "totalBuy" , type: 'number'},
  { label: "Max wanted", field: "maxWanted" , numeric: true},
  {
    label: "Percentage Difference", field: "percentageDifference", type: "percentage"} ,
  { label: "Current Price", field: "currentPrice" , type: 'number'},  { label: "Wallet", field: "currentPossession", type: 'number'},  { label: "Profit", field: "profit"
 , type: 'number'},
  { label: "Total sell", field: "totalSell", type: 'number'},  { label: "Recup shad", field: "recupShad", type: 'number'},  /*{
    label:'Open Orders',
    children: [*/
  { label: "Buy", field: "openBuyOrders"
 , type: 'number'},  { label: "Sell", field: "openSellOrders" 
 , type: 'number'},  /*]
},*/
  { label: "Quantite total achetee", field: "totalAmount" 
 , type: 'number'},  { label: "Balance", field: "balance" 
 , type: 'number'},  /*{
    label:'Recup',
    children: [*/
  { label: "tp1", field: "recupTp1" 
 , type: 'number'},  { label: "tpX", field: "recupTpX" 
 , type: 'number'},  /* ]
 },*/
  /*{
    label:'TP1',
    children: [*/
  { label: "amount", field: "amountTp1" 
 , type: 'number'},  { label: "price", field: "priceTp1" 
 , type: 'number'},  /*]
},
{
  label:'TP2',
  children: [*/
  { label: "amount", field: "amountTp2" 
 , type: 'number'},  { label: "price", field: "priceTp2" 
 , type: 'number'},  /* ]
 },
 {
   label:'TP3',
   children: [*/
  { label: "amount", field: "amountTp3" 
 , type: 'number'},  { label: "price", field: "priceTp3" 
 , type: 'number'},  /*]
},
{
  label:'TP4',
  children: [*/
  { label: "amount", field: "amountTp4" 
 , type: 'number'},  { label: "price", field: "priceTp4" 
 , type: 'number'},  /*]
},
{
  label:'TP5',
  children: [*/
  { label: "amount", field: "amountTp5" 
 , type: 'number'},  { label: "price", field: "priceTp5" 
 , type: 'number'},  /*]
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