// src/services/authService.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthRepository } from '@repositories/authRepository';
import { handleServiceError } from '@utils/errorUtil';
import { User } from '@typ/auth';
import config from '@config/index';

const HASH_ROUNDS = config.security.hashRounds || 10; // Nombre de tours de sel pour bcrypt

export class AuthService {

  public static async isPasswordMatch(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public static async createUserDBService(userDetails: User): Promise<boolean> {
    try {
      if (!userDetails.email || !userDetails.password) {
        throw new Error("Email et mot de passe sont requis");
      }

      const hashedPassword = await bcrypt.hash(userDetails.password, HASH_ROUNDS);
      const newUser = { ...userDetails, password: hashedPassword };

      await AuthRepository.insertUser(newUser);
      return true;
    } catch (error) {
      handleServiceError(error, 'createUserDBService', 'Erreur lors de la création de l\'utilisateur');
      return false;
    }
  }

  public static async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await AuthRepository.findUserByEmail(email);
    } catch (error) {
      handleServiceError(error, 'findUserByEmail', 'Erreur lors de la recherche de l\'utilisateur');
      return null;
    }
  }

  public static async generateSessionToken(): Promise<string> {
    try {
      const randomBytes = crypto.randomBytes(32);
      return randomBytes.toString('base64url');
    } catch (error) {
      handleServiceError(error, 'generateSessionToken', 'Échec de la génération du jeton de session');
      throw new Error('Échec de la génération du jeton de session');
    }
  }
}
