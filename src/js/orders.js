const serverHost = import.meta.env.VITE_SERVER_HOST

const cancelAllOrders = async (exchangeId, asset) => {
  const requestBody = {
    exchangeId: exchangeId,
    asset: asset
  }

  const response = await fetch(`${serverHost}/orders/cancel/all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  const data = await response.json()

  return data
}

const cancelAllSellOrders = async (exchangeId, asset) => {
  const requestBody = {
    exchangeId: exchangeId,
    asset: asset
  }

  const response = await fetch(`${serverHost}/orders/cancel/all/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  const data = await response.json()

  return data
}

const bunchOrders = async (exchangeId, asset, amount, price) => {
  const requestBody = {
    exchangeId: exchangeId,
    asset: asset,
    amount: amount,
    price: price
  }

  const response = await fetch(`${serverHost}/orders/bunch-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  return response.status
}

export { cancelAllOrders, cancelAllSellOrders, bunchOrders }
