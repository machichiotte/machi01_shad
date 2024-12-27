import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Doit faire 32 caractères
const ALGORITHM = 'aes-256-cbc';
const IV = '7b525cfead51ae6adcb4512158badd38';

export class EncryptionService {
  static encrypt(text: string): { encryptedData: string } {
    const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), IV);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      encryptedData: encrypted.toString('hex')
    };
  }

  static decrypt(encryptedData: string): string {
    const encryptedText = Buffer.from(encryptedData, 'hex');
    
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), IV);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  }
}
