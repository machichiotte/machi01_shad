import { fetchDataFromIndexedDB, saveTickersToIndexedDB, saveBalancesDataToIndexedDB, saveStrategyToIndexedDB, saveTradesDataToIndexedDB, saveOrdersDataToIndexedDB, saveCmcToIndexedDB } from "../js/indexedDB"

const serverHost = process.env.VUE_APP_SERVER_HOST;
const CMC = 'cmc';
const CONVERTER = 'converter';
const STRATEGY = 'strategy';
const BALANCE = "balance";
const TRADES = "trades";
const ORDERS = 'orders';
const LAST_UPDATE = "lastUpdate";
const TICKERS = "tickers";

const getConvertedCsv = async (formData) => {
    const ENDPOINT = `${serverHost}/${CONVERTER}/post`;

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
    const ENDPOINT = `${serverHost}/${STRATEGY}/get`;

    try {
        const items = await fetchDataWithCache(STRATEGY, ENDPOINT, saveStrategyToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getTickers = async () => {
    const ENDPOINT = `${serverHost}/${TICKERS}/get`;

    console.log('getTickers');
    try {
        const items = await fetchDataWithCache(TICKERS, ENDPOINT, saveTickersToIndexedDB);
        console.log('getTickers items', items);

        return items;
    } catch (err) {
        console.error(err);
    }
}

const getTickersByExchange = async (exchangeId) => {
    const ENDPOINT = `${serverHost}/${TICKERS}/get/${exchangeId}`;

    try {
        const items = await fetchDataWithCache(TICKERS, ENDPOINT, saveTickersToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getTickersBySymbolAndExchange = async (exchangeId, symbol) => {
    const ENDPOINT = `${serverHost}/${TICKERS}/get/${exchangeId}`;

    try {
        const items = await fetchDataWithCache(TICKERS, ENDPOINT, saveTickersToIndexedDB);

        const itemsBySymbol = items.find(item => item.symbol === symbol);

        return itemsBySymbol;
    } catch (err) {
        console.error(err);
    }
}

const getCmc = async () => {
    const ENDPOINT = `${serverHost}/${CMC}/get`;

    try {
        const items = await fetchDataWithCache(CMC, ENDPOINT, saveCmcToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getBalances = async () => {
    const ENDPOINT = `${serverHost}/${BALANCE}/get`;

    try {
        const items = await fetchDataWithCache(BALANCE, ENDPOINT, saveBalancesDataToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getTrades = async () => {
    const ENDPOINT = `${serverHost}/${TRADES}/get`;

    try {
        const items = await fetchDataWithCache(TRADES, ENDPOINT, saveTradesDataToIndexedDB);
        return items;
    } catch (err) {
        console.error(err);
    }
}

const getOrders = async () => {
    const ENDPOINT = `${serverHost}/${ORDERS}/get`;

    try {
        const items = await fetchDataWithCache(ORDERS, ENDPOINT, saveOrdersDataToIndexedDB);
        return items;
    } catch (err) {
        console.error("Erreur lors de la récupération des ordres actifs :", err);
    }
}

const cancelOrder = async (item) => {
    try {
        const response = await fetch(`${serverHost}/${ORDERS}/cancel?exchangeId=${item.platform}&oId=${item.oId}&symbol=${item.symbol}`);
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
    const collection = await fetch(`${serverHost}/${LAST_UPDATE}/get`);

    console.log('collect', collection);

    // Fonction générique pour mettre à jour les données pour un type donné
    const updateData = async (type, exchange, refreshValue) => {
        console.log('shouldFetchFromServer exchange', exchange);
        const timestamp = collection[type][exchange];

        if (timestamp === undefined || currentTimestamp - timestamp > refreshValue) {
            try {
                await fetch(`${serverHost}/${LAST_UPDATE}/update/${type}/${exchange}`);
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
        cmc: 6 * 60 * 60 * 1000,
        trades: 6 * 60 * 60 * 1000,
        orders: 6 * 60 * 60 * 1000,
        balance: 6 * 60 * 60 * 1000,
        strategy: 6 * 60 * 60 * 1000,
        tickers: 24 * 60 * 60 * 1000,
    };

    // Mettre à jour les données pour chaque type spécifié dans le tableau "types"
    for (const type of types) {
        const refreshValue = refreshValues[type];

        if (type === CMC || type == STRATEGY || type == TICKERS) {
            const timestamp = collection[type];
            console.log('currentTimestamp', currentTimestamp);
            console.log('timestamp', timestamp);
            if (timestamp === undefined || currentTimestamp - timestamp > refreshValue) {
                try {
                    await fetch(`${serverHost}/${LAST_UPDATE}/update/${type}`);
                    console.log(`Mise à jour réussie pour ${type}. Nouveau timestamp : ${currentTimestamp}`);
                } catch (err) {
                    console.error(`Erreur lors de la mise à jour pour ${type}: ${err}`);
                }
            } else {
                console.log(`Pas besoin de mise à jour pour ${type}. Timestamp actuel : ${timestamp}`);
            }
        } else {
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

export { getConvertedCsv, cancelOrder, getStrategy, getCmc, getBalances, getTrades, getOrders, getTickers, getTickersByExchange, getTickersBySymbolAndExchange };
