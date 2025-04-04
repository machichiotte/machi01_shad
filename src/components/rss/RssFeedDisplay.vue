<!-- src/components/rss/RssFeedDisplay.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCalculStore } from '../../store/calculStore'; // Ajustez le chemin si nécessaire
import type { RssItem } from '../../types/responseData'; // Ajustez le chemin si nécessaire
import Panel from 'primevue/panel'; // Importez le composant Panel
import ProgressSpinner from 'primevue/progressspinner'; // Pour indiquer le chargement
import Message from 'primevue/message'; // Pour afficher les erreurs

const calculStore = useCalculStore();
const isLoading = ref(true);
const errorLoading = ref<string | null>(null);

// Récupérer les données lors du montage du composant
onMounted(async () => {
    isLoading.value = true;
    errorLoading.value = null;
    try {
        await calculStore.loadRss();
    } catch (error) {
        console.error("Erreur lors du chargement du flux RSS:", error);
        errorLoading.value = "Impossible de charger le flux RSS. Veuillez réessayer plus tard.";
    } finally {
        isLoading.value = false;
    }
});

// Obtenir les données RSS depuis le store via un computed property
const rssItems = computed<RssItem[]>(() => calculStore.getRss);

// Fonction pour formater les dates
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleString('fr-FR', { // Adaptez la locale si besoin
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    } catch (e) {
        return dateString; // Retourne la chaîne originale en cas d'erreur
    }
};
</script>

<template>
    <div class="rss-feed-container">
        <h2>Mon Flux RSS</h2>

        <div v-if="isLoading" class="loading-indicator">
            <ProgressSpinner />
            <p>Chargement du flux...</p>
        </div>

        <div v-else-if="errorLoading">
            <Message severity="error" :closable="false">{{ errorLoading }}</Message>
        </div>

        <div v-else-if="rssItems.length > 0">
            <Panel v-for="item in rssItems" :key="item._id.$oid" :header="item.title" toggleable collapsed>
                <template #default>
                    <div class="rss-item-content">
                        <h4>Résumé</h4>
                        <p class="summary">{{ item.summary }}</p>

                        <h4>Analyse</h4>
                        <pre class="analysis">{{ item.analysis }}</pre>

                        <div class="rss-item-footer">
                            <a :href="item.link" target="_blank" rel="noopener noreferrer">Lire l'article complet</a>
                            <p>
                                <small>Source: {{ item.sourceFeed }}</small><br />
                                <small>Publié le: {{ formatDate(item.publicationDate.$date) }}</small><br />
                                <small>Récupéré le: {{ formatDate(item.fetchedAt.$date) }}</small>
                            </p>
                        </div>
                    </div>
                </template>
                <template #icons>
                    <a :href="item.link" target="_blank" rel="noopener noreferrer" @click.stop> <i
                            class="pi pi-external-link" style="margin-left: 0.5rem;"
                            title="Ouvrir dans un nouvel onglet"></i>
                    </a>
                </template>
            </Panel>
        </div>

        <div v-else>
            <Message severity="info" :closable="false">Aucun élément dans le flux RSS pour le moment.</Message>
        </div>

    </div>
</template>

<style scoped>
.rss-feed-container {
    padding: 1rem;
    max-width: 900px;
    /* Adaptez selon vos besoins */
    margin: 1rem auto;
    /* Centrer le conteneur */
    font-family: sans-serif;
    /* Style de base */
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #666;
}

/* Espace entre les panneaux */
.p-panel {
    margin-bottom: 1rem;
}

/* Style pour le contenu du panneau */
.rss-item-content {
    padding: 0.5rem 0;
    /* Un peu d'espace vertical */
}

.rss-item-content h4 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.25rem;
}

.rss-item-content h4:first-child {
    margin-top: 0;
}

.summary {
    line-height: 1.6;
    color: #555;
}

.analysis {
    white-space: pre-wrap;
    /* Conserve les sauts de ligne et retours chariot */
    word-wrap: break-word;
    /* Coupe les mots longs */
    background-color: #f8f9fa;
    /* Fond légèrement différent pour l'analyse */
    padding: 0.8rem;
    border-radius: 4px;
    border: 1px solid #e9ecef;
    font-family: monospace;
    /* Peut être utile pour l'analyse formatée */
    line-height: 1.5;
    color: #444;
    max-height: 400px;
    /* Limite la hauteur si l'analyse est très longue */
    overflow-y: auto;
    /* Ajoute une barre de défilement si nécessaire */
}

.rss-item-footer {
    margin-top: 1.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed #ccc;
    font-size: 0.9em;
    color: #777;
}

.rss-item-footer a {
    display: inline-block;
    margin-bottom: 0.5rem;
    text-decoration: none;
    color: #007bff;
}

.rss-item-footer a:hover {
    text-decoration: underline;
}

.rss-item-footer small {
    display: block;
    /* Met chaque ligne de small sur sa propre ligne */
    line-height: 1.4;
}

/* Style pour l'en-tête du panneau (optionnel) */
:deep(.p-panel-header) {
    background-color: #f1f3f5;
    /* Couleur de fond légèrement différente pour l'en-tête */
}

/* Style pour le lien dans les icônes */
:deep(.p-panel-icons a) {
    color: var(--text-color-secondary);
    /* Utilise une variable PrimeVue ou une couleur spécifique */
}

:deep(.p-panel-icons a:hover) {
    color: var(--primary-color);
    /* Utilise une variable PrimeVue ou une couleur spécifique */
}
</style>