// src/columns.js
const cmcColumns = [
  { header: 'Rank', field: 'rank', numeric: true },
  { header: 'Name', field: 'name' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Price', field: 'price' }
]

const ordersColumns = [
  { header: 'oId', field: 'oId' },
  { header: 'Platform', field: 'platform' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Type', field: 'type' },
  { header: 'Side', field: 'side' },
  { header: 'Amount', field: 'amount', numeric: true },
  { header: 'Price', field: 'price', numeric: true }
]

const tradesColumns = [
  { header: 'Platform', field: 'platform' },
  { header: 'base', field: 'base' },
  { header: 'quote', field: 'quote' },
  { header: 'Date', field: 'date' },
  { header: 'Pair', field: 'pair' },
  { header: 'Type', field: 'type' },
  { header: 'Price', field: 'price' },
  { header: 'Amount', field: 'amount' },
  { header: 'Total', field: 'total' },
  { header: 'Total (USDT)', field: 'totalUSDT' },
  { header: 'Fee', field: 'fee' },
  { header: 'Feecoin', field: 'feecoin' },
  { header: 'Explatform', field: 'explatform' }
]

const tradesTableColumns = [
  { header: 'Date', field: 'date' },
  { header: 'Pair', field: 'pair' },
  { header: 'Type', field: 'type' },
  { header: 'Price', field: 'price' },
  { header: 'Amount', field: 'amount' },
  { header: 'Total', field: 'total' },
  { header: 'Total (USDT)', field: 'totalUSDT' },
  { header: 'Fee', field: 'fee' },
  { header: 'Platform', field: 'platform' },
  { header: 'Explatform', field: 'explatform' }
]

const openOrdersTableColumns = [
  { header: 'Platform', field: 'platform' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Side', field: 'side' },
  { header: 'Amount', field: 'amount' },
  { header: 'Price', field: 'price' }
]

export {
  cmcColumns,
  ordersColumns,
  tradesColumns,
  tradesTableColumns,
  openOrdersTableColumns
}
