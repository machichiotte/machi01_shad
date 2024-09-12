// src/services/authService.ts
import bcrypt from 'bcrypt' // Pour le hachage des mots de passe
import crypto from 'crypto' // Utilisation du module crypto intégré
import { saveData, getOne } from './mongodbService'

interface User {
  email: string
  password: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Compare un mot de passe en texte clair avec un mot de passe haché.
 * @param {string} password - Le mot de passe en texte clair à comparer.
 * @param {string} hashedPassword - Le mot de passe haché à comparer.
 * @returns {Promise<boolean>} - Une promesse qui se résout à true si les mots de passe correspondent, false sinon.
 */
async function isPasswordMatch(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Crée un nouvel utilisateur dans la base de données avec un mot de passe haché.
 * @param {Object} userDetails - Les détails de l'utilisateur à sauvegarder.
 * @param {string} userDetails.password - Le mot de passe de l'utilisateur à hacher.
 * @returns {Promise<boolean>} - Une promesse qui se résout à true si la création de l'utilisateur a réussi, false sinon.
 */
async function createUserDBService(userDetails: User): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10) // Ajustez les tours de sel selon les besoins
    const newUser = { ...userDetails, password: hashedPassword } // Opérateur de propagation

    const collection = process.env.MONGODB_COLLECTION_USERS
    if (!collection) {
      throw new Error("La collection MongoDB n'est pas définie")
    }
    const result = await saveData(collection, newUser)

    console.log(
      '🚀 ~ createUserDBService ~ result.insertedId:',
      result.insertedId
    )
    return true
  } catch (error) {
    console.log('🚀 ~ createUserDBService ~ err:', error)
    return false
  }
}

/**
 * Trouve un utilisateur dans la base de données par son adresse e-mail.
 * @param {string} email - L'adresse e-mail de l'utilisateur à trouver.
 * @returns {Promise<Object|null>} - Une promesse qui se résout à l'objet utilisateur s'il est trouvé, ou null s'il n'est pas trouvé ou en cas d'erreur.
 */
async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const collection = process.env.MONGODB_COLLECTION_USERS
    if (!collection) {
      throw new Error("La collection MongoDB n'est pas définie")
    }
    const user = await getOne(collection, { email }) // Filtrer par e-mail
    return user as User | null // Retourne l'objet utilisateur trouvé ou null s'il n'est pas trouvé
  } catch (error) {
    console.log('🚀 ~ findUserByEmail ~ error:', error)
    return null // Indique une erreur ou que l'utilisateur n'a pas été trouvé
  }
}

/**
 * Génère un jeton de session aléatoire sécurisé.
 * @returns {Promise<string>} - Une promesse qui se résout au jeton de session généré.
 * @throws {Error} - Lance une erreur si la génération du jeton échoue.
 */
async function generateSessionToken(): Promise<string> {
  try {
    const randomBytes = crypto.randomBytes(32) // Simplifié sans callback
    const token = randomBytes.toString('base64url')
    console.log('Jeton de session généré avec succès.')
    return token
  } catch (error) {
    console.error('Échec de la génération du jeton de session', {
      error: (error as Error).message
    })
    throw new Error('Échec de la génération du jeton de session')
  }
}

export {
  isPasswordMatch,
  createUserDBService,
  findUserByEmail,
  generateSessionToken
}
