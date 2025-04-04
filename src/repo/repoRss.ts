// src/repo/repoRss.ts
import { ServiceDatabase } from '@services/api/database/serviceDatabase'; // Utiliser cette couche !
// Supprimé : import { mongodbOperations } from '@services/api/database/mongodbOperationsService';
import { ProcessedArticleData } from '@typ/rss';
import { config } from '@config/index';
import { ObjectId } from 'mongodb'; // Importer si vous utilisez updateById avec des strings

const COLLECTION_NAME = config.databaseConfig.collection.rssArticles; // Assurez-vous que c'est le bon nom

export class RepoRss {
    /**
     * Récupère tous les articles RSS de la base de données.
     */
    public static async fetchAll(): Promise<ProcessedArticleData[]> {
        // Utilise ServiceDatabase.findAllDocuments
        const documents = await ServiceDatabase.findAllDocuments(COLLECTION_NAME);
        return documents as ProcessedArticleData[]; // Cast si nécessaire et sûr
    }

    /**
     * Récupère un article RSS par son lien.
     */
    public static async findByLink(link: string): Promise<ProcessedArticleData | null> {
        const filter = { link: link };
        // Utilise ServiceDatabase.findSingleDocument
        const document = await ServiceDatabase.findSingleDocument(COLLECTION_NAME, filter);
        return document as ProcessedArticleData | null; // Cast si nécessaire et sûr
    }

    /**
     * Supprime tous les articles RSS de la base de données.
     */
    public static async deleteAll(): Promise<number> {
        // Utilise ServiceDatabase.deleteAllDocuments
        return await ServiceDatabase.deleteAllDocuments(COLLECTION_NAME);
    }

    /**
     * Enregistre un nouvel article RSS dans la base de données.
     */
    public static async save(articleData: ProcessedArticleData): Promise<void> {
        // Utilise ServiceDatabase.insertDocuments (qui gère objet unique ou tableau)
        await ServiceDatabase.insertDocuments(COLLECTION_NAME, articleData);
        // Note : Le type de retour de insertDocuments est InsertData, mais la méthode save est void ici.
    }

    /**
     * Met à jour un article RSS existant par son ID MongoDB.
     * (Moins pertinent pour le processeur RSS qui utilise 'link', mais conservé pour l'exemple)
     */
    public static async updateById(articleId: string | ObjectId, updateData: Partial<ProcessedArticleData>): Promise<boolean> {
        const filter = { _id: typeof articleId === 'string' ? new ObjectId(articleId) : articleId };
        const updatePayload = { $set: updateData }; // ServiceDatabase.updateDocument attend le payload complet
        // Utilise ServiceDatabase.updateDocument
        return await ServiceDatabase.updateDocument(COLLECTION_NAME, filter, updatePayload);
    }

    /**
     * Supprime un article RSS par son lien.
     */
    public static async deleteByLink(link: string): Promise<boolean> {
        const filter = { link: link };
        // Utilise ServiceDatabase.deleteSingleDocument
        return await ServiceDatabase.deleteSingleDocument(COLLECTION_NAME, filter);
    }

    // --- MÉTHODES ADAPTÉES POUR LE PROCESSEUR RSS ---

    /**
     * Met à jour un article s'il existe par lien, sinon l'insère.
     * Implémentation manuelle car ServiceDatabase.updateDocument ne gère pas l'upsert.
     * @param articleData Données à insérer ou utiliser pour la mise à jour. DOIT inclure 'link'.
     * @returns Objet indiquant si une mise à jour ou une insertion a eu lieu.
     */
    public static async upsertByLink(articleData: Partial<ProcessedArticleData>): Promise<{ updated: boolean; upserted: boolean }> {
        if (!articleData.link) {
            throw new Error('RepoRss.upsertByLink requires a link field in articleData.');
        }
        const filter = { link: articleData.link };

        // 1. Essayer de trouver le document existant
        const existing = await ServiceDatabase.findSingleDocument(COLLECTION_NAME, filter);

        if (existing) {
            // 2a. Si trouvé, mettre à jour
            const dataToSet = { ...articleData };
            delete dataToSet.link; // Ne pas redéfinir le lien dans $set
            // Supprimer _id si présent dans articleData pour éviter les conflits
            delete dataToSet._id;

            if (Object.keys(dataToSet).length > 0) { // S'il y a quelque chose à mettre à jour
                const updatePayload = { $set: dataToSet };
                const success = await ServiceDatabase.updateDocument(COLLECTION_NAME, filter, updatePayload);
                return { updated: success, upserted: false };
            } else {
                // Rien à mettre à jour (peut-être seulement le lien était fourni)
                return { updated: false, upserted: false };
            }

        } else {
            // 2b. Si non trouvé, insérer
            // S'assurer que les champs requis pour ProcessedArticleData sont présents si nécessaire
            const dataToInsert = { ...articleData } as ProcessedArticleData; // Assumer que articleData a la bonne structure ou la compléter
            await ServiceDatabase.insertDocuments(COLLECTION_NAME, dataToInsert);
            return { updated: false, upserted: true };
        }
    }

    /**
     * Met à jour le statut d'erreur et la date de traitement pour un article identifié par son lien.
     * @param link Le lien unique de l'article à mettre à jour.
     * @param errorMessage Le message d'erreur à définir.
     * @returns Booléen indiquant si la mise à jour a réussi.
     */
    public static async updateErrorStatus(link: string, errorMessage: string): Promise<boolean> {
        const filter = { link: link };
        const updatePayload = {
            $set: {
                error: errorMessage,
                processedAt: new Date() // Mettre à jour le timestamp lors de l'erreur
            }
        };
        // Utilise ServiceDatabase.updateDocument
        return await ServiceDatabase.updateDocument(COLLECTION_NAME, filter, updatePayload);
    }
}