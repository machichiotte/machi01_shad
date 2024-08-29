// src/orders.js

// Récupérer l'hôte du serveur à partir des variables d'environnement
const serverHost = import.meta.env.VITE_SERVER_HOST;

/**
 * Fonction générique pour envoyer une requête HTTP avec un corps JSON
 * @param {string} url - L'URL de la requête
 * @param {Object} requestBody - Le corps de la requête
 * @param {string} [method='POST'] - La méthode HTTP (par défaut 'POST')
 * @returns {Promise<Object|number>} La réponse JSON ou le statut de la réponse
 */
const httpRequest = async (url, requestBody, method = 'POST') => {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`Error: Request to ${url} failed with status ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return method === 'POST' ? await response.json() : response.status;
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);
    throw error;
  }
};

/**
 * Annule toutes les ordres pour une plateforme et un actif donné
 * @param {string} platform - L'identifiant de la plateforme
 * @param {string} asset - L'actif concerné
 * @returns {Promise<Object>} La réponse JSON de l'API
 */
const cancelAllOrders = (platform, asset) => {
  return httpRequest(`${serverHost}/orders/cancel/all`, { platform, asset });
};

/**
 * Annule toutes les ordres de vente pour une plateforme et un actif donné
 * @param {string} platform - L'identifiant de la plateforme
 * @param {string} asset - L'actif concerné
 * @returns {Promise<Object>} La réponse JSON de l'API
 */
const cancelAllSellOrders = (platform, asset) => {
  return httpRequest(`${serverHost}/orders/cancel/all/sell`, { platform, asset });
};

/**
 * Place un ordre de vente au marché pour une plateforme et un actif donné
 * @param {string} platform - L'identifiant de la plateforme
 * @param {string} asset - L'actif concerné
 * @param {number} amount - Le montant de l'actif à vendre
 * @returns {Promise<number>} Le statut de la réponse
 */
const marketSellOrder = (platform, asset, amount) => {
  return httpRequest(`${serverHost}/orders/market-sell-order`, { platform, asset, amount });
};

/**
 * Place plusieurs ordres de vente à limite pour une plateforme et un actif donné
 * @param {string} platform - L'identifiant de la plateforme
 * @param {string} asset - L'actif concerné
 * @param {number} amount - Le montant de l'actif
 * @param {number} price - Le prix de l'actif
 * @returns {Promise<number>} Le statut de la réponse
 */
const bunchLimitSellOrders = (platform, asset, amount, price) => {
  return httpRequest(`${serverHost}/orders/bunch-limit-sell-orders`, { platform, asset, amount, price });
};

/**
 * Place plusieurs ordres d'achat à limite pour une plateforme et un actif donné
 * @param {string} platform - L'identifiant de l'échange
 * @param {string} asset - L'actif concerné
 * @param {number} amount - Le montant de l'actif
 * @param {number} price - Le prix de l'actif
 * @returns {Promise<number>} Le statut de la réponse
 */
const bunchLimitBuyOrders = (platform, asset, amount, price) => {
  return httpRequest(`${serverHost}/orders/bunch-limit-buy-orders`, { platform, asset, amount, price });
};

export { cancelAllOrders, cancelAllSellOrders, marketSellOrder, bunchLimitSellOrders, bunchLimitBuyOrders };
