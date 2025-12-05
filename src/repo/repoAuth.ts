// src/repo/repoAuth.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase';
import { config } from '@config/index';
import { User } from '@typ/auth';
import { handleServiceError } from '@utils/errorUtil';

const COLLECTION_NAME = config.databaseConfig.collection.user;

export class RepoAuth {
    public static async insertUser(user: User): Promise<void> {
        try {
            await ServiceDatabase.insertDocuments(COLLECTION_NAME, user);
        } catch (error) {
            handleServiceError(error, 'Erreur lors de l\'insertion de l\'utilisateur dans la base de données');
            throw error;
        }
    }

    public static async findUserByEmail(email: string): Promise<User | null> {
        try {
            return await ServiceDatabase.findSingleDocument(COLLECTION_NAME, { email }) as User;
        } catch (error) {
            handleServiceError(error, 'Erreur lors de la recherche de l\'utilisateur dans la base de données');
            throw error;
        }
    }
}
