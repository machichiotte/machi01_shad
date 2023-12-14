// indexedDB.js

const openDatabase = async () => {
    return new Promise((resolve, reject) => {
        //const request = window.indexedDB.open(process.env.INDEXED_DB_NAME, process.env.INDEXED_DB_VERSION);
        const request = window.indexedDB.open('db_test_4', 1);

        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            console.log('onupgradeneeded!');

            const db = event.target.result;
            console.log('Upgrade needed!');

            // Créez un object store pour stocker les données de crypto (CMC)
            if (!db.objectStoreNames.contains('cryptoData')) {
                console.log('create cryptoData');
                db.createObjectStore('cryptoData', { keyPath: 'id' });
            }

            // Ajoutez d'autres objets de magasin d'objets au besoin

            // Créez vos objets de magasin d'objets ici pour chaque feuille de base de données
            // Par exemple, pour les balances
            /*
                  if (!db.objectStoreNames.contains('balances')) {
                    db.createObjectStore('balances', { keyPath: 'symbol' });
                  }
            */

        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('db sucess ' + db);
            resolve(db);
        };
    });
};



const saveCryptoDataToIndexedDB = async (storeName, cryptoData) => {
    console.log('saveCryptoDataToIndexedDB');
    try {
        const db = await openDatabase();
        console.log('dbdbdb :: ' + db);

        // Afficher les noms des object stores présents dans la base de données
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
            cryptoData.forEach((crypto) => {
                // Assurez-vous que la propriété 'id' existe et a une valeur
                if (crypto && crypto.id !== undefined && crypto.id !== null) {
                    // Créez un nouvel objet avec les propriétés spécifiques que vous souhaitez enregistrer
                    const cryptoToSave = {
                        id: crypto.id,
                        symbol: crypto.symbol,
                        name: crypto.name,
                    };
            
                    objectStore.put(cryptoToSave);
                } else {
                    console.error('Skipping object without a valid id:', crypto);
                }
            });

            console.log('Crypto data saved to IndexedDB');
        };

        clearRequest.onerror = (error) => {
            console.error('Error clearing data from object store:', error);
        };
    } catch (error) {
        console.error('Error saving crypto data to IndexedDB:', error);
    }
};





const saveDataToIndexedDB = async (storeName, data) => {
    try {
        const db = await openDatabase(); // Assuming openDatabase returns the database instance

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');

            // If the object store does not exist, create it
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
                // db.createObjectStore(storeName, { keyPath: 'yourKeyField' });
            }

            const objectStore = transaction.objectStore(storeName);

            // Clear existing data in the object store
            const clearRequest = objectStore.clear();
            clearRequest.onsuccess = () => {
                // Add the new data
                const addRequest = objectStore.add(data);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = (error) => reject(error);
            };

            clearRequest.onerror = (error) => reject(error);

            transaction.oncomplete = () => resolve();
            transaction.onerror = (error) => reject(error);
        });
    } catch (error) {
        console.error('Error opening database:', error);
        throw error;
    }
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




export { openDatabase, saveDataToIndexedDB, fetchDataFromIndexedDB, saveCryptoDataToIndexedDB };