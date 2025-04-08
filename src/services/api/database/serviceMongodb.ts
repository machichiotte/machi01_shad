// src/services/api/database/serviceMongodb.ts
import { MongoClient, ServerApiVersion, Db, MongoError } from 'mongodb';
import { retry } from '@utils/retryUtil';
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { logger } from '@utils/loggerUtil'; // Importer notre logger

let mongoInstance: MongoClient | null = null;
let db: Db | null = null;

// Fonction pour masquer les identifiants dans l'URI pour les logs
const getSafeUri = (uri: string): string => {
  try {
    const url = new URL(uri);
    url.username = '******';
    url.password = '******';
    return url.toString();
  } catch {
    // Fallback si l'URI est mal formée
    return "mongodb+srv://******:******@uri-parsing-failed";
  }
};

export class ServiceMongodb {
  static async getMongoClient(): Promise<MongoClient> {
    const operation = 'getMongoClient';
    if (!mongoInstance) {
      const uri = `mongodb+srv://${config.databaseConfig.credentials.user}:${config.databaseConfig.credentials.password}@${config.databaseConfig.credentials.cluster}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
      const safeUri = getSafeUri(uri); // URI sans identifiants pour les logs

      logger.info(`[MongoDB] Attempting to connect...`, { operation, uri: safeUri });

      try {
        mongoInstance = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
          },
          // Ajoutez ici d'autres options si nécessaire (poolSize, timeout, etc.)
          // maxPoolSize: 50, connectTimeoutMS: 10000, socketTimeoutMS: 45000
        });

        // Écouteurs d'événements pour plus de détails (optionnel mais utile pour le debug)
        mongoInstance.on('connectionPoolCreated', event => logger.info('[MongoDB] Connection Pool Created', { operation, event }));
        mongoInstance.on('connectionPoolReady', event => logger.info('[MongoDB] Connection Pool Ready', { operation, event }));
        mongoInstance.on('connectionCreated', event => logger.debug('[MongoDB] Connection Created', { operation, event })); // Debug level car potentiellement verbeux
        mongoInstance.on('connectionClosed', event => logger.warn('[MongoDB] Connection Closed', { operation, event }));
        mongoInstance.on('connectionPoolClosed', event => logger.warn('[MongoDB] Connection Pool Closed', { operation, event }));
        mongoInstance.on('error', error => logger.error('[MongoDB] Client Error', { operation, error: error.message, stack: error.stack }));


        await mongoInstance.connect();
        logger.info('[MongoDB] Successfully connected.', { operation, uri: safeUri });

      } catch (error) {
        // handleServiceError utilise maintenant logger
        handleServiceError(
          error,
          operation,
          'Error connecting to MongoDB'
        );
        // Il est crucial de relancer l'erreur si la connexion initiale échoue
        throw error;
      }
    }
    return mongoInstance;
  }

  static async getDB(): Promise<Db> {
    const operation = 'getDB';
    if (!db) {
      const dbName = config.databaseConfig.credentials.dbName;
      logger.info(`[MongoDB] Attempting to get database instance: ${dbName}`, { operation });
      try {
        const client = await ServiceMongodb.getMongoClient(); // Assure que le client est connecté
        db = client.db(dbName);
        logger.info(`[MongoDB] Successfully got database instance: ${dbName}`, { operation });

        // Optionnel mais recommandé : Pinger pour confirmer la connexion
        try {
          const pingResult = await db.command({ ping: 1 });
          if (pingResult?.ok !== 1) throw new Error('Ping command did not return OK=1');
          logger.info(`[MongoDB] Ping successful for database: ${dbName}`, { operation, pingResult });
        } catch (pingError) {
          handleServiceError(pingError, operation, `Ping failed for database ${dbName} after getting instance`);
          // Décidez si un ping échoué est fatal ici. Probablement oui.
          throw pingError;
        }

      } catch (error) {
        handleServiceError(error, operation, 'Error getting database instance');
        // Relancer si l'obtention de l'instance DB échoue
        throw error;
      }
    }
    return db;
  }

  static async connectToMongoDB(): Promise<void> {
    const operation = 'connectToMongoDB';
    logger.info(`[MongoDB] Starting ${operation} process...`);
    try {
      await ServiceMongodb.getDB(); // Assure la connexion et l'instance DB

      const collectionsToCreate = Object.values(
        config.databaseConfig.collection ?? {} // Utiliser ?? {} au cas où config.databaseConfig.collection serait undefined
      );

      if (collectionsToCreate.length > 0) {
        logger.info(`[MongoDB] Ensuring collections exist: ${collectionsToCreate.join(', ')}`, { operation });
        await Promise.all(
          collectionsToCreate.map((collectionName) =>
            this.createCollectionIfNotExists(collectionName) // Appel de la méthode pour chaque collection
          )
        );
        logger.info(`[MongoDB] Finished checking/creating collections.`, { operation });
      } else {
        logger.info(`[MongoDB] No collections specified in config to create.`, { operation });
      }
      logger.info(`[MongoDB] ${operation} completed successfully.`);

    } catch (error) {
      // Loguer via le gestionnaire centralisé
      handleServiceError(
        error,
        operation,
        'Fatal error during MongoDB connection and setup process' // Message plus précis
      );
      // Relancer pour indiquer l'échec critique du démarrage/connexion
      throw error;
    }
  }

  static async createCollectionIfNotExists(collectionName: string): Promise<void> {
    const operation = 'createCollectionIfNotExists';
    logger.debug(`[MongoDB] Ensuring collection: ${collectionName}`, { operation });
    try {
      // Utiliser la fonction retry (supposée existante)
      await retry(
        this.createCollection.bind(this), // Important de binder 'this' si createCollection l'utilise
        [collectionName],
        operation // Contexte pour le retry
      );
      logger.debug(`[MongoDB] Collection ${collectionName} ensured.`, { operation });
    } catch (error) {
      handleServiceError(
        error,
        operation,
        `Failed to ensure collection ${collectionName} exists after retries`
      );
      // **IMPORTANT**: Si l'application ne peut pas fonctionner sans cette collection,
      // il FAUT relancer l'erreur pour arrêter le démarrage proprement.
      throw error;
    }
  }

  static async createCollection(collectionName: string): Promise<void> {
    const operation = 'createCollection';
    let dbInstance: Db | null = null; // Déclarer ici pour accès dans le catch
    try {
      dbInstance = await ServiceMongodb.getDB(); // Obtenir l'instance DB
      logger.debug(`[MongoDB] Checking existence of collection: ${collectionName}`, { operation, dbName: dbInstance.databaseName });

      // Méthode efficace pour vérifier si une collection existe
      const collections = await dbInstance.listCollections({ name: collectionName }, { nameOnly: true }).toArray();

      if (collections.length === 0) {
        logger.info(`[MongoDB] Collection ${collectionName} does not exist. Creating...`, { operation, dbName: dbInstance.databaseName });
        await dbInstance.createCollection(collectionName);
        logger.info(`[MongoDB] Collection ${collectionName} created successfully.`, { operation, dbName: dbInstance.databaseName });
      } else {
        logger.debug(`[MongoDB] Collection ${collectionName} already exists.`, { operation, dbName: dbInstance.databaseName });
      }
    } catch (error) {
      // Gérer les erreurs spécifiques de MongoDB si nécessaire
      if (error instanceof MongoError && error.code === 48) { // NamespaceExists code
        logger.warn(`[MongoDB] Attempted to create collection ${collectionName} but it already exists (caught race condition).`, { operation, dbName: dbInstance?.databaseName });
        // Dans ce cas spécifique (race condition), on peut souvent ignorer l'erreur.
        // Ne pas relancer ici.
      } else {
        handleServiceError(
          error,
          operation,
          `Error checking or creating collection ${collectionName}`
        );
        // **IMPORTANT** (Comme ci-dessus): Relancer si c'est critique.
        throw error;
      }
    }
  }

  // **NOUVEAU** : Méthode pour fermer la connexion proprement
  static async disconnect(): Promise<void> {
    const operation = 'disconnect';
    if (mongoInstance) {
      logger.info('[MongoDB] Closing connection...', { operation });
      try {
        await mongoInstance.close();
        mongoInstance = null;
        db = null; // Réinitialiser aussi l'instance db
        logger.info('[MongoDB] Connection closed successfully.', { operation });
      } catch (error) {
        handleServiceError(error, operation, 'Error closing MongoDB connection');
        // Ne pas relancer ici pour permettre à l'application de quitter même si la fermeture échoue.
      }
    } else {
      logger.info('[MongoDB] No active connection to close.', { operation });
    }
  }
}