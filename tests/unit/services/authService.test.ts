import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthService } from '@services/authService';
import { MongodbService } from '@services/mongodbService';
import { handleServiceError } from '@utils/errorUtil';

jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('@services/mongodbService');
jest.mock('@utils/errorUtil');

describe('authService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isPasswordMatch', () => {
    it('devrait comparer correctement le mot de passe', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await AuthService.isPasswordMatch('password', 'hashedPassword');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });
  });

  describe('createUserDBService', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userDetails = { email: 'test@example.com', password: 'password' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (MongodbService.saveData as jest.Mock).mockResolvedValue({ insertedId: 'someId' });
      process.env.MONGODB_COLLECTION_USERS = 'users';

      const result = await AuthService.createUserDBService(userDetails);

      expect(result).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(MongodbService.saveData).toHaveBeenCalledWith('users', expect.objectContaining({
        email: 'test@example.com',
        password: 'hashedPassword'
      }));
    });

    it('devrait gérer les erreurs correctement', async () => {
      const userDetails = { email: 'test@example.com', password: 'password' };
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      const result = await AuthService.createUserDBService(userDetails);

      expect(result).toBe(false);
      expect(handleServiceError).toHaveBeenCalled();
    });
  });

  describe('findUserByEmail', () => {
    it('devrait trouver un utilisateur par email', async () => {
      const mockUser = { email: 'test@example.com', password: 'hashedPassword' };
      (MongodbService.getOne as jest.Mock).mockResolvedValue(mockUser);
      process.env.MONGODB_COLLECTION_USERS = 'users';

      const result = await AuthService.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(MongodbService.getOne).toHaveBeenCalledWith('users', { email: 'test@example.com' });
    });

    it('devrait retourner null si l\'utilisateur n\'est pas trouvé', async () => {
      (MongodbService.getOne as jest.Mock).mockResolvedValue(null);
      process.env.MONGODB_COLLECTION_USERS = 'users';

      const result = await AuthService.findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('generateSessionToken', () => {
    it('devrait générer un jeton de session valide', async () => {
      const mockRandomBytes = Buffer.from('randomBytes');
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockRandomBytes);

      const result = await AuthService.generateSessionToken();

      expect(result).toBe(mockRandomBytes.toString('base64url'));
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    });

    it('devrait gérer les erreurs lors de la génération du jeton', async () => {
      (crypto.randomBytes as jest.Mock).mockImplementation(() => {
        throw new Error('Random bytes generation failed');
      });

      await expect(AuthService.generateSessionToken()).rejects.toThrow('Échec de la génération du jeton de session');
      expect(handleServiceError).toHaveBeenCalled();
    });
  });
});