/**
 * Converts input data to JSON format based on the detected model type.
 * @param {Array<any>} data - The input data to be converted.
 * @returns {Promise<Array<any>>} A promise that resolves to the converted JSON data.
 */
async function convertToJSON(data: Array<any>): Promise<Array<any>> {
  const modelType = detectModelType(data)

  switch (modelType) {
    case 'model_kucoin':
      return convertModelKucoin(data)
    case 'model_okx':
      return convertModelOkx(data)
    case 'model_binance':
      return convertModelBinance(data)
    case 'model_htx':
      return await convertModelHTX(data)
    default:
      console.error('Modèle de fichier CSV non pris en charge')
      return []
  }
}

/**
 * Detects the model type of the input data.
 * @param {Array<any>} data - The input data to analyze.
 * @returns {string} The detected model type.
 */
function detectModelType(data: Array<any>): string {
  let modelType: string
  if (
    data[0] &&
    data[0]['uid'] &&
    data[0]['symbol'] &&
    data[0]['deal_type'] &&
    data[0]['deal_time']
  ) {
    modelType = 'model_htx'
  } else if (
    data[0] &&
    data[0]['Order ID'] &&
    data[0]['Order Time(UTC-03:00)']
  ) {
    modelType = 'model_kucoin'
  } else if (
    data[0] &&
    data[0]['Order id'] &&
    data[0]['Instrument'] &&
    data[0]['Time']
  ) {
    modelType = 'model_okx'
  } else if (
    data[0] &&
    data[0]['Date(UTC)'] &&
    data[0]['Pair'] &&
    data[0]['Side'] &&
    data[0]['Price'] &&
    data[0]['Executed'] &&
    data[0]['Amount'] &&
    data[0]['Fee']
  ) {
    modelType = 'model_binance'
  } else {
    modelType = 'model_unknown'
  }
  console.log('🚀 ~ detectModelType ~ modelType:', modelType)
  return modelType
}

/**
 * Retrieves the total USDT value from an API based on the deal time, quote, and total.
 * @param {string} dealTime - The time of the deal.
 * @param {string} quote - The quote currency.
 * @param {number} total - The total amount.
 * @returns {Promise<number>} A promise that resolves to the total USDT value.
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
 * @param {Array<any>} data - The HTX model data to convert.
 * @returns {Promise<Array<any>>} A promise that resolves to the converted data.
 */
async function convertModelHTX(data: Array<any>): Promise<Array<any>> {
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
  return convertedData.filter(Boolean)
}

/**
 * Converts Binance model data to a standardized format.
 * @param {Array<any>} data - The Binance model data to convert.
 * @returns {Promise<Array<any>>} A promise that resolves to the converted data.
 */
async function convertModelBinance(data: Array<any>): Promise<Array<any>> {
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
        const [total, quote] = item['Amount']
          .match(/([0-9.]+)?([A-Za-z]+)([A-Za-z0-9]+)?/)
          .slice(1, 3)
          .filter(Boolean)

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
  return convertedData.filter(Boolean)
}

/**
 * Converts KuCoin model data to a standardized format.
 * @param {Array<any>} data - The KuCoin model data to convert.
 * @returns {Promise<Array<any>>} A promise that resolves to the converted data.
 */
async function convertModelKucoin(data: Array<any>): Promise<Array<any>> {
  console.log('🚀 ~ convertModelKucoin ~ data:', data)
  const convertedData = await Promise.all(
    data.map(async (item) => {
      if (item && item.Symbol && item.Symbol.includes('-')) {
        return {
          base: item.Symbol.split('-')[0],
          quote: item.Symbol.split('-')[1],
          date: item['Order Time(UTC-03:00)'],
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
  return convertedData.filter(Boolean)
}

/**
 * Converts OKX model data to a standardized format.
 * @param {Array<any>} data - The OKX model data to convert.
 * @returns {Promise<Array<any>>} A promise that resolves to the converted data.
 */
async function convertModelOkx(data: Array<any>): Promise<Array<any>> {
  console.log('🚀 ~ convertModelOkx ~ data:', data)

  const processedOrders = new Map<string, any>()

  const convertItem = async (item: any) => {
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
      const previousObject = processedOrders.get(orderId)

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

        if (fee !== 0) {
          previousObject.fee = fee
          previousObject.feecoin = balanceUnit
        }
      } else {
        Object.assign(previousObject, {
          quote: balanceUnit,
          total: amount,
          totalUSDT: balanceUnit === 'USDT' ? amount : 0
        })

        if (fee !== 0) {
          previousObject.fee = fee
          previousObject.feecoin = balanceUnit
        }
      }

      processedOrders.set(orderId, previousObject)
    } else {
      const totalUSDT = await getTotalUSDTFromAPI(date, balanceUnit, amount)

      processedOrders.set(orderId, {
        base,
        quote: balanceUnit,
        date,
        pair: instrument,
        type: action.toLowerCase(),
        price: fillPrice,
        amount: balance,
        total: amount,
        totalUSDT,
        fee,
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
