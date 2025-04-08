// src/services/serviceConverter.ts
import { MappedTrade } from "@typ/trade"
import { STABLECOINS } from "@constants/coins"

/**
 * Converts input data to JSON format based on the detected model type.
 */
async function convertToJSON(data: TradeModel[]): Promise<Omit<MappedTrade, '_id'>[]> {
  const modelType = detectModelType(data)

  switch (modelType) {
    case 'model_kucoin':
      return convertModelKucoin(data as ModelKucoin[])
    case 'model_okx':
      return convertModelOkx(data as ModelOkx[])
    case 'model_binance':
      return convertModelBinance(data as ModelBinance[])
    case 'model_htx':
      return await convertModelHTX(data as ModelHtx[])
    default:
      console.error('Modèle de fichier CSV non pris en charge')
      return []
  }
}

// Define types for different models
type ModelHtx = {
  uid: string;
  symbol: string;
  deal_type: string;
  deal_time: string;
  [key: string]: string;
};

type ModelKucoin = {
  "Order ID": string;
  "Order Time(UTC-03:00)": string;
  [key: string]: string;
};

type ModelOkx = {
  "Order id": string;
  Instrument: string;
  Time: string;
  [key: string]: string;
};

type ModelBinance = {
  "Date(UTC)": string;
  Pair: string;
  Side: string;
  Price: string;
  Executed: string;
  Amount: string;
  Fee: string;
  [key: string]: string;
};

// Define a union type for all possible models
export type TradeModel = ModelHtx | ModelKucoin | ModelOkx | ModelBinance;

/**
 * Detects the model type of the input data.
 */
function detectModelType(data: TradeModel[]): string {
  if (data.length === 0) {
    return 'model_unknown';
  }

  const firstItem = data[0];

  // Use type guards to check for each model type
  if (
    (firstItem as ModelHtx).uid &&
    (firstItem as ModelHtx).symbol &&
    (firstItem as ModelHtx).deal_type &&
    (firstItem as ModelHtx).deal_time
  ) {
    return 'model_htx';
  } else if (
    (firstItem as ModelKucoin)["Order ID"] &&
    (firstItem as ModelKucoin)["Order Time(UTC-03:00)"]
  ) {
    return 'model_kucoin';
  } else if (
    (firstItem as ModelOkx)["Order id"] &&
    (firstItem as ModelOkx).Instrument &&
    (firstItem as ModelOkx).Time
  ) {
    return 'model_okx';
  } else if (
    (firstItem as ModelBinance)["Date(UTC)"] &&
    (firstItem as ModelBinance).Pair &&
    (firstItem as ModelBinance).Side &&
    (firstItem as ModelBinance).Price &&
    (firstItem as ModelBinance).Executed &&
    (firstItem as ModelBinance).Amount &&
    (firstItem as ModelBinance).Fee
  ) {
    return 'model_binance';
  } else {
    return 'model_unknown';
  }
}


/**
 * Retrieves the total USDT value from an API based on the deal time, quote, and total.
 */
async function getEqUSDFromAPI(
  dealTime: string,
  quote: string,
  total: number
): Promise<number> {
  if (quote && !STABLECOINS.includes(quote.toUpperCase())) {
    /*try {
        const response = await axios.get('URL_DE_L_API', {
          params: { date: dealTime, quote },
        });
  
        return response.data.rate * total);
      } catch (error) {
        console.error("Erreur lors de l'appel API pour obtenir le taux de conversion :", error);
        return null;
      }*/
    return 0
  }
  return total
}

/**
 * Converts HTX model data to a standardized format.
 */
async function convertModelHTX(data: Array<ModelHtx>): Promise<MappedTrade[]> {
  const convertedData = await Promise.all(
    data.map(async (item) => {
      if (
        item &&
        item['uid'] &&
        item['symbol'] &&
        item['deal_type'] &&
        item['deal_time']
      ) {
        const [base, quote] = item['symbol'].split('/')
        const date = item['deal_time']
        const total = parseFloat(item['amount'])
        const eqUSD = await getEqUSDFromAPI(date, quote, total)

        return {
          base: base,
          quote: quote,
          dateUTC: date,
          timestamp: new Date(date).getTime(),
          pair: item['symbol'],
          side: item['deal_type'].toLowerCase(),
          price: parseFloat(item['price']),
          amount: parseFloat(item['volume']),
          total: total,
          eqUSD: eqUSD,
          fee: parseFloat(item['fee_amount']),
          feecoin: item['fee_currency'].toUpperCase(),
          platform: 'htx'
        }
      }
      return null
    })
  )
  return convertedData.filter(Boolean) as MappedTrade[]
}

/**
 * Converts Binance model data to a standardized format.
 */
async function convertModelBinance(data: Array<ModelBinance>): Promise<MappedTrade[]> {
  const convertedData = await Promise.all(
    data.map(async (item) => {
      if (
        item &&
        item['Date(UTC)'] &&
        item['Pair'] &&
        item['Side'] &&
        item['Price'] &&
        item['Executed'] &&
        item['Amount'] &&
        item['Fee']
      ) {
        const [total, quote] = item['Amount']?.match(/([0-9.]+)?([A-Za-z]+)([A-Za-z0-9]+)?/)?.slice(1, 3)?.filter(Boolean) ?? []

        const base = (() => {
          const baseStartIndex = item['Pair'].indexOf(quote)
          return item['Pair'].substring(0, baseStartIndex).toUpperCase()
        })()

        const date = item['Date(UTC)']
        const amount = parseFloat(item['Executed'].replace(base, ''))
        const eqUSD = await getEqUSDFromAPI(
          date,
          quote,
          parseFloat(total)
        )
        const feecoin = item['Fee'].includes(base)
          ? base
          : item['Fee'].includes(quote)
            ? quote
            : '/'

        return {
          base: base,
          quote: quote,
          dateUTC: date,
          timestamp: new Date(date).getTime(),
          pair: item['Pair'],
          side: item['Side'].toLowerCase(),
          price: parseFloat(item['Price']),
          amount: amount,
          total: parseFloat(total),
          eqUSD: eqUSD,
          fee: parseFloat(item['Fee']),
          feecoin: feecoin,
          platform: 'binance'
        }
      }
      return null
    })
  )
  return convertedData.filter(Boolean) as MappedTrade[]
}

/**
 * Converts KuCoin model data to a standardized format.
 */
async function convertModelKucoin(data: Array<ModelKucoin>): Promise<MappedTrade[]> {
  const convertedData = await Promise.all(
    data.map(async (item) => {
      if (item && item.Symbol && item.Symbol.includes('-')) {
        return {
          base: item.Symbol.split('-')[0],
          quote: item.Symbol.split('-')[1],
          dateUTC: item['Order Time(UTC-03:00)'],
          timestamp: new Date(item['Order Time(UTC-03:00)']).getTime(),
          pair: item.Symbol,
          side: item.Side.toLowerCase(),
          price: parseFloat(item['Avg. Filled Price']),
          amount: parseFloat(item['Filled Amount']),
          total: parseFloat(item['Filled Volume']),
          eqUSD: parseFloat(item['Filled Volume (USD)']),
          fee: parseFloat(item.Fee),
          feecoin: item['Fee Currency'],
          platform: 'kucoin'
        }
      }
      return null
    })
  )
  return convertedData.filter(Boolean) as MappedTrade[]
}

/**
 * Converts OKX model data to a standardized format.
 */
async function convertModelOkx(data: Array<ModelOkx>): Promise<Omit<MappedTrade, '_id'>[]> {
  const processedOrders = new Map<string, Omit<MappedTrade, '_id'>>()

  const convertItem = async (item: ModelOkx) => {
    const {
      'Order id': orderId,
      'Trading Unit': base,
      Time: date,
      'Trade Type': tradeType,
      Instrument: instrument,
      Action: action,
      'Fill Price': fillPrice,
      Balance: balance,
      Amount: amount,
      Fee: fee,
      'Balance Unit': balanceUnit
    } = item

    if (
      !orderId ||
      !instrument ||
      !date ||
      !instrument.includes('-') ||
      tradeType !== 'Spot'
    ) {
      return null
    }

    if (processedOrders.has(orderId)) {
      const previousObject = processedOrders.get(orderId)!

      if (base === balanceUnit) {
        Object.assign(previousObject, {
          base,
          dateUTC: date,
          pair: instrument,
          type: action.toLowerCase(),
          price: fillPrice,
          amount: balance
        })
      } else {
        Object.assign(previousObject, {
          quote: balanceUnit,
          total: amount,
          eqUSD: balanceUnit === 'USDT' ? amount : 0
        })
      }

      if (parseFloat(fee) !== 0) {
        previousObject.fee = parseFloat(fee)
        previousObject.feecoin = balanceUnit
      }

      processedOrders.set(orderId, previousObject)
    } else {
      const eqUSD = await getEqUSDFromAPI(date, balanceUnit, parseFloat(amount))

      processedOrders.set(orderId, {
        base,
        quote: balanceUnit,
        dateUTC: date,
        timestamp: new Date(date).getTime(),
        pair: instrument,
        side: action.toLowerCase(),
        price: parseFloat(fillPrice),
        amount: parseFloat(balance),
        total: parseFloat(amount),
        eqUSD,
        fee: parseFloat(fee),
        feecoin: balanceUnit,
        platform: 'okx'
      })
    }
  }

  await Promise.all(data.map(convertItem))

  const allProcessedOrders = Array.from(processedOrders.values()).map(
    (order) => {
      order.fee = Math.abs(order.fee)
      return order
    }
  )

  return allProcessedOrders.filter(Boolean)
}

export {
  convertToJSON,
  detectModelType,
  getEqUSDFromAPI,
  convertModelHTX,
  convertModelBinance,
  convertModelKucoin,
  convertModelOkx
}