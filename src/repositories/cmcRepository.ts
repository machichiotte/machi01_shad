// src/repositories/cmcRepository.ts
import { MongodbService } from '@services/mongodbService';
import { MappedCmc } from '@typ/cmc';
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.cmc;
const COLLECTION_CATEGORY = config.collectionCategory.cmc;

export class CmcRepository {
    /**
     * Récupère les données CMC depuis la base de données.
     */
    public static async fetchCmcData(): Promise<MappedCmc[]> {
        return await MongodbService.getData(COLLECTION_NAME) as MappedCmc[];
    }

    /**
     * Supprime toutes les données CMC de la base de données.
     */
    public static async deleteAllCmcData(): Promise<number> {
        return await MongodbService.deleteAllData(COLLECTION_NAME);
    }

    /**
     * Insère de nouvelles données CMC dans la base de données.
     */
    public static async saveCmcData(mappedData: Omit<MappedCmc, '_id'>[]): Promise<void> {
        await MongodbService.saveDataToDatabase(mappedData, COLLECTION_NAME, COLLECTION_CATEGORY);
    }
}