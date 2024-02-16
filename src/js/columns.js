// shadColumns.js
const cmcColumns = [
  { header: 'Rank', field: 'rank', numeric: true },
  { header: 'Name', field: 'name' },
  { header: 'Symbol', field: 'symbol' },
]

const ordersColumns = [
  { header: 'oId', field: 'oId' },
  { header: 'Platform', field: 'platform' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Type', field: 'type' },
  { header: 'Side', field: 'side' },
  { header: 'Amount', field: 'amount', numeric: true },
  { header: 'Price', field: 'price', numeric: true },
]

const tradesColumns = [
  { header: 'altA', field: 'altA' },
  { header: 'altB', field: 'altB' },
  { header: 'Date', field: 'date' },
  { header: 'Pair', field: 'pair' },
  { header: 'Type', field: 'type' },
  { header: 'Price', field: 'price' },
  { header: 'Amount', field: 'amount' },
  { header: 'Total', field: 'total' },
  { header: 'Total (USDT)', field: 'totalUSDT' },
  { header: 'Fee', field: 'fee' },
  { header: 'Feecoin', field: 'feecoin' },
  { header: 'Platform', field: 'platform' },
  { header: 'Explatform', field: 'explatform' }
]

const shadColumns = [
  { header: "Exchange", field: "exchangeId" },

  { header: 'Icon', field: "iconUrl", html: true, },
  { header: "Asset", field: "asset", },
  { header: "Ratio", field: "ratioShad", type: 'number' },
  { header: "Total shad", field: "totalShad", type: 'number' },
  { header: "Rank", field: "rank", type: 'number' },
  { header: "Average Entry Price", field: "averageEntryPrice", type: 'number' },
  { header: "Total buy", field: "totalBuy", type: 'number' },
  { header: "Max wanted", field: "maxExposition", numeric: true },
  { header: "Percentage Difference", field: "percentageDifference", type: "percentage" },
  { header: "Current Price", field: "currentPrice", type: 'number' }, { header: "Wallet", field: "currentPossession", type: 'number' }, { header: "Profit", field: "profit", type: 'number' },
  { header: "Total sell", field: "totalSell", type: 'number' }, { header: "Recup shad", field: "recupShad", type: 'number' },  /*{
    label:'Open Orders',
    children: [*/
  { header: "Buy", field: "openBuyOrders", type: 'number' },
  { header: "Sell", field: "openSellOrders", type: 'number' },  /*]
},*/
  { header: "Quantite total achetee", field: "totalAmount", type: 'number' },
  { header: "Balance", field: "balance", type: 'number' },  /*{
    label:'Recup',
    children: [*/
  { header: "tp1", field: "recupTp1", type: 'number' },
  { header: "tpX", field: "recupTpX", type: 'number' },  /* ]
 },*/
  /*{
    label:'TP1',
    children: [*/
  { header: "amount", field: "amountTp1", type: 'number' },
  { header: "price", field: "priceTp1", type: 'number' },  /*]
},
{
  label:'TP2',
  children: [*/
  { header: "amount", field: "amountTp2", type: 'number' },
  { header: "price", field: "priceTp2", type: 'number' },  /* ]
 },
 {
   label:'TP3',
   children: [*/
  { header: "amount", field: "amountTp3", type: 'number' },
  { header: "price", field: "priceTp3", type: 'number' },  /*]
},
{
  label:'TP4',
  children: [*/
  { header: "amount", field: "amountTp4", type: 'number' },
  { header: "price", field: "priceTp4", type: 'number' },  /*]
},
{
  label:'TP5',
  children: [*/
  { header: "amount", field: "amountTp5", type: 'number' },
  { header: "price", field: "priceTp5", type: 'number' },  /*]
},
{
  label:'Percent Change',
  children: [*/
  { header: "24h", field: "cryptoPercentChange24h", type: "percentage" },
  { header: "7d", field: "cryptoPercentChange7d", type: "percentage" },
  { header: "30d", field: "cryptoPercentChange30d", type: "percentage" },
  { header: "60d", field: "cryptoPercentChange60d", type: "percentage" },
  { header: "90d", field: "cryptoPercentChange90d", type: "percentage" },
  /*]
},*/
];

export { cmcColumns, ordersColumns, tradesColumns, shadColumns }