// src/js/columns.ts
type Column = {
  header: string;
  field: string;
  numeric?: boolean;
};

const cmcColumns: Column[] = [
  { header: 'Rank', field: 'rank', numeric: true },
  { header: 'Name', field: 'name' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Price', field: 'price' }
]

const ordersColumns: Column[] = [
  { header: 'oId', field: 'oId' },
  { header: 'Platform', field: 'platform' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Type', field: 'type' },
  { header: 'Side', field: 'side' },
  { header: 'Amount', field: 'amount', numeric: true },
  { header: 'Price', field: 'price', numeric: true }
]

const tradesColumns: Column[] = [
  { header: 'Platform', field: 'platform' },
  { header: 'Date', field: 'date' },
  { header: 'Pair', field: 'pair' },
  { header: 'Side', field: 'side' },
  { header: 'Price', field: 'price' },
  { header: 'Amount', field: 'amount' },
  { header: 'Total', field: 'total' },
  { header: 'Total (USDT)', field: 'eqUSD' },
  { header: 'Fee', field: 'fee' },
  { header: 'Feecoin', field: 'feecoin' }
]

const tradesTableColumns: Column[] = [
  { header: 'Date', field: 'date' },
  { header: 'Pair', field: 'pair' },
  { header: 'Type', field: 'type' },
  { header: 'Price', field: 'price' },
  { header: 'Amount', field: 'amount' },
  { header: 'Total', field: 'total' },
  { header: 'Total (USDT)', field: 'eqUSD' },
  { header: 'Fee', field: 'fee' },
  { header: 'Platform', field: 'platform' },
  { header: 'Explatform', field: 'explatform' }
]

const openOrdersTableColumns: Column[] = [
  { header: 'Platform', field: 'platform' },
  { header: 'Symbol', field: 'symbol' },
  { header: 'Side', field: 'side' },
  { header: 'Amount', field: 'amount' },
  { header: 'Price', field: 'price' }
]

export { cmcColumns, ordersColumns, tradesColumns, tradesTableColumns, openOrdersTableColumns }
