// indexedDB.js
const INDEXED_DB_NAME = 'db_test_8';
const INDEXED_DB_VERSION = 2;

const CMC = 'cmcData';
const BALANCE = 'balance';
const ORDERS = 'orders';
const TRADES = 'trades';

const openDatabase = async () => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            console.log('onupgradeneeded!');

            const db = event.target.result;
            console.log('Upgrade needed!');

            // Créez un object store pour stocker les données de crypto (CMC)
            if (!db.objectStoreNames.contains(CMC)) {
                console.log('create cmcData');
                db.createObjectStore(CMC, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(BALANCE)) {
                console.log('create balances');
                db.createObjectStore(BALANCE, { keyPath: '_id' });
            }

            if (!db.objectStoreNames.contains(ORDERS)) {
                console.log('create orders');
                db.createObjectStore(ORDERS, { keyPath: '_id' });
            }

            if (!db.objectStoreNames.contains(TRADES)) {
                console.log('create trades');
                db.createObjectStore(TRADES, { keyPath: '_id' });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('db sucess ' + db);
            resolve(db);
        };
    });
};

const saveDataToIndexedDB = async (storeName, data, keyField) => {
    console.log(`saveDataToIndexedDB for ${storeName}`);
    try {
        const db = await openDatabase();

        console.log('Object Stores:', db.objectStoreNames);

        const transaction = await db.transaction([storeName], 'readwrite');

        transaction.oncomplete = () => {
            console.log('Transaction completed.');
        };

        transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
        };

        const objectStore = transaction.objectStore(storeName);

        // Clear all existing data in the object store
        const clearRequest = objectStore.clear();

        clearRequest.onsuccess = () => {
            // Serialize and add new data
            data.forEach((item) => {
                // Ensure that the key field exists and has a value
                if (item && item[keyField] !== undefined && item[keyField] !== null) {
                    const itemToSave = {};

                    // Create a new object with the specified key field and other properties
                    itemToSave[keyField] = item[keyField];

                    // Add other properties to the object
                    for (const prop in item) {
                        if (prop !== keyField) {
                            itemToSave[prop] = item[prop];
                        }
                    }

                    objectStore.put(itemToSave);
                } else {
                    console.error(`Skipping object without a valid ${keyField}:`, item);
                }
            });

            console.log(`Data saved to IndexedDB for ${storeName}`);
        };

        clearRequest.onerror = (error) => {
            console.error('Error clearing data from object store:', error);
        };
    } catch (error) {
        console.error(`Error saving data to IndexedDB for ${storeName}:`, error);
    }
};

const saveCmcDataToIndexedDB = async (data) => {
    await saveDataToIndexedDB(CMC, data, 'id');
};

const saveOrdersDataToIndexedDB = async (data) => {
    await saveDataToIndexedDB(ORDERS, data, '_id');
};

const saveBalancesDataToIndexedDB = async (data) => {
    await saveDataToIndexedDB(BALANCE, data, '_id');
};

const saveTradesDataToIndexedDB = async (data) => {
    await saveDataToIndexedDB(TRADES, data, '_id');
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

export { openDatabase, fetchDataFromIndexedDB, saveCmcDataToIndexedDB, saveOrdersDataToIndexedDB, saveBalancesDataToIndexedDB, saveTradesDataToIndexedDB };