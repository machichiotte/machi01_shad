// src/services/api/database/serviceDatabase.ts
import { Document, Filter, UpdateFilter } from 'mongodb'; // Added specific MongoDB types
import { retry } from '@utils/retryUtil';
import { getMockedData } from '@utils/mockUtil';
import { handleServiceError } from '@utils/errorUtil'; // Added formatErrorForLog if needed later
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp';
import { mongodbOperations } from '@services/api/database/serviceMongodbOperations';
import { ServiceCache } from '@services/serviceCache';
import { InsertData } from '@typ/trade';
import { PLATFORM } from '@typ/platform';
import { MappedData } from '@typ/database';
import { CacheItem } from '@typ/mongodb'; 
import { config } from '@config/index';
import path from 'path'; import { logger } from '@utils/loggerUtil';

export class ServiceDatabase {
  /**
   * Inserts one or multiple documents into a specified collection.
   * @param collectionName - The name of the collection.
   * @param data - A single document or an array of documents to insert.
   * @returns A promise resolving to the result of the insert operation.
   */
  static async insertDocuments(collectionName: string, data: Document | Document[]): Promise<InsertData> {
    const operation = 'insertDocuments';
    const context = { module: path.parse(__filename).name, operation: 'insertDocuments', collectionName };
    //logger.debug(`Début insertDocuments`, context);

    try {
      // Basic type check (already handled by TS, but good practice)
      if (!data || (Array.isArray(data) && data.length === 0)) {
        logger.warn('No data provided for insertion.', context);
        // Depending on requirements, might return a specific result or throw
        // For now, assume empty array insertMany is handled by mongodbOperations or retry
      }

      let result: InsertData;
      if (Array.isArray(data)) {
        //logger.debug(`Inserting ${data.length} documents...`, { ...context, count: data.length });
        result = await retry(mongodbOperations.insertMany, [collectionName, data], operation);
      } else {
        //logger.debug(`Inserting 1 document...`, { ...context, count: 1 });
        result = await retry(mongodbOperations.insertOne, [collectionName, data], operation);
      }
      //logger.debug(`Fin ${operation} - Succès`, { ...context, insertedCount: Array.isArray(data) ? data.length : 1 });
      return result;
    } catch (error) {
      // handleServiceError already logs the error details
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de l'insertion dans ${collectionName}`);
      throw error; // Re-throw the error to be handled upstream
    }
  }

  /**
   * Finds all documents in a specified collection.
   * @param collectionName - The name of the collection.
   * @returns A promise resolving to an array of documents.
   */
  static async findAllDocuments(collectionName: string): Promise<Document[]> {
    const operation = 'findAllDocuments';
    //const context = { module: path.parse(__filename).name, operation, collectionName };
    //logger.debug(`Début ${operation}`, context);

    try {
      const docs = await retry(mongodbOperations.find, [collectionName, {}], operation);
      //logger.debug(`Fin ${operation} - ${docs.length} document(s) récupéré(s)`, { ...context, count: docs.length });
      return docs;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la récupération de tous les documents dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Finds a single document matching the query in a specified collection.
   * @param collectionName - The name of the collection.
   * @param query - The MongoDB filter query.
   * @returns A promise resolving to the found document or null.
   */
  static async findSingleDocument(collectionName: string, query: Filter<Document>): Promise<Document | null> {
    const operation = 'findSingleDocument';
    //const context = { module: path.parse(__filename).name, operation, collectionName, query }; // Log the query
    //logger.debug(`Début ${operation}`, context);

    try {
      const doc = await retry(mongodbOperations.findOne, [collectionName, query], operation);
      //logger.debug(`Fin ${operation} - Document ${doc ? 'trouvé' : 'non trouvé'}`, { ...context, found: !!doc });
      return doc;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la récupération d'un document dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Deletes a single document matching the filter in a specified collection.
   * @param collectionName - The name of the collection.
   * @param filter - The MongoDB filter query.
   * @returns A promise resolving to true if a document was deleted, false otherwise.
   */
  static async deleteSingleDocument(collectionName: string, filter: Filter<Document>): Promise<boolean> {
    const operation = 'deleteSingleDocument';
    //const context = { module: path.parse(__filename).name, operation, collectionName, filter }; // Log the filter
    //logger.debug(`Début ${operation}`, context);

    try {
      const success = await retry(mongodbOperations.deleteOne, [collectionName, filter], operation);
      //logger.debug(`Fin ${operation} - Succès: ${success}`, { ...context, success });
      return success;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la suppression d'un document dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Deletes multiple documents matching the filter in a specified collection.
   * @param collectionName - The name of the collection.
   * @param filter - The MongoDB filter query.
   * @returns A promise resolving to the number of documents deleted.
   */
  static async deleteDocuments(collectionName: string, filter: Filter<Document>): Promise<number> {
    const operation = 'deleteDocuments';
    //const context = { module: path.parse(__filename).name, operation, collectionName, filter }; // Log the filter
    //logger.debug(`Début ${operation}`, context);

    try {
      const count = await retry(mongodbOperations.deleteMany, [collectionName, filter], operation);
      //logger.debug(`Fin ${operation} - ${count} document(s) supprimé(s)`, { ...context, count });
      return count;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la suppression de documents dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Deletes all documents in a specified collection.
   * @param collectionName - The name of the collection.
   * @returns A promise resolving to the number of documents deleted.
   */
  static async deleteAllDocuments(collectionName: string): Promise<number> {
    const operation = 'deleteAllDocuments';
    //const context = { module: path.parse(__filename).name, operation, collectionName };
    //logger.debug(`Début ${operation}`, context);

    try {
      // Use an empty filter {} to delete all
      const count = await retry(mongodbOperations.deleteMany, [collectionName, {}], operation);
      //logger.debug(`Fin ${operation} - ${count} document(s) supprimé(s)`, { ...context, count });
      return count;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la suppression de tous les documents dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Updates a single document matching the filter in a specified collection.
   * @param collectionName - The name of the collection.
   * @param filter - The MongoDB filter query.
   * @param update - The MongoDB update operation document.
   * @returns A promise resolving to true if a document was modified, false otherwise.
   */
  static async updateDocument(collectionName: string, filter: Filter<Document>, update: UpdateFilter<Document>): Promise<boolean> {
    const operation = 'updateDocument';
    //const context = { module: path.parse(__filename).name, operation, collectionName, filter };
    //logger.debug(`Début ${operation}`, context);

    try {
      const success = await retry(mongodbOperations.updateOne, [collectionName, filter, update], operation);
      //logger.debug(`Fin ${operation} - Succès: ${success}`, { ...context, success });
      return success;
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la mise à jour des données dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Replaces documents in a collection, optionally filtering by platform.
   * Deletes existing documents (matching platform filter or all) before inserting new ones.
   * @param collectionName - The name of the collection.
   * @param mapData - An array of documents to insert (should not contain _id).
   * @param platform - Optional platform to filter deletions. If omitted, all documents are deleted.
   */
  static async replaceDocuments(collectionName: string, mapData: Omit<MappedData, '_id'>[], platform?: PLATFORM): Promise<void> {
    const operation = 'replaceDocuments';
    const context = { module: path.parse(__filename).name, operation, collectionName, platform: platform ?? 'all', incomingDataCount: mapData?.length ?? 0 };
    //logger.debug(`Début ${operation}`, context);

    try {
      if (mapData && mapData.length > 0) {
        let deletedCount = 0;
        if (!platform) {
          //logger.debug(`Deleting all documents in ${collectionName}...`, context);
          deletedCount = await this.deleteAllDocuments(collectionName); // Use internal method which includes logging/retry
        } else {
          const deleteFilter: Filter<Document> = { platform };
          //logger.debug(`Deleting documents for platform ${platform} in ${collectionName}...`, { ...context, filter: deleteFilter });
          deletedCount = await this.deleteDocuments(collectionName, deleteFilter); // Use internal method
        }
        logger.info(`${deletedCount} document(s) deleted. Inserting ${mapData.length} new document(s)...`, { ...context, deletedCount });
        // Assuming mapData elements are compatible with Document type
        await this.insertDocuments(collectionName, mapData as Document[]); // Use internal method
      } else {
        //logger.debug('No data provided, skipping delete and insert.', context);
      }
      //logger.debug(`Fin ${operation} - Succès`, context);
    } catch (error) {
      // Let errors from deleteAllDocuments/deleteDocuments/insertDocuments propagate
      // Add specific handling here only if needed beyond what handleServiceError does
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors du remplacement des documents dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Saves documents to a collection and updates the timestamp for the given category/platform.
   * Uses replaceDocuments internally.
   * @param data - An array of documents to save (should not contain _id).
   * @param collectionName - The name of the collection.
   * @param tsCategory - The category name for timestamp tracking.
   * @param platform - Optional platform filter for replacement and timestamping.
   */
  static async saveDocumentsWithTimestamp(
    data: Omit<MappedData, '_id'>[],
    collectionName: string,
    tsCategory: string,
    platform?: PLATFORM
  ): Promise<void> {
    const operation = 'saveDocumentsWithTimestamp';
    //const context = { module: path.parse(__filename).name, operation, collectionName, tsCategory, platform: platform ?? 'all', dataCount: data?.length ?? 0 };
    //logger.debug(`Début ${operation}`, context);

    try {
      // replaceDocuments handles logging for its part
      await ServiceDatabase.replaceDocuments(collectionName, data, platform);
      // ServiceTimestamp.saveTimestampToDatabase should handle its own logging/errors
      await ServiceTimestamp.saveTimestampToDatabase(tsCategory, platform);
      //logger.debug(`Fin ${operation} - Succès`, context);
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la sauvegarde des documents dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Retrieves all documents from a collection, using cache if available and valid,
   * or fetching from the database otherwise. Handles offline mode.
   * @param collectionName - The name of the collection.
   * @returns A promise resolving to an array of MappedData documents.
   */
  static async getCollectionDocuments(collectionName: string): Promise<MappedData[]> {
    const operation = 'getCollectionDocuments';
    //const context = { module: path.parse(__filename).name, operation, collectionName };
    //logger.debug(`Début ${operation}`, context);

    try {
      if (config.isOffline) {
        //logger.debug('Mode offline activé, récupération des données mockées.', context);
        // Assuming getMockedData returns data compatible with MappedData[]
        const mockedData = await getMockedData(collectionName);
        //logger.debug(`Fin ${operation} - Données mockées récupérées (${mockedData?.length ?? 0})`, { ...context, count: mockedData?.length ?? 0, source: 'mock' });
        // Ensure it returns an array even if mock is empty/null
        return (Array.isArray(mockedData) ? mockedData : []) as MappedData[];
      } else {
        // getCachedOrFetchedDocuments handles its own logging for cache/fetch logic
        const data = await ServiceDatabase.getCachedOrFetchedDocuments(collectionName);
        // Ensure we return MappedData[] specifically
        const mappedData = (Array.isArray(data) ? data : []) as MappedData[];
        //logger.debug(`Fin ${operation} - Documents récupérés (${mappedData.length})`, { ...context, count: mappedData.length, source: 'cache/db' });
        return mappedData;
      }
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Échec de la récupération des documents pour ${collectionName}`);
      throw error; // Re-throw error
    }
  }

  /**
   * Retrieves a single document by filter, using cache or database fetch. Handles offline mode.
   * @param collectionName - The name of the collection.
   * @param filter - The MongoDB filter query.
   * @returns A promise resolving to the found MappedData document or null.
   */
  static async getDocumentByFilter(collectionName: string, filter: Filter<Document>): Promise<MappedData | null> {
    const operation = 'getDocumentByFilter';
    //const context = { module: path.parse(__filename).name, operation, collectionName, filter };
    //logger.debug(`Début ${operation}`, context);

    try {
      if (config.isOffline) {
        //logger.debug('Mode offline activé, récupération et filtrage des données mockées.', context);
        const mockedData = await getMockedData(collectionName);
        const dataArray = (Array.isArray(mockedData) ? mockedData : []) as MappedData[];
        // Manual filtering for mock data
        const filteredData = dataArray.find((doc) =>
          Object.entries(filter).every(([key, value]) => doc[key as keyof MappedData] === value)
        );
        //logger.debug(`Fin ${operation} - Document mocké ${filteredData ? 'trouvé' : 'non trouvé'}`, { ...context, found: !!filteredData, source: 'mock' });
        return filteredData || null;
      } else {
        // Use cached/fetched data first
        const data = await ServiceDatabase.getCachedOrFetchedDocuments(collectionName);
        const dataArray = (Array.isArray(data) ? data : []) as MappedData[];
        // Manual filtering on the retrieved array
        const filteredData = dataArray.find((doc) =>
          Object.entries(filter).every(([key, value]) => doc[key as keyof MappedData] === value)
        );
        //logger.debug(`Fin ${operation} - Document ${filteredData ? 'trouvé' : 'non trouvé'}`, { ...context, found: !!filteredData, source: 'cache/db' });
        return filteredData || null;
        // Note: This filters in memory after fetching all. For large collections,
        // findSingleDocument might be more efficient if cache isn't hit often.
        // However, this approach leverages the cache effectively.
      }
    } catch (error) {
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Échec de la récupération du document dans ${collectionName}`);
      throw error;
    }
  }

  /**
   * Attempts to retrieve documents from the cache. If not found or expired,
   * fetches from the database and caches the result.
   * @param collectionName - The name of the collection.
   * @returns A promise resolving to an array of CacheItem or Document objects.
   */
  static async getCachedOrFetchedDocuments(collectionName: string): Promise<CacheItem[] | Document[]> {
    //const operation = 'getCachedOrFetchedDocuments';
    //const context = { module: path.parse(__filename).name, operation, collectionName };
    // //logger.debug(`Début ${operation}`, context); // Optional: Might be too noisy

    const key = ServiceCache.getCacheKeyForCollection(collectionName);
    const cachedData = await ServiceCache.getFromCache(key); // Assuming ServiceCache handles its own errors/logging

    if (cachedData) {
      //logger.debug(`Cache HIT pour ${collectionName}`, { ...context, cacheKey: key, count: cachedData.length });
      // //logger.debug(`Fin ${operation} - Données du cache`, context); // Optional
      return cachedData;
    }

    //logger.debug(`Cache MISS pour ${collectionName}, récupération en base...`, { ...context, cacheKey: key });

    const fetchedData = await this.fetchAndCacheDocuments(collectionName);
    // //logger.debug(`Fin ${operation} - Données de la base`, context); // Optional
    return fetchedData;
  }

  /**
   * Fetches documents directly from the database using mongodbOperations.find
   * and caches the result. Includes retry logic.
   * @param collectionName - The name of the collection.
   * @returns A promise resolving to an array of documents.
   */
  static async fetchAndCacheDocuments(collectionName: string): Promise<Document[]> {
    const operation = 'fetchAndCacheDocuments';
    //const context = { module: path.parse(__filename).name, operation, collectionName };
    //logger.debug(`Début ${operation}`, context);

    try {
      // Retry is applied here for the database fetch
      const result = await retry(mongodbOperations.find, [collectionName, {}], operation); // Pass empty filter
      //logger.debug(`Récupération DB réussie (${result.length} documents), mise en cache...`, { ...context, count: result.length });

      // Cache the result (assuming ServiceCache handles potential errors during caching)
      // Cast to MappedData[] might be needed depending on CacheItem definition
      await ServiceCache.addToCache(collectionName, result as MappedData[]);
      //logger.debug(`Fin ${operation} - Succès`, { ...context, count: result.length });
      return result;
    } catch (error) {
      // handleServiceError logs the error details including stack
      handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Erreur lors de la récupération et mise en cache pour ${collectionName}`);
      // Decide on behavior: re-throw or return empty array?
      // Returning empty allows dependent services to potentially continue with no data.
      // Re-throwing stops the process immediately. Let's re-throw for clarity.
      throw error;
      // return []; // Alternative: return empty array if failure should not stop the caller
    }
  }
}
