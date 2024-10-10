// src/orders.ts
type ApiResponse = { message: string; data?: any; error?: string; };

const serverHost: string = import.meta.env.VITE_SERVER_HOST as string;

// Type pour la structure de la réponse Mongodb
import { ResponseMongodb } from '../../types/response'

// Fonction pour envoyer une requête HTTP
const httpRequest = async (
  url: string,
  requestBody: Object,
  method: string = 'POST'
): Promise<ResponseMongodb> => {  // Type du retour spécifié explicitement
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },  // Spécifie le type du contenu
      body: JSON.stringify(requestBody),  // Conversion du corps en JSON
    });

    // Parse la réponse JSON et cast vers le type ResponseMongodb
    const jsonResponse = (await response.json()) as ResponseMongodb;

    // Vérifie si une erreur est renvoyée par le serveur
    if (jsonResponse.error) {
      // Lance une exception avec le statut et le message d'erreur
      throw new Error(`${response.status} : ${jsonResponse.message}`);
    }

    // Retourne les données si disponibles, sinon le statut HTTP
    return {
      message: jsonResponse.message,
      data: jsonResponse.data || response.status,  // Retourne les données ou le statut
    };
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);  // Log de l'erreur
    // Retourne un objet d'erreur avec le message capturé
    return {
      message: 'Request failed',
      error: (error as Error).message,  // Cast l'erreur pour avoir son message
    };
  }
};


const cancelAllOrders = (platform: string, asset: string): Promise<ApiResponse> => {
  return httpRequest(`${serverHost}/order/cancel/all`, { platform, asset })
}

const cancelAllSellOrders = (platform: string, asset: string): Promise<ApiResponse> => {
  return httpRequest(`${serverHost}/order/cancel/all/sell`, { platform, asset })
}

const marketSellOrder = (platform: string, asset: string, amount: number): Promise<ApiResponse> => {
  return httpRequest(`${serverHost}/order/market-sell-order`, { platform, asset, amount })
}

const bunchLimitSellOrders = (platform: string, asset: string, amount: number, price: number): Promise<ApiResponse> => {
  return httpRequest(`${serverHost}/order/limit-sell-orders`, {
    platform,
    asset,
    amount,
    price
  })
}

const bunchLimitBuyOrders = (platform: string, asset: string, amount: number, price: number): Promise<ApiResponse> => {
  return httpRequest(`${serverHost}/order/limit-buy-orders`, {
    platform,
    asset,
    amount,
    price
  })
}

export {
  cancelAllOrders,
  cancelAllSellOrders,
  marketSellOrder,
  bunchLimitSellOrders,
  bunchLimitBuyOrders
}
