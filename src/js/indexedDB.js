// indexedDB.js
const INDEXED_DB_NAME = 'db_test_1';
const INDEXED_DB_VERSION = 1;

const CMC = 'cmc';
const BALANCE = 'balance';
const ORDERS = 'orders';
const TRADES = 'trades';
const STRATEGY = 'strategy';
const TICKERS = 'tickers';

const openDatabase = async () => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log('Upgrade needed!');

            // Créez un object store pour stocker les données de crypto (CMC)
            if (!db.objectStoreNames.contains(CMC)) {
                db.createObjectStore(CMC, { keyPath: 'cmc_rank' });
            }

            if (!db.objectStoreNames.contains(BALANCE)) {
                db.createObjectStore(BALANCE, { keyPath: '_id' });
            }

            if (!db.objectStoreNames.contains(ORDERS)) {
                db.createObjectStore(ORDERS, { keyPath: '_id' });
            }

            if (!db.objectStoreNames.contains(TRADES)) {
                db.createObjectStore(TRADES, { keyPath: '_id' });
            }

            if (!db.objectStoreNames.contains(STRATEGY)) {
                db.createObjectStore(STRATEGY, { keyPath: 'asset' });
            }

            if (!db.objectStoreNames.contains(TICKERS)) {
                db.createObjectStore(TICKERS, { keyPath: '_id' });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('openDatabase onsuccess', db);
            resolve(db);
        };
    });
};

const saveDataToIndexedDBInternal = async (storeName, data, keyField, filterExchange) => {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const shouldFilterExchange = filterExchange !== null && filterExchange !== undefined;

        if (!shouldFilterExchange) {
            console.log('clearObjectStore');

            await clearObjectStore(objectStore);
        } else {
            console.log('clearObjectStoreByExchange');

            await clearObjectStoreByExchange(objectStore, filterExchange);
        }

        if (data && data.length > 0) {
            data.forEach((item) => {
                //console.log('item', item);
                if (isValidItem(item, keyField)) {

                    const itemToSave = createItemToSave(item, keyField);

                    //console.log('itemToSave',itemToSave);

                    if (shouldFilterExchange && itemToSave['platform'] !== filterExchange) {
                        console.log(`Skipping item with platform ${itemToSave['platform']}.`);
                        return;
                    }

                    objectStore.put(itemToSave);
                } else {
                    console.error(`Skipping object without a valid ${keyField}:`, item);
                }
            });

            console.log(`Data saved to IndexedDB for ${storeName}`);
        } else {
            console.log(`No data saved to IndexedDB for ${storeName}`);
        }
    } catch (error) {
        console.error(`Error saving data to IndexedDB for ${storeName}:`, error);
    }
};

const clearObjectStore = (objectStore) => {
    return new Promise((resolve, reject) => {
        const clearRequest = objectStore.clear();

        clearRequest.onsuccess = () => {
            console.log('Object store cleared.');
            resolve();
        };

        clearRequest.onerror = (error) => {
            console.error('Error clearing data from object store:', error);
            reject(error);
        };
    });
};

const clearObjectStoreByExchange = (objectStore, filterExchange) => {
    return new Promise((resolve, reject) => {
        const clearRequest = objectStore.openCursor();

        clearRequest.onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor) {
                const item = cursor.value;

                if (item && item.platform === filterExchange) {
                    const deleteRequest = cursor.delete();

                    deleteRequest.onsuccess = () => {
                        console.log('Element deleted:', item);
                    };

                    deleteRequest.onerror = (error) => {
                        console.error('Error deleting element:', error);
                        reject(error);
                    };
                }

                cursor.continue();
            } else {
                console.log('Cursor has reached the end of the object store.');
                resolve();
            }
        };

        clearRequest.onerror = (error) => {
            console.error('Error opening cursor:', error);
            reject(error);
        };
    });
};

const isValidItem = (item, keyField) => {
    return item && item[keyField] !== undefined && item[keyField] !== null;
};

const createItemToSave = (item, keyField) => {
    return {
        [keyField]: item[keyField],
        ...item, // Copie des autres propriétés
    };
};


const saveCmcToIndexedDB = async (data) => {
    await saveDataToIndexedDBInternal(CMC, data, 'cmc_rank', null);
};

const saveOrdersDataToIndexedDB = async (data, exchange) => {
    await saveDataToIndexedDBInternal(ORDERS, data, '_id', exchange);
};

const saveBalancesDataToIndexedDB = async (data, exchange) => {
    console.log('saveBalancesDataToIndexedDB');
    await saveDataToIndexedDBInternal(BALANCE, data, '_id', exchange);
};

const saveTradesDataToIndexedDB = async (data) => {
    console.log('saveTradesDataToIndexedDB');
    await saveDataToIndexedDBInternal(TRADES, data, '_id', null);
};

const saveStrategyToIndexedDB = async (data) => {
    console.log('saveStrategyToIndexedDB');
    await saveDataToIndexedDBInternal(STRATEGY, data, 'asset', null);
};

const saveTickersToIndexedDB = async (data) => {
    console.log('saveTickersToIndexedDB');
    await saveDataToIndexedDBInternal(TICKERS, data, '_id', null);
};

const fetchDataFromIndexedDB = async (storeName) => {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                const data = event.target.result;
                console.log(`Data fetched from ${storeName} in IndexedDB.`);
                resolve(data);
            };

            request.onerror = (event) => {
                console.error(`Error fetching data from ${storeName} in IndexedDB:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error fetching data from IndexedDB:', error);
        throw error;
    }
};

export { openDatabase, fetchDataFromIndexedDB, saveCmcToIndexedDB, saveStrategyToIndexedDB, saveOrdersDataToIndexedDB, saveBalancesDataToIndexedDB, saveTradesDataToIndexedDB, saveTickersToIndexedDB };