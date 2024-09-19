// src/services/authService.ts

import bcrypt from 'bcrypt'; // Pour le hachage des mots de passe
import crypto from 'crypto'; // Utilisation du module crypto intégré
import { saveData, getOne } from './mongodbService';
import { handleServiceError } from '@utils/errorUtil';

// Interface pour représenter un utilisateur
interface User {
  email: string;
  password: string;
  [key: string]: string | number | boolean | undefined;
}

// Définition de la classe AuthService
export default class AuthService {
  /**
   * Compare un mot de passe en texte clair avec un mot de passe haché.
   * @param {string} password - Le mot de passe en texte clair à comparer.
   * @param {string} hashedPassword - Le mot de passe haché à comparer.
   * @returns {Promise<boolean>} - Une promesse qui se résout à true si les mots de passe correspondent, false sinon.
   */
  public static async isPasswordMatch(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Crée un nouvel utilisateur dans la base de données avec un mot de passe haché.
   */
  public static async createUserDBService(userDetails: User): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(userDetails.password, 10); // Ajustez les tours de sel selon les besoins
      const newUser = { ...userDetails, password: hashedPassword }; // Opérateur de propagation

      const collection = process.env.MONGODB_COLLECTION_USERS;
      if (!collection) {
        throw new Error("La collection MongoDB n'est pas définie");
      }
      const result = await saveData(collection, newUser);

      console.log(
        '🚀 ~ createUserDBService ~ result:',
        result
      );
      return true;
    } catch (error) {
      handleServiceError(error, 'createUserDBService', 'Erreur lors de la création de l\'utilisateur');
      return false;
    }
  }

  /**
   * Trouve un utilisateur dans la base de données par son adresse e-mail.
   */
  public static async findUserByEmail(email: string): Promise<User | null> {
    try {
      const collection = process.env.MONGODB_COLLECTION_USERS;
      if (!collection) {
        throw new Error("La collection MongoDB n'est pas définie");
      }
      const user = await getOne(collection, { email }); // Filtrer par e-mail
      return user as User | null; // Retourne l'objet utilisateur trouvé ou null s'il n'est pas trouvé
    } catch (error) {
      handleServiceError(error, 'findUserByEmail', 'Erreur lors de la recherche de l\'utilisateur');
      return null; // Indique une erreur ou que l'utilisateur n'a pas été trouvé
    }
  }

  /**
   * Génère un jeton de session aléatoire sécurisé.
   */
  public static async generateSessionToken(): Promise<string> {
    try {
      const randomBytes = crypto.randomBytes(32); // Simplifié sans callback
      const token = randomBytes.toString('base64url');
      console.log('Jeton de session généré avec succès.');
      return token;
    } catch (error) {
      handleServiceError(error, 'generateSessionToken', 'Échec de la génération du jeton de session');
      throw new Error('Échec de la génération du jeton de session');
    }
  }
}