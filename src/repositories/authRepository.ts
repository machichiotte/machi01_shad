// src/repositories/userRepository.ts
import { DatabaseService } from '@services/databaseService';
import { config } from '@config/index';
import { User } from '@typ/auth';
import { handleServiceError } from '@src/utils/errorUtil';

const COLLECTION_NAME = config.database.user;

export class AuthRepository {
    public static async insertUser(user: User): Promise<void> {
        try {
            await DatabaseService.insertData(COLLECTION_NAME, user);
        } catch (error) {
            handleServiceError(error, 'Erreur lors de l\'insertion de l\'utilisateur dans la base de données');
            throw error;
        }
    }

    public static async findUserByEmail(email: string): Promise<User | null> {
        try {
            return await DatabaseService.findOneData(COLLECTION_NAME, { email }) as User;
        } catch (error) {
            handleServiceError(error, 'Erreur lors de la recherche de l\'utilisateur dans la base de données');
            throw error;
        }
    }
}
