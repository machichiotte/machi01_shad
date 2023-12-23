import { fetchDataFromIndexedDB, saveBalancesDataToIndexedDB, saveStrategyToIndexedDB, saveTradesDataToIndexedDB, saveOrdersDataToIndexedDB, saveCmcDataToIndexedDB } from "../js/indexedDB"

const serverHost = process.env.VUE_APP_SERVER_HOST;
const CMC = 'cmcData';
const STRATEGY = 'strategy';

const getConvertedCsv = async (formData) => {
    const DATA_TYPE = "converter";
    const ENDPOINT = `${serverHost}/post/${DATA_TYPE}`;

    console.log('getter getConvertedCsv formData', formData.get('csvFile'));
    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Échec de la requête au serveur");
        }

        const data = await response.json();
        console.log("getter getConvertedCsv data", data);
        return data;
    } catch (err) {
        console.error("Erreur lors de la suppression de l'ordre :", err);
        // Affichez un message d'erreur à l'utilisateur si nécessaire
    }
};

const getStrategy = async () => {
    const DATA_TYPE = "strategy";
    const ENDPOINT = `${serverHost}/get/${DATA_TYPE}`;

    try {
        const items = await fetchDataWithCache(DATA_TYPE, ENDPOINT, saveStrategyToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getCmcData = async () => {
    const DATA_TYPE = "cmcData";
    const ENDPOINT = `${serverHost}/get/${DATA_TYPE}`;

    try {
        const items = await fetchDataWithCache(DATA_TYPE, ENDPOINT, saveCmcDataToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getBalances = async () => {
    const DATA_TYPE = "balance";
    const ENDPOINT = `${serverHost}/get/${DATA_TYPE}`;

    try {
        const items = await fetchDataWithCache(DATA_TYPE, ENDPOINT, saveBalancesDataToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getTrades = async () => {
    const DATA_TYPE = "trades";
    const ENDPOINT = `${serverHost}/get/${DATA_TYPE}`;

    try {
        const items = await fetchDataWithCache(DATA_TYPE, ENDPOINT, saveTradesDataToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getOrders = async () => {
    const DATA_TYPE_ACTIVE_ORDERS = 'orders';
    const ENDPOINT = `${serverHost}/get/${DATA_TYPE_ACTIVE_ORDERS}`;

    try {
        const items = await fetchDataWithCache(DATA_TYPE_ACTIVE_ORDERS, ENDPOINT, saveOrdersDataToIndexedDB);
        return items;
    } catch (err) {
        console.error("Erreur lors de la récupération des ordres actifs :", err);
    }
}

const cancelOrder = async (item) => {
    try {
        const response = await fetch(`${serverHost}/deleteOrder?exchangeId=${item.platform}&oId=${item.oId}&symbol=${item.symbol}`);
        const data = await response.json();
        console.log("cancelOrder data.code :: ", data.code);
    } catch (err) {
        console.error("Erreur lors de la suppression de l'ordre :", err);
        // Affichez un message d'erreur à l'utilisateur si nécessaire
    }
}

const shouldFetchFromServer = async (types) => {
    console.log('shouldFetchFromServer types', types);
    const currentTimestamp = Date.now();
    const collection = await fetch(`${serverHost}/get/lastUpdate/`);

    // Fonction générique pour mettre à jour les données pour un type donné
    const updateData = async (type, exchange, refreshValue) => {
        console.log('shouldFetchFromServer exchange', exchange);
        const timestamp = collection[type][exchange];

        if (timestamp === undefined || currentTimestamp - timestamp > refreshValue) {
            try {
                await fetch(`${serverHost}/update/${type}/${exchange}`);
                console.log(`Mise à jour réussie pour ${exchange}. Nouveau timestamp : ${currentTimestamp}`);
            } catch (err) {
                console.error(`Erreur lors de la mise à jour pour ${exchange}: ${err}`);
            }
        } else {
            console.log(`Pas besoin de mise à jour pour ${exchange}. Timestamp actuel : ${timestamp}`);
        }
    };

    // Définir les valeurs de rafraîchissement pour chaque type
    const refreshValues = {
        cmcData: 6 * 60 * 60 * 1000,
        trades: 6 * 60 * 60 * 1000,
        orders: 6 * 60 * 60 * 1000,
        balance: 6 * 60 * 60 * 1000,
        strategy: 6 * 60 * 60 * 1000,
    };

    // Mettre à jour les données pour chaque type spécifié dans le tableau "types"
    for (const type of types) {
        const refreshValue = refreshValues[type];

        if (type === CMC || type == STRATEGY) {
            // Mettez en œuvre la logique spécifique pour "cmc"
            const timestamp = collection[type];
            if (currentTimestamp - timestamp > refreshValue) {
                try {
                    await fetch(`${serverHost}/update/${type}`);
                    console.log(`Mise à jour réussie pour ${type}. Nouveau timestamp : ${currentTimestamp}`);
                } catch (err) {
                    console.error(`Erreur lors de la mise à jour pour ${type}: ${err}`);
                }
            } else {
                console.log(`Pas besoin de mise à jour pour ${type}. Timestamp actuel : ${timestamp}`);
            }
        } else {
            // Pour les autres types, procédez comme auparavant
            for (const exchange in collection[type]) {
                if (Object.prototype.hasOwnProperty.call(collection[type], exchange)) {
                    await updateData(type, exchange, refreshValue);
                }
            }
        }
    }
}

// Create a generic method for fetching data
const fetchDataWithCache = async (dataType, apiEndpoint, saveToIndexedDBFunction) => {
    console.log('fetchDataWithCache datatype', dataType);
    try {
        const shouldFetch = await shouldFetchFromServer([dataType]);

        console.log('fetchDataWithCache shouldFetch', shouldFetch);

        if (shouldFetch) {
            const response = await fetch(apiEndpoint);
            const data = await response.json();

            // Save the data to IndexedDB
            await saveToIndexedDBFunction(data);

            return data;
        } else {
            // Use the data from IndexedDB
            const indexedDBData = await fetchDataFromIndexedDB(dataType);

            if (indexedDBData && indexedDBData.length > 0) {
                return indexedDBData;
            } else {
                console.log(`No data available in IndexedDB for ${dataType}. Triggering a new server request.`);
                const response = await fetch(apiEndpoint);
                const data = await response.json();

                // Save the data to IndexedDB
                await saveToIndexedDBFunction(data);

                return data;
            }
        }
    } catch (err) {
        console.error(`Error fetching ${dataType} data: ${err}`);
        throw err;
    }
}

export { getConvertedCsv, cancelOrder, getStrategy, getCmcData, getBalances, getTrades, getOrders };
