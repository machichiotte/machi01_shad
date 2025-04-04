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

const calculStore = useCalculStore();
const isLoading = ref(true);
const errorLoading = ref<string | null>(null);

// --- State for Filtering ---
const selectedSources = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);

// --- State for Pagination ---
const currentPage = ref(1);
const rowsPerPage = ref(10);
const firstRecordIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value);

// --- Data Fetching ---
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

// --- Computed Properties ---

// 1. Base Data - MODIFIED to sort by processedAt descending
const allRssItems = computed<RssItem[]>(() => {
    const items = calculStore.getRss;
    // Create a shallow copy and sort it
    return [...items].sort((a, b) => {
        // Handle cases where processedAt might be null, undefined, or invalid
        const dateA = a.processedAt ? new Date(a.processedAt) : null;
        const dateB = b.processedAt ? new Date(b.processedAt) : null;

        const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : 0; // Treat invalid/null as oldest
        const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : 0; // Treat invalid/null as oldest

        // Sort descending (newest first)
        return timeB - timeA;
    });
});

// 2. Filtering Options (derived from potentially sorted data)
const availableSources = computed(() => {
    // Using allRssItems which is now sorted, but Set naturally removes order relevance for options
    const sources = new Set(allRssItems.value.map(item => item.feedName).filter(Boolean));
    return Array.from(sources).sort(); // Sort source names alphabetically for the dropdown
});

const availableCategories = computed(() => {
    // Using allRssItems which is now sorted, but Set naturally removes order relevance for options
    const categories = new Set(allRssItems.value.map(item => item.category).filter(Boolean));
    return Array.from(categories).sort(); // Sort category names alphabetically for the dropdown
});

// 3. Filtered Data (operates on the sorted allRssItems)
const filteredRssItems = computed(() => {
    return allRssItems.value.filter(item => { // This now filters the already sorted list
        const sourceMatch = selectedSources.value.length === 0 || selectedSources.value.includes(item.feedName);
        const categoryMatch = selectedCategories.value.length === 0 || (item.category && selectedCategories.value.includes(item.category));
        return sourceMatch && categoryMatch;
    });
});

// 4. Total Count of Filtered Items
const totalFilteredItems = computed(() => filteredRssItems.value.length);

// 5. Paginated Data (takes pages from the filtered *and* sorted list)
const paginatedRssItems = computed(() => {
    const start = firstRecordIndex.value;
    const end = start + rowsPerPage.value;
    return filteredRssItems.value.slice(start, end); // Slices the sorted+filtered list
});

// --- Methods ---

const onPageChange = (event: PageState) => {
    currentPage.value = event.page + 1;
    rowsPerPage.value = event.rows;
};

// Date Formatting (no changes needed here)
const formatDate = (dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string => {
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
            <div class="filters-container p-mb-3 p-d-flex p-ai-center p-gap-3">
                <MultiSelect v-model="selectedSources" :options="availableSources" placeholder="Filtrer par Source"
                    :maxSelectedLabels="3" showClear class="p-inputtext-sm filter-multiselect" />

                <MultiSelect v-if="availableCategories.length > 0" v-model="selectedCategories"
                    :options="availableCategories" placeholder="Filtrer par Catégorie" :maxSelectedLabels="3" showClear
                    class="p-inputtext-sm filter-multiselect" />
            </div>

            <Paginator v-if="totalFilteredItems > 0" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="{first} à {last} sur {totalRecords} éléments" class="p-mb-3">
            </Paginator>
            <div v-else-if="!isLoading && !errorLoading && totalFilteredItems === 0" class="p-mb-3">
                <Message severity="info" :closable="false" class="info-message">
                    Aucun élément ne correspond à vos filtres.
                </Message>
            </div>


            <div v-if="paginatedRssItems.length > 0" class="rss-items-list">
                <Panel v-for="item in paginatedRssItems" :key="item._id?.$oid || item.link" toggleable collapsed
                    class="rss-panel">
                    <template #header>
                        <div class="rss-panel-header-content">
                            <div class="header-left-section">
                                <a :href="item.sourceFeed" target="_blank" rel="noopener noreferrer" @click.stop
                                    class="source-link"
                                    v-tooltip.top="`Ouvrir le flux source : ${item.feedName || 'Source'}`">
                                    <Badge :value="item.feedName || 'Source inconnue'" severity="info"></Badge>
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
/* All styles remain exactly the same as in the previous version */
/* --- Modified Styles for Filters --- */
.filters-container {
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    /* Reduced padding slightly */
    background-color: #3a3a3a;
    border-radius: 6px;
    border: 1px solid #555;
    /* p-d-flex p-ai-center p-gap-3 applied via class */
    flex-wrap: wrap;
    /* Allow wrapping on smaller screens */
}

/* Style for the multiselect components */
.filter-multiselect {
    min-width: 200px;
    /* Keep min-width */
    flex-grow: 1;
    /* Allow them to grow */
    flex-basis: 200px;
    /* Base width before growing */
}

/* --- Your Existing Styles --- */
.rss-feed-container {
    padding: 1rem;
    max-width: 1000px;
    margin: 1rem auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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

.rss-panel-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
}

.header-left-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    gap: 0.25rem;
}

.source-link {
    text-decoration: none;
    display: inline-block;
}

.source-link .p-badge {
    cursor: pointer;
}

.analysis-date {
    display: inline-flex;
    align-items: center;
    font-size: 0.8em;
    color: #aaa;
}

.analysis-date i {
    font-size: 0.9em;
    color: #aaa;
    margin-right: 4px;
}

.item-title {
    font-weight: 600;
    color: #eee;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    cursor: default;
}

:deep(.p-panel-header) {
    background-color: #444;
    border-bottom: 1px solid #555;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
}

:deep(.p-panel-title) {
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
</style>