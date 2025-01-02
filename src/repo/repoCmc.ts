// src/repo/repoCmc.ts
import { DatabaseService } from '@src/services/api/database/databaseService';
import { MappedCmc } from '@typ/cmc';
import { config } from '@config/index';

const COLLECTION_NAME = config.databaseConfig.collection.cmc;
const COLLECTION_CATEGORY = config.databaseConfig.category.cmc;

export class RepoCmc {
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