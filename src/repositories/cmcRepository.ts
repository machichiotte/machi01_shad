// src/repositories/cmcRepository.ts
import { DatabaseService } from '@services/databaseService';
import { MappedCmc } from '@typ/cmc';
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.cmc;
const COLLECTION_CATEGORY = config.collectionCategory.cmc;

export class CmcRepository {
    /**
     * Récupère les données CMC depuis la base de données.
     */
    public static async fetchAll(): Promise<MappedCmc[]> {
        return await DatabaseService.getData(COLLECTION_NAME) as MappedCmc[];
    }

    /**
     * Supprime toutes les données CMC de la base de données.
     */
    public static async deleteAll(): Promise<number> {
        return await DatabaseService.deleteAllData(COLLECTION_NAME);
    }

    /**
     * Insère de nouvelles données CMC dans la base de données.
     */
    public static async save(mappedData: Omit<MappedCmc, '_id'>[]): Promise<void> {
        const sortedData = mappedData.sort((a, b) => a.cmc_rank - b.cmc_rank);
        await DatabaseService.saveDataAndTimestampToDatabase(sortedData, COLLECTION_NAME, COLLECTION_CATEGORY);
    }
}