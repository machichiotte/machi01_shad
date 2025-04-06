<!-- src/components/rss/RssFeedDisplay.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCalculStore } from '../../store/calculStore';
import type { RssItem } from '../../types/responseData';
import FinancialAnalysisDisplay from './FinancialAnalysisDisplay.vue'; // ** Import the component **

// PrimeVue Components
import Panel from 'primevue/panel';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Badge from 'primevue/badge';
import Paginator, { type PageState } from 'primevue/paginator';
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button'; // ** Import Button **
//import { VTooltip } from 'v-tooltip'; // ** Import v-tooltip directive if not globally registered **

const calculStore = useCalculStore();
const isLoading = ref(true);
const errorLoading = ref<string | null>(null);

// --- Filter Refs ---
const selectedSources = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const searchQuery = ref(''); // Actual input value
const debouncedSearchQuery = ref(''); // Value used for filtering after debounce
const contentFilterState = ref<'all' | 'withContent' | 'noContent'>('all');
// --- End Filter Refs ---

const contentFilterOptions = ref([
    { label: 'Tous', value: 'all' },
    { label: 'Avec Contenu', value: 'withContent' },
    { label: 'Sans Contenu', value: 'noContent' }
]);

// --- Pagination Refs ---
const currentPage = ref(1);
const rowsPerPage = ref(10);
const firstRecordIndex = computed(() => (currentPage.value - 1) * rowsPerPage.value);
// --- End Pagination Refs ---

// --- Debounce Logic ---
let searchDebounceTimer: number | undefined;
watch(searchQuery, (newValue) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = window.setTimeout(() => {
        debouncedSearchQuery.value = newValue.trim().toLowerCase();
        resetPageAndFilter(); // Reset page when debounced search updates
    }, 400); // 400ms debounce delay
});
// --- End Debounce Logic ---

// --- Data Loading ---
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
// --- End Data Loading ---

// --- Computed Properties for Data Handling ---
const allRssItems = computed<RssItem[]>(() => {
    const items = calculStore.getRss;
    // Sort by processedAt date (descending)
    return [...items].sort((a, b) => {
        // Robust date parsing and comparison
        const timeA = a.processedAt ? new Date(a.processedAt).getTime() : 0;
        const timeB = b.processedAt ? new Date(b.processedAt).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
});

const availableSources = computed(() => {
    const sources = new Set(allRssItems.value.map(item => item.feedName).filter(Boolean));
    return Array.from(sources).sort();
});

const availableCategories = computed(() => {
    const categories = new Set(allRssItems.value.flatMap(item => item.category ? [item.category] : [])); // Handle potential undefined category
    return Array.from(categories).sort();
});

const filteredRssItems = computed(() => {
    let items = allRssItems.value;
    const activeFilters = []; // Keep track of active filters for message

    // Filter by Source
    if (selectedSources.value.length > 0) {
        items = items.filter(item => selectedSources.value.includes(item.feedName));
        activeFilters.push('source');
    }

    // Filter by Category
    if (selectedCategories.value.length > 0) {
        items = items.filter(item => item.category && selectedCategories.value.includes(item.category));
        activeFilters.push('catégorie');
    }

    // Filter by Content Presence
    if (contentFilterState.value === 'withContent') {
        items = items.filter(item => !!(item.summary && item.analysis));
        activeFilters.push('présence de contenu');
    } else if (contentFilterState.value === 'noContent') {
        items = items.filter(item => !(item.summary && item.analysis));
        activeFilters.push('absence de contenu');
    }

    // Filter by Search Query (using debounced value)
    const query = debouncedSearchQuery.value; // Use debounced value here
    if (query) {
        items = items.filter(item =>
            (item.title?.toLowerCase().includes(query)) ||
            (item.summary?.toLowerCase().includes(query)) ||
            (item.analysis?.relevanceReason?.toLowerCase().includes(query)) || // Search in analysis fields too
            (item.analysis?.sentimentReason?.toLowerCase().includes(query)) ||
            (item.analysis?.potentialImpact?.toLowerCase().includes(query)) ||
            (item.analysis?.mentionedAssets?.some(a => a.toLowerCase().includes(query))) ||
            (item.analysis?.financialThemes?.some(t => t.toLowerCase().includes(query)))
        );
        activeFilters.push('recherche');
    }

    // Add active filter info to a ref or directly use in computed message if needed
    // console.log("Active filters:", activeFilters);

    return items;
});

const totalFilteredItems = computed(() => filteredRssItems.value.length);

const paginatedRssItems = computed(() => {
    const start = firstRecordIndex.value;
    const end = start + rowsPerPage.value;
    return filteredRssItems.value.slice(start, end);
});
// --- End Computed Properties ---

// --- Methods ---
const onPageChange = (event: PageState) => {
    currentPage.value = event.page + 1; // PrimeVue pages are 0-indexed
    rowsPerPage.value = event.rows;
    window.scrollTo(0, 0); // Scroll to top on page change
};

const resetPageAndFilter = () => {
    currentPage.value = 1;
    // No need to explicitly call filter here, computed properties handle it
};

// ** New function to reset all filters **
const resetAllFilters = () => {
    searchQuery.value = ''; // Clear input visually
    debouncedSearchQuery.value = ''; // Clear debounced value for filtering
    selectedSources.value = [];
    selectedCategories.value = [];
    contentFilterState.value = 'all';
    resetPageAndFilter(); // Reset pagination
};

const formatDate = (dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) return 'Date inconnue';
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) {
            return 'Date invalide';
        }
        const defaultOptions: Intl.DateTimeFormatOptions = {
            //dateStyle: 'short', // Using custom format below for consistency
            //timeStyle: 'short',
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
            ...options
        };
        return dateObj.toLocaleString('fr-FR', defaultOptions);
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Erreur date';
    }
};

// Computed property for the "no results" message
const noResultsMessage = computed(() => {
    const hasActiveFilters = searchQuery.value ||
        selectedSources.value.length > 0 ||
        selectedCategories.value.length > 0 ||
        contentFilterState.value !== 'all';
    if (hasActiveFilters) {
        return "Aucun élément ne correspond à vos critères de recherche/filtre actifs.";
    } else {
        return "Aucun élément à afficher pour le moment.";
    }
});

// --- End Methods ---

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
                    <InputText v-model="searchQuery" placeholder="Rechercher (titre, résumé, analyse...)"
                        class="p-inputtext-sm search-input" />
                </span>

                <MultiSelect v-model="selectedSources" :options="availableSources" placeholder="Filtrer par Source"
                    :maxSelectedLabels="1" showClear class="p-inputtext-sm filter-multiselect"
                    @change="resetPageAndFilter" :disabled="availableSources.length === 0" filter />

                <MultiSelect v-if="availableCategories.length > 0" v-model="selectedCategories"
                    :options="availableCategories" placeholder="Filtrer par Catégorie" :maxSelectedLabels="1" showClear
                    class="p-inputtext-sm filter-multiselect" @change="resetPageAndFilter" filter />

                <SelectButton v-model="contentFilterState" :options="contentFilterOptions" optionLabel="label"
                    optionValue="value" aria-labelledby="content-filter-label" class="content-filter-selectbutton"
                    @change="resetPageAndFilter" />

                <Button icon="pi pi-filter-slash" label="Effacer Filtres"
                    class="p-button-sm p-button-secondary reset-button" @click="resetAllFilters"
                    v-tooltip.bottom="'Réinitialiser tous les filtres et la recherche'"
                    :disabled="!searchQuery && selectedSources.length === 0 && selectedCategories.length === 0 && contentFilterState === 'all'" />

            </div>

            <Paginator v-if="totalFilteredItems > 0" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} éléments" class="p-mb-3">
            </Paginator>

            <div v-else-if="!isLoading && !errorLoading && totalFilteredItems === 0" class="p-mb-3">
                <Message severity="info" :closable="false" class="info-message">
                    <span>{{ noResultsMessage }}</span>
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
                                    v-tooltip.top="`Ouvrir le flux source : ${item.feedName || 'Source inconnue'}`">
                                    <Badge :value="item.feedName || 'Inconnue'" severity="info" class="source-badge">
                                    </Badge>
                                </a>
                                <Badge v-if="item.category" :value="item.category" severity="contrast"
                                    class="category-badge" v-tooltip.top="`Catégorie : ${item.category}`"></Badge>
                                <span class="analysis-date" v-tooltip.top="'Date d\'analyse'">
                                    <i class="pi pi-calendar p-mr-1"></i>
                                    {{ formatDate(item.processedAt) }}
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
                            <div v-if="item.summary">
                                <h4>Résumé</h4>
                                <p class="summary">{{ item.summary }}</p>
                            </div>

                            <h4>Analyse Financière</h4>
                            <FinancialAnalysisDisplay :analysis="item.analysis" />

                            <div class="rss-item-footer">
                                <small>Publié le: {{ formatDate(item.publicationDate) }}</small>
                                <small>Récupéré le: {{ formatDate(item.fetchedAt) }}</small>
                            </div>
                        </div>
                    </template>
                </Panel>
            </div>

            <Paginator v-if="totalFilteredItems > rowsPerPage" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} éléments" class="p-mt-3">
            </Paginator>

        </div>
    </div>
</template>

<style scoped>
/* --- Keep existing styles and add/modify below --- */

.filters-container {
    margin-bottom: 1.5rem;
    padding: 0.75rem 1rem;
    background-color: #3a3a3a;
    border-radius: 6px;
    border: 1px solid #555;
    display: flex;
    /* Use flexbox */
    flex-wrap: wrap;
    /* Allow items to wrap */
    align-items: center;
    /* Align items vertically */
    gap: 0.75rem;
    /* Space between filter elements */
}

.search-input-wrapper {
    flex-grow: 1;
    /* Takes up available space */
    min-width: 200px;
    /* Minimum width */
    flex-basis: 250px;
    /* Ideal starting width */
}

.search-input {
    width: 100%;
    /* Fill the wrapper */
}

.filter-multiselect {
    min-width: 160px;
    /* Minimum width */
    flex-basis: 180px;
    /* Ideal starting width */
    flex-grow: 1;
    /* Allow growing */
}

.content-filter-selectbutton {
    flex-shrink: 0;
    /* Prevent shrinking */
}

.reset-button {
    margin-left: auto;
    /* Pushes the button to the right on wider screens */
    flex-shrink: 0;
    /* Prevent shrinking */
}


@media (max-width: 992px) {

    /* Adjust breakpoint if needed */
    .reset-button {
        margin-left: 0;
        /* Reset margin */
        flex-basis: 100%;
        /* Take full width on smaller screens */
        order: 10;
        /* Make it appear last */
    }

    .search-input-wrapper,
    .filter-multiselect {
        flex-basis: calc(50% - 0.5rem);
        /* Two columns layout */
    }

    .content-filter-selectbutton {
        flex-basis: calc(50% - 0.5rem);
        /* Two columns layout */
        order: 5;
        /* Adjust order if necessary */
    }

}

@media (max-width: 576px) {

    /* Adjust for very small screens */
    .search-input-wrapper,
    .filter-multiselect,
    .content-filter-selectbutton {
        flex-basis: 100%;
        /* Stack filters vertically */
    }
}


.rss-panel-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
    overflow: hidden;
    /* Prevent content overflow */
}

.header-left-section {
    display: flex;
    flex-direction: column;
    /* Stack badges/date vertically */
    align-items: flex-start;
    flex-shrink: 0;
    /* Prevent shrinking */
    width: auto;
    /* Adjust width based on content */
    min-width: 150px;
    /* Ensure minimum space */
    gap: 0.3rem;
    /* Space between elements in the left section */
}

.source-link {
    text-decoration: none;
    display: inline-block;
    /* Allow badges to sit nicely */
    max-width: 100%;
}

.source-badge,
.category-badge {
    display: inline-block;
    max-width: 150px;
    /* Limit badge width */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    /* Indicate link */
}

.category-badge {
    background-color: #6c757d;
    /* Bootstrap secondary color */
    color: #fff;
    font-size: 0.8em;
}

.analysis-date {
    display: inline-flex;
    align-items: center;
    font-size: 0.8em;
    color: #aaa;
    white-space: nowrap;
}

.analysis-date i {
    font-size: 0.9em;
    margin-right: 4px;
}


.item-title {
    font-weight: 600;
    color: #eee;
    flex-grow: 1;
    /* Takes remaining space */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    min-width: 0;
    /* Important for flex overflow */
    cursor: default;
    /* Indicate it's not clickable text itself */
    margin-left: 1rem;
    /* Add space between left section and title */
}

/* Keep other styles: .rss-feed-container, .loading-indicator, etc. */
/* Adjustments for PrimeVue component overrides */

:deep(.p-panel-header) {
    background-color: #444;
    border-bottom: 1px solid #555;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    /* Indicate header is clickable */
}

:deep(.p-panel-toggler) {
    margin-left: auto !important;
    /* Ensure toggler is far right */
}

:deep(.p-multiselect) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
    transition: border-color 0.2s;
}

:deep(.p-multiselect:not(.p-disabled):hover) {
    border-color: #888;
}

:deep(.p-multiselect.p-focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    /* Blueish focus ring */
    border-color: #0ea5e9;
}


:deep(.p-inputtext) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
    transition: border-color 0.2s, box-shadow 0.2s;
}

:deep(.p-inputtext:enabled:hover) {
    border-color: #888;
}

:deep(.p-inputtext:enabled:focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    /* Blueish focus ring */
    border-color: #0ea5e9;
}


/* Style adjustments for SelectButton and MultiSelect dropdowns */
:deep(.p-multiselect-panel .p-multiselect-header) {
    background-color: #3a3a3a;
    color: #eee;
    border-bottom: 1px solid #555;
}

:deep(.p-multiselect-panel .p-multiselect-filter-container .p-inputtext) {
    background-color: #555;
    color: #eee;
    border: 1px solid #777;
}

:deep(.p-multiselect-panel .p-multiselect-items .p-multiselect-item) {
    color: #eee;
}

:deep(.p-multiselect-panel .p-multiselect-items .p-multiselect-item:hover) {
    background-color: #5a5a5a;
    /* Darker hover */
}

:deep(.p-multiselect-panel .p-multiselect-items .p-multiselect-item.p-highlight) {
    background-color: #0ea5e9;
    /* PrimeVue blue */
    color: #fff;
}


:deep(.p-selectbutton .p-button) {
    background-color: #555;
    border-color: #777;
    color: #ccc;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

:deep(.p-selectbutton .p-button:not(.p-highlight):not(.p-disabled):hover) {
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
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    /* Blueish focus ring */
}


.rss-item-footer small {
    display: block;
    line-height: 1.4;
    margin-bottom: 0.25rem;
}

.rss-item-footer .error-text {
    color: #f87171;
    /* Light red for errors */
}

.rss-panel {
    margin-bottom: 1rem;
    border: 1px solid #555;
    border-radius: 6px;
    background-color: #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: box-shadow 0.3s ease;
    overflow: hidden;
    /* Ensure content stays within rounded corners */
}

.rss-panel:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
}

.rss-item-content {
    padding: 1rem 1.5rem;
    background-color: #333;
    color: #ccc;
}

.rss-item-content h4 {
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    color: #60a5fa;
    /* Lighter blue */
    border-bottom: 1px solid #555;
    padding-bottom: 0.3rem;
    font-weight: 600;
    font-size: 1.1em;
}

.rss-item-content h4:first-child {
    margin-top: 0;
}

.summary {
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.rss-item-footer {
    margin-top: 1.5rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #666;
    font-size: 0.8em;
    color: #aaa;
}


/* Tooltip styles (keep existing) */
:deep(.p-tooltip) {
    background-color: #222 !important;
    color: #eee !important;
    font-size: 0.85rem !important;
}

:deep(.p-tooltip .p-tooltip-arrow) {
    border-top-color: #222 !important;
    border-bottom-color: #222 !important;
    border-left-color: #222 !important;
    border-right-color: #222 !important;
}

/* Paginator styles (keep existing dark theme adjustments) */
:deep(.p-paginator) {
    background-color: #3a3a3a;
    border: 1px solid #555;
    color: #ccc;
    border-radius: 6px;
}

:deep(.p-paginator .p-paginator-current) {
    color: #ccc;
}

:deep(.p-paginator .p-dropdown) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
}

:deep(.p-paginator .p-dropdown .p-dropdown-trigger) {
    color: #eee;
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
    color: #eee;
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover) {
    background-color: #5a5a5a;
}

:deep(.p-paginator .p-paginator-page),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev) {
    color: #eee;
    min-width: 2.5rem;
    height: 2.5rem;
    transition: background-color 0.2s, color 0.2s;
}

:deep(.p-paginator .p-paginator-element:not(.p-disabled):hover) {
    background-color: #555;
    color: #fff;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
    background-color: #0ea5e9;
    border-color: #0ea5e9;
    color: #fff;
}

:deep(.p-paginator .p-paginator-element:focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    /* Blueish focus ring */
}
</style>