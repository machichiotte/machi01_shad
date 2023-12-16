// indexedDB.js
const INDEXED_DB_NAME = 'db_test_7';
const INDEXED_DB_VERSION = 5;
const serverHost = process.env.VUE_APP_SERVER_HOST;

const CMC = 'cmcData';
const BALANCE = 'balances';
const ACTIVE_ORDERS = 'activeOrders';
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

            if (!db.objectStoreNames.contains(ACTIVE_ORDERS)) {
                console.log('create activeOrders');
                db.createObjectStore(ACTIVE_ORDERS, { keyPath: 'oId' });
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

const saveActiveOrdersDataToIndexedDB = async (data) => {
    await saveDataToIndexedDB(ACTIVE_ORDERS, data, '_id');
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

//async shouldFetchFromServer(types) {
    //TODO CHECK AVEC INDEXEDDB plutot que call server a chaque fois
const shouldFetchFromServer = async (types) => {
    const currentTimestamp = Date.now();
    const collection = await fetch(`${serverHost}/get/lastUpdate/`);

    // Fonction générique pour mettre à jour les données pour un type donné
    const updateData = async (type, exchange, refreshValue) => {
        const timestamp = collection[type][exchange];

        if (currentTimestamp - timestamp > refreshValue) {
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
        activeOrders: 6 * 60 * 60 * 1000,
        balance: 6 * 60 * 60 * 1000,
    };

    // Mettre à jour les données pour chaque type spécifié dans le tableau "types"
    for (const type of types) {
        const refreshValue = refreshValues[type];

        if (type === CMC) {
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
const fetchDataWithCache = async(dataType, apiEndpoint, saveToIndexedDBFunction) => {
    try {
      const shouldFetch = await shouldFetchFromServer([dataType]);
  
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

export { openDatabase, fetchDataWithCache, fetchDataFromIndexedDB, saveCmcDataToIndexedDB, saveActiveOrdersDataToIndexedDB, saveBalancesDataToIndexedDB, saveTradesDataToIndexedDB };