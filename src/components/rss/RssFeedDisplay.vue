<!-- src/components/rss/RssFeedDisplay.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCalculStore } from '../../store/calculStore';
import type { RssItem } from '../../types/responseData';
import Panel from 'primevue/panel';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Badge from 'primevue/badge';
import Paginator, { type PageState } from 'primevue/paginator';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext'; // <-- Importer InputText
import SelectButton from 'primevue/selectbutton'; // <-- Importer SelectButton

const calculStore = useCalculStore();
const isLoading = ref(true);
const errorLoading = ref<string | null>(null);

// --- State for Filtering ---
const selectedSources = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const searchQuery = ref(''); // <-- Nouvel état pour la recherche
const contentFilterState = ref<'all' | 'withContent' | 'noContent'>('all'); // <-- Nouvel état pour le filtre de contenu

// Options pour le SelectButton du filtre de contenu
const contentFilterOptions = ref([
    { label: 'Tous', value: 'all' },
    { label: 'Avec Contenu', value: 'withContent' },
    { label: 'Sans Contenu', value: 'noContent' }
]);

// --- State for Pagination ---
const currentPage = ref(1);
const rowsPerPage = ref(10);
const firstRecordIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value);

// --- Data Fetching ---
onMounted(async () => {
    // ... (votre code de chargement existant)
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

// --- Computed Properties ---

// 1. Base Data - Triée par processedAt descendant (pas de changement)
const allRssItems = computed<RssItem[]>(() => {
    const items = calculStore.getRss;
    // ... (votre code de tri existant)
    return [...items].sort((a, b) => {
        const dateA = a.processedAt ? new Date(a.processedAt) : null;
        const dateB = b.processedAt ? new Date(b.processedAt) : null;
        const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
        const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
        return timeB - timeA;
    });
});

// 2. Filtering Options (pas de changement majeur, dérivés de allRssItems)
const availableSources = computed(() => {
    const sources = new Set(allRssItems.value.map(item => item.feedName).filter(Boolean));
    return Array.from(sources).sort();
});

const availableCategories = computed(() => {
    const categories = new Set(allRssItems.value.map(item => item.category).filter(Boolean));
    return Array.from(categories).sort();
});

// 3. Filtered Data - INTÈGRE TOUS LES FILTRES (Source, Catégorie, Contenu, Recherche)
const filteredRssItems = computed(() => {
    let items = allRssItems.value; // Commence avec les données triées

    // a) Filtrer par Source
    if (selectedSources.value.length > 0) {
        items = items.filter(item => selectedSources.value.includes(item.feedName));
    }

    // b) Filtrer par Catégorie
    if (selectedCategories.value.length > 0) {
        items = items.filter(item => item.category && selectedCategories.value.includes(item.category));
    }

    // c) Filtrer par Contenu (Toggleable)
    if (contentFilterState.value === 'withContent') {
        items = items.filter(item => !!(item.summary || item.analysis)); // Garde ceux qui SONT toggleable
    } else if (contentFilterState.value === 'noContent') {
        items = items.filter(item => !(item.summary || item.analysis)); // Garde ceux qui ne SONT PAS toggleable
    }
    // Si 'all', on ne filtre pas sur ce critère

    // d) Filtrer par Recherche (sur titre, résumé, analyse)
    const query = searchQuery.value.trim().toLowerCase();
    if (query) {
        items = items.filter(item =>
            (item.title?.toLowerCase().includes(query)) ||
            (item.summary?.toLowerCase().includes(query)) ||
            (item.analysis?.toLowerCase().includes(query))
        );
    }

    // Réinitialiser la page à 1 si les filtres changent et qu'on n'est plus sur la page 1
    // C'est souvent une bonne pratique, mais nécessite un watch ou une logique plus complexe.
    // Pour l'instant, on laisse comme ça, mais l'utilisateur pourrait se retrouver sur une page vide.
    // Une amélioration serait de mettre currentPage.value = 1; quand un filtre change.

    return items;
});


// 4. Total Count of Filtered Items (pas de changement)
const totalFilteredItems = computed(() => filteredRssItems.value.length);

// 5. Paginated Data (pas de changement)
const paginatedRssItems = computed(() => {
    const start = firstRecordIndex.value;
    const end = start + rowsPerPage.value;
    return filteredRssItems.value.slice(start, end);
});

// --- Methods ---

const onPageChange = (event: PageState) => {
    currentPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
    window.scrollTo(0, 0); // Optionnel: remonte en haut de page lors du changement
};

// Méthode pour réinitialiser la page lors d'un changement de filtre
// (Alternative à une logique plus complexe avec des watchers)
const resetPageAndFilter = () => {
    currentPage.value = 1;
};

// Date Formatting (pas de changement)
const formatDate = (dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string => {
    // ... (votre code de formatage existant)
    if (!dateString || typeof dateString !== 'string') {
        return 'Date invalide';
    }
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
            return 'Date non reconnue';
        }
        const defaultOptions: Intl.DateTimeFormatOptions = {
            dateStyle: 'short',
            timeStyle: 'short',
            ...options
        };
        return dateObj.toLocaleString('fr-FR', defaultOptions);
    } catch (e) {
        return 'Erreur date';
    }
};

</script>

<template>
    <div class="rss-feed-container">
        <div v-if="isLoading" class="loading-indicator">
            <ProgressSpinner animationDuration=".8s" strokeWidth="4" />
            <p>Chargement des analyses...</p>
        </div>
        <div v-else-if="errorLoading">
            <Message severity="error" :closable="false">{{ errorLoading }}</Message>
        </div>

        <div v-else>
            <div class="filters-container p-mb-3 p-d-flex p-flex-wrap p-ai-center p-gap-3">

                <span class="p-input-icon-left search-input-wrapper">
                    <i class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="Rechercher..." class="p-inputtext-sm search-input"
                        @input="resetPageAndFilter" />
                </span>

                <MultiSelect v-model="selectedSources" :options="availableSources" placeholder="Filtrer par Source"
                    :maxSelectedLabels="2" showClear class="p-inputtext-sm filter-multiselect"
                    @change="resetPageAndFilter" />

                <MultiSelect v-if="availableCategories.length > 0" v-model="selectedCategories"
                    :options="availableCategories" placeholder="Filtrer par Catégorie" :maxSelectedLabels="2" showClear
                    class="p-inputtext-sm filter-multiselect" @change="resetPageAndFilter" />

                <SelectButton v-model="contentFilterState" :options="contentFilterOptions" optionLabel="label"
                    optionValue="value" aria-labelledby="content-filter-label" class="content-filter-selectbutton"
                    @change="resetPageAndFilter" />
            </div>

            <Paginator v-if="totalFilteredItems > 0" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="{first} à {last} sur {totalRecords} éléments" class="p-mb-3">
            </Paginator>
            <div v-else-if="!isLoading && !errorLoading && totalFilteredItems === 0" class="p-mb-3">
                <Message severity="info" :closable="false" class="info-message">
                    <span
                        v-if="searchQuery || selectedSources.length > 0 || selectedCategories.length > 0 || contentFilterState !== 'all'">
                        Aucun élément ne correspond à vos critères de recherche/filtre.
                    </span>
                    <span v-else>
                        Aucun élément à afficher pour le moment.
                    </span>
                </Message>
            </div>


            <div v-if="paginatedRssItems.length > 0" class="rss-items-list">
                <Panel v-for="item in paginatedRssItems" :key="item._id?.$oid || item.link"
                    :toggleable="!!(item.summary || item.analysis)" collapsed class="rss-panel">
                    <template #header>
                        <div class="rss-panel-header-content">
                            <div class="header-left-section">
                                <a :href="item.sourceFeed" target="_blank" rel="noopener noreferrer" @click.stop
                                    class="source-link"
                                    v-tooltip.top="`Ouvrir le flux source : ${item.feedName || 'Source'}`">
                                    <Badge :value="item.feedName || 'Source inconnue'" severity="info"
                                        class="source-badge"></Badge>
                                </a>
                                <span class="analysis-date">
                                    <i class="pi pi-calendar p-mr-1"></i>
                                    {{ formatDate(item.processedAt, { dateStyle: 'short', timeStyle: 'short' }) }}
                                </span>
                            </div>
                            <span class="item-title" v-tooltip.top="item.title">{{ item.title }}</span>
                        </div>
                    </template>

                    <template #icons>
                        <a :href="item.link" target="_blank" rel="noopener noreferrer" @click.stop
                            class="p-panel-header-icon p-link p-mr-2 icon-link external-link-icon"
                            v-tooltip.top="'Lire l\'article original'">
                            <i class="pi pi-external-link"></i>
                        </a>
                    </template>

                    <template #default>
                        <div class="rss-item-content">
                            <h4>Résumé</h4>
                            <p class="summary">{{ item.summary || 'Aucun résumé disponible.' }}</p>

                            <h4>Analyse</h4>
                            <pre class="analysis">{{ item.analysis || 'Aucune analyse disponible.' }}</pre>

                            <div class="rss-item-footer">
                                <p>
                                    <small>Publié le: {{ formatDate(item.publicationDate) }}</small><br />
                                    <small>Récupéré le: {{ formatDate(item.fetchedAt) }}</small>
                                </p>
                            </div>
                        </div>
                    </template>
                </Panel>
            </div>

            <Paginator v-if="totalFilteredItems > rowsPerPage" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="{first} à {last} sur {totalRecords} éléments" class="p-mt-3">
            </Paginator>

        </div>
    </div>
</template>

<style scoped>
/* --- Styles pour les Nouveaux Filtres --- */
.filters-container {
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    background-color: #3a3a3a;
    border-radius: 6px;
    border: 1px solid #555;
    /* display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; */
    /* Classes PrimeFlex p-d-flex etc. font le travail */
}

.search-input-wrapper {
    flex-grow: 1;
    /* Permet au champ de recherche de prendre plus de place */
    min-width: 180px;
}

.search-input {
    width: 100%;
    /* Prend toute la largeur du wrapper */
}

.filter-multiselect {
    min-width: 180px;
    flex-basis: 180px;
    /* Largeur de base avant de grandir/rétrécir */
    flex-grow: 1;
    /* Permet aux multiselects de grandir un peu */
}

.content-filter-selectbutton {
    flex-shrink: 0;
    /* Empêche ce bouton de rétrécir excessivement */
}

/* Ajustement pour les petits écrans si nécessaire */
@media (max-width: 768px) {
    .filters-container {
        gap: 0.5rem;
        /* Réduire l'espace entre les filtres */
    }

    .search-input-wrapper,
    .filter-multiselect {
        flex-basis: calc(50% - 0.5rem);
        /* Env. 2 par ligne */
        min-width: 150px;
    }

    .content-filter-selectbutton {
        flex-basis: 100%;
        /* Prend toute la largeur */
        order: 5;
        /* Le met à la fin */
    }
}


/* --- Ajustements pour la Cohérence de l'En-tête --- */
.rss-panel-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
    overflow: hidden;
    /* Empêche le débordement global */
}

.header-left-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    /* Important: Empêche cette section de rétrécir */
    width: 160px;
    /* Largeur fixe pour la section gauche (badge + date) */
    /* Ajustez cette valeur selon vos besoins visuels */
    gap: 0.25rem;
}

.source-link {
    text-decoration: none;
    display: block;
    /* Pour que la largeur max/ellipsis fonctionne sur le badge */
    max-width: 100%;
    /* Limite la largeur du lien (et donc du badge) */
}

.source-badge {
    /* Si vous voulez limiter la largeur du badge lui-même */
    display: inline-block;
    /* Nécessaire pour max-width sur un inline element */
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    /* Meilleur alignement vertical */
}


.analysis-date {
    display: inline-flex;
    align-items: center;
    font-size: 0.8em;
    color: #aaa;
    white-space: nowrap;
    /* Empêche la date de passer à la ligne */
}

.item-title {
    font-weight: 600;
    color: #eee;
    flex-grow: 1;
    /* Prend l'espace restant */
    /* Les styles suivants assurent la troncature sur une seule ligne */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    /* Assurez-vous qu'il est aligné à gauche */
    min-width: 0;
    /* Important dans un contexte flex pour permettre la troncature */
    cursor: default;
}

/* --- Vos Styles Existants (la plupart restent inchangés) --- */
.rss-feed-container {
    padding: 1rem;
    max-width: 1000px;
    /* Augmenté un peu pour accommoder les filtres */
    margin: 1rem auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Styles pour loading, error, panel, content, footer, etc. sont conservés */
/* ... (tous vos autres styles) ... */

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #aaa;
}

.rss-items-list {
    margin-top: 1rem;
}

.rss-panel {
    margin-bottom: 1rem;
    border: 1px solid #555;
    border-radius: 6px;
    background-color: #333;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    transition: box-shadow 0.3s ease;
    overflow: hidden;
}

.rss-panel:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
}


.analysis-date i {
    font-size: 0.9em;
    color: #aaa;
    margin-right: 4px;
}


:deep(.p-panel-header) {
    background-color: #444;
    border-bottom: 1px solid #555;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
}

:deep(.p-panel-title) {
    /* Ce sélecteur n'est plus directement utilisé car on utilise #header template */
    flex-grow: 1;
}

.rss-item-content {
    padding: 1rem 1.5rem;
    background-color: #333;
    color: #ccc;
}

.rss-item-content h4 {
    margin-top: 1rem;
    margin-bottom: 0.75rem;
    color: #38bdf8;
    border-bottom: 1px solid #555;
    padding-bottom: 0.3rem;
    font-weight: 600;
}

.rss-item-content h4:first-child {
    margin-top: 0;
}

.summary {
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.analysis {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #2a2a2a;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #555;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    line-height: 1.5;
    color: #bbb;
    max-height: 450px;
    overflow-y: auto;
}

.rss-item-footer {
    margin-top: 1.5rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #666;
    font-size: 0.8em;
    color: #aaa;
}

.rss-item-footer small {
    display: block;
    line-height: 1.4;
    margin-bottom: 0.25rem;
}

:deep(.p-panel-header .icon-link) {
    color: #38bdf8;
    transition: color 0.2s;
}

:deep(.p-panel-header .icon-link:hover) {
    color: #7dd3fc;
    background-color: transparent !important;
}

:deep(.p-panel-header .p-panel-toggler) {
    color: #38bdf8 !important;
    margin-left: 0.5rem;
    transition: color 0.2s;
}

:deep(.p-panel-header .p-panel-toggler:hover) {
    color: #7dd3fc !important;
    background-color: transparent !important;
}

.info-message {
    background-color: #1e3a5f;
    color: #cde;
    border-color: #2a5a8e;
}

:deep(.info-message .p-message-icon) {
    color: #cde;
}

:deep(.p-tooltip) {
    background-color: #222 !important;
    color: #eee !important;
}

:deep(.p-tooltip .p-tooltip-arrow) {
    border-top-color: #222 !important;
    border-bottom-color: #222 !important;
    border-left-color: #222 !important;
    border-right-color: #222 !important;
}

:deep(.p-paginator) {
    background-color: #3a3a3a;
    border: 1px solid #555;
    color: #ccc;
    border-radius: 6px;
}

:deep(.p-paginator .p-paginator-page),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev) {
    color: #eee;
    min-width: 2.5rem;
    height: 2.5rem;
}

:deep(.p-paginator .p-paginator-page:not(.p-highlight):hover),
:deep(.p-paginator .p-paginator-next:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-last:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-first:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-prev:not(.p-disabled):hover) {
    background-color: #555;
    color: #fff;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
    background-color: #0ea5e9;
    color: #fff;
}

:deep(.p-dropdown) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
}

:deep(.p-dropdown .p-dropdown-trigger) {
    color: #eee;
}

:deep(.p-dropdown-panel) {
    background-color: #333;
    border: 1px solid #666;
}

:deep(.p-dropdown-item) {
    color: #eee;
}

:deep(.p-dropdown-item:hover) {
    background-color: #555;
}

:deep(.p-multiselect) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
}

:deep(.p-multiselect .p-multiselect-label.p-placeholder) {
    color: #bbb;
}

:deep(.p-multiselect-label) {
    color: #eee;
}

:deep(.p-multiselect-trigger) {
    color: #eee;
}

:deep(.p-multiselect-panel) {
    background-color: #333;
    border: 1px solid #666;
}

:deep(.p-multiselect-item) {
    color: #eee;
}

:deep(.p-multiselect-item:hover) {
    background-color: #555;
}

:deep(.p-multiselect-item.p-highlight) {
    background-color: #0ea5e9;
    color: #fff;
}

:deep(.p-multiselect-header) {
    background-color: #3a3a3a;
    color: #eee;
    border-bottom: 1px solid #555;
}

:deep(.p-multiselect-header .p-checkbox .p-checkbox-box) {
    border-color: #777;
}

:deep(.p-multiselect-header .p-checkbox:hover .p-checkbox-box) {
    border-color: #999;
}

:deep(.p-multiselect-filter) {
    background-color: #555;
    color: #eee;
    border: 1px solid #777;
}

/* Style pour SelectButton */
:deep(.p-selectbutton .p-button) {
    background-color: #555;
    border-color: #777;
    color: #ccc;
    transition: background-color 0.2s, color 0.2s;
}

:deep(.p-selectbutton .p-button:not(.p-highlight):hover) {
    background-color: #666;
    border-color: #888;
    color: #fff;
}

:deep(.p-selectbutton .p-button.p-highlight) {
    background-color: #0ea5e9;
    border-color: #0ea5e9;
    color: #fff;
}

:deep(.p-selectbutton .p-button:focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.5);
    /* Focus ring assorti au highlight */
}
</style>