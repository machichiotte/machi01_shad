import { MappedTrade } from "@models/dbTypes"

/**
 * Converts input data to JSON format based on the detected model type.
 */
async function convertToJSON(data: TradeModel[]): Promise<MappedTrade[]> {
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
async function getTotalUSDTFromAPI(
  dealTime: string,
  quote: string,
  total: number
): Promise<number> {
  console.log('🚀 ~ getTotalUSDTFromAPI ~ total:', total)
  console.log('🚀 ~ getTotalUSDTFromAPI ~ quote:', quote)
  console.log('🚀 ~ getTotalUSDTFromAPI ~ dealTime:', dealTime)

  if (quote && !['USDT', 'BUSD', 'USDC'].includes(quote.toUpperCase())) {
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
  console.log('🚀 ~ convertModelHTX ~ data:', data)
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
        const totalUSDT = await getTotalUSDTFromAPI(date, quote, total)

        return {
          base: base,
          quote: quote,
          date: date,
          timestamp: new Date(date).getTime(),
          pair: item['symbol'],
          type: item['deal_type'].toLowerCase(),
          price: parseFloat(item['price']),
          amount: parseFloat(item['volume']),
          total: total,
          totalUSDT: totalUSDT,
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
  console.log('🚀 ~ convertModelBinance ~ data:', data)
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
        const totalUSDT = await getTotalUSDTFromAPI(
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
          date: date,
          timestamp: new Date(date).getTime(),
          pair: item['Pair'],
          type: item['Side'].toLowerCase(),
          price: parseFloat(item['Price']),
          amount: amount,
          total: parseFloat(total),
          totalUSDT: totalUSDT,
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
  console.log('🚀 ~ convertModelKucoin ~ data:', data)
  const convertedData = await Promise.all(
    data.map(async (item) => {
      if (item && item.Symbol && item.Symbol.includes('-')) {
        return {
          base: item.Symbol.split('-')[0],
          quote: item.Symbol.split('-')[1],
          date: item['Order Time(UTC-03:00)'],
          timestamp: new Date(item['Order Time(UTC-03:00)']).getTime(),
          pair: item.Symbol,
          type: item.Side.toLowerCase(),
          price: parseFloat(item['Avg. Filled Price']),
          amount: parseFloat(item['Filled Amount']),
          total: parseFloat(item['Filled Volume']),
          totalUSDT: parseFloat(item['Filled Volume (USDT)']),
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
async function convertModelOkx(data: Array<ModelOkx>): Promise<MappedTrade[]> {
  console.log('🚀 ~ convertModelOkx ~ data:', data)

  const processedOrders = new Map<string, MappedTrade>()

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

    console.log('🚀 ~ convertItem ~ orderId:', orderId)
    if (processedOrders.has(orderId)) {
      const previousObject = processedOrders.get(orderId)!

      console.log('🚀 ~ convertItem ~ already processed orderId:', orderId)

      if (base === balanceUnit) {
        Object.assign(previousObject, {
          base,
          date,
          pair: instrument,
          type: action.toLowerCase(),
          price: fillPrice,
          amount: balance
        })
      } else {
        Object.assign(previousObject, {
          quote: balanceUnit,
          total: amount,
          totalUSDT: balanceUnit === 'USDT' ? amount : 0
        })
      }

      if (parseFloat(fee) !== 0) {
        previousObject.fee = parseFloat(fee)
        previousObject.feecoin = balanceUnit
      }

      processedOrders.set(orderId, previousObject)
    } else {
      const totalUSDT = await getTotalUSDTFromAPI(date, balanceUnit, parseFloat(amount))

      processedOrders.set(orderId, {
        base,
        quote: balanceUnit,
        date: date,
        timestamp: new Date(date).getTime(),
        pair: instrument,
        type: action.toLowerCase(),
        price: parseFloat(fillPrice),
        amount: parseFloat(balance),
        total: parseFloat(amount),
        totalUSDT,
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

  console.log('🚀 ~ convertModelOkx ~ allProcessedOrders:', allProcessedOrders)

  return allProcessedOrders.filter(Boolean)
}

export {
  convertToJSON,
  detectModelType,
  getTotalUSDTFromAPI,
  convertModelHTX,
  convertModelBinance,
  convertModelKucoin,
  convertModelOkx
}