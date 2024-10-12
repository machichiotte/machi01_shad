// src/js/server/common.ts
import { ApiResponse } from '../../types/response';

const serverHost: string = import.meta.env.VITE_SERVER_HOST as string; // Centralisation de serverHost

// Fonction utilitaire pour traiter la réponse
const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    const jsonResponse = (await response.json()) as ApiResponse<T>;
    if (!response.ok || jsonResponse.status !== 'success') {
        throw new Error(jsonResponse.error || `Failed request with status ${response.status}`);
    }

    console.log('handleApiResponse', jsonResponse.message) //IMPORTANT POUR LES BUGS

    return jsonResponse;
};

// Fonction pour envoyer une requête HTTP (POST)
const executeApiRequest = async <T>(
    endpoint: string,
    requestBody: Record<string, unknown>,  // Plus précis que "Object"
    method: string = 'POST'
): Promise<T> => {
    try {
        const response = await fetch(`${serverHost}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const jsonResponse = await handleApiResponse<T>(response); // Réutilisation de handleApiResponse
        return jsonResponse.data as T;
    } catch (error) {
        throw new Error(`Error during ${method} request to ${serverHost}${endpoint}: ${error}`);
    }
};

// Fonction générique pour récupérer les données (GET)
const fetchApiData = async <T>(endpoint: string): Promise<T> => {
    try {
        const response = await fetch(`${serverHost}${endpoint}`);
        const jsonResponse = await handleApiResponse<T>(response); // Réutilisation ici aussi
        return jsonResponse.data as T;
    } catch (error) {
        throw new Error(`Error fetching data from ${serverHost}${endpoint}: ${error}`);
    }
};

export { executeApiRequest, fetchApiData };
