// src/repositories/cmcRepository
import { MongodbService } from '@services/mongodbService';
import { MappedCmc } from '@typ/cmc';
import { config } from '@config/index';

const COLLECTION_NAME = config.collection.cmc;

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
    public static async saveCmcData(data: MappedCmc[]): Promise<object> {
        return await MongodbService.insertData(COLLECTION_NAME, data);
    }
}
