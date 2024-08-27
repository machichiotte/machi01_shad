// src/orders.js

// Récupérer l'hôte du serveur à partir des variables d'environnement
const serverHost = import.meta.env.VITE_SERVER_HOST

/**
 * Fonction générique pour envoyer une requête POST avec un corps JSON
 * @param {string} url - L'URL de la requête
 * @param {Object} requestBody - Le corps de la requête
 * @returns {Promise<Object>} La réponse JSON
 */
const postRequest = async (url, requestBody) => {
  console.log(`🚀 ~ file: orders.js:13 ~ postRequest ~ requestBody:`, requestBody)
  console.log(`🚀 ~ file: orders.js:13 ~ postRequest ~ url:`, url)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error making POST request:', error)
    throw error
  }
}

/**
 * Annule toutes les ordres pour une platform et un actif donné
 * @param {string} platform - L'identifiant de la platforme
 * @param {string} asset - L'actif concerné
 * @returns {Promise<Object>} La réponse JSON de l'API
 */
const cancelAllOrders = (platform, asset) => {
  return postRequest(`${serverHost}/orders/cancel/all`, { platform, asset: asset })
}

/**
 * Annule toutes les ordres de vente pour un échange et un actif donné
 * @param {string} platform - L'identifiant de la platforme
 * @param {string} asset - L'actif concerné
 * @returns {Promise<Object>} La réponse JSON de l'API
 */
const cancelAllSellOrders = (platform, asset) => {
  return postRequest(`${serverHost}/orders/cancel/all/sell`, { platform, asset: asset })
}

/**
 * Place plusieurs ordres de vente à limite pour un échange et un actif donné
 * @param {string} platform - L'identifiant de la platforme
 * @param {string} asset - L'actif concerné
 * @param {number} amount - Le montant de l'actif
 * @param {number} price - Le prix de l'actif
 * @returns {Promise<number>} Le statut de la réponse
 */
const bunchLimitSellOrders = async (platform, asset, amount, price) => {
  try {
    console.log('ici')

    const response = await fetch(`${serverHost}/orders/bunch-limit-sell-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, asset, amount, price })
    })

    console.log('la')
    if (!response.ok) {
      console.log(
        `🚀 ~ file: orders.js:73 ~ bunchLimitSellOrders ~ response.status:`,
        response.status
      )
      //throw new Error(`HTTP error! Status: ${response.status}`)
    }
    console.log('lalala')

    return response.status
  } catch (error) {
    console.error('Error placing bunch limit sell orders:', error)
    throw error
  }
}

/**
 * Place plusieurs ordres d'achat à limite pour un échange et un actif donné
 * @param {string} platform - L'identifiant de l'échange
 * @param {string} asset - L'actif concerné
 * @param {number} amount - Le montant de l'actif
 * @param {number} price - Le prix de l'actif
 * @returns {Promise<number>} Le statut de la réponse
 */
const bunchLimitBuyOrders = async (platform, asset, amount, price) => {
  try {
    const response = await fetch(`${serverHost}/orders/bunch-limit-buy-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, asset, amount, price })
    })

    if (!response.ok) {
      //throw new Error(`HTTP error! Status: ${response.status}`)
      console.log(
        `🚀 ~ file: orders.js:101 ~ bunchLimitBuyOrders ~ response.status:`,
        response.status
      )
    }

    return response.status
  } catch (error) {
    console.error('Error placing bunch limit buy orders:', error)
    throw error
  }
}

export { cancelAllOrders, cancelAllSellOrders, bunchLimitSellOrders, bunchLimitBuyOrders }
