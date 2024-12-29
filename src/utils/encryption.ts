import { createCipheriv, createDecipheriv } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '' // Must be 32 characters
const ALGORITHM = 'aes-256-cbc'

export class EncryptionService {
  static encrypt(
    iv: string,
    text: string
  ): { iv: string; encryptedData: string } {
    const cipher = createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, 'hex')
    )
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    // Return both the IV and the encrypted data
    return {
      iv,
      encryptedData: encrypted.toString('hex')
    }
  }

  static decrypt(iv: string, encryptedData: string): string {
    const encryptedText = Buffer.from(encryptedData, 'hex')
    const decipher = createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv, 'hex')
    )

    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }
}
