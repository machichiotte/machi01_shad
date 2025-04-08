<!-- src/components/rss/RssFeedDisplay.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCalculStore } from '../../store/calculStore';
import RssFilters from './RssFilters.vue'; // Import Filter Component
import RssItemPanel from './RssItemPanel.vue'; // Import Item Component
import { useRssFiltering } from '../../composables/useRssFiltering'; // Import Filtering Logic

// import { formatDate } from '../../utils/formatters'; // No longer needed directly here if RssItemPanel imports it
import type { RssItem } from '../../types/responseData';
import type { FilterState } from './RssFilters.vue'; // Import Filter State type

// PrimeVue Components (Only those used directly in *this* template)
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Paginator from 'primevue/paginator';
import { useVuePagination } from '../../composables/useVuePagination.ts';

// --- Store and Loading State ---
const calculStore = useCalculStore();
const isLoading = ref(true);
const errorLoading = ref<string | null>(null);

// --- Data Fetching and Base Data ---
const internalAllRssItems = ref<RssItem[]>([]); // Store raw data locally

onMounted(async () => {
    isLoading.value = true;
    errorLoading.value = null;
    try {
        await calculStore.loadRss(); // Load data into the store
        // Get data from store and sort once
        const items = calculStore.getRss;
        internalAllRssItems.value = [...items].sort((a, b) => {
            const timeA = a.processedAt ? new Date(a.processedAt).getTime() : 0;
            const timeB = b.processedAt ? new Date(b.processedAt).getTime() : 0;
            if (isNaN(timeA) && isNaN(timeB)) return 0;
            if (isNaN(timeB)) return -1;
            if (isNaN(timeA)) return 1;
            return timeB - timeA; // Descending
        });
    } catch (error) {
        console.error("Erreur lors du chargement du flux RSS:", error);
        errorLoading.value = "Impossible de charger le flux RSS. Veuillez réessayer plus tard.";
    } finally {
        isLoading.value = false;
    }
});

// Make sorted data available as a computed ref for composables
const allRssItems = computed(() => internalAllRssItems.value);

// --- Filter State Management ---
const activeFilters = ref<FilterState>({
    searchQuery: '',
    selectedSources: [],
    selectedCategories: [],
    contentFilterState: 'all',
    selectedDateRange: 'all'
});

const handleFiltersChanged = (newFilters: FilterState) => {
    activeFilters.value = newFilters;
    // Pagination watcher in usePagination will handle reset if needed
};

const handleResetFilters = () => {
    // The RssFilters component already reset its internal state
    // We just need to update our activeFilters ref to match
    activeFilters.value = {
        searchQuery: '',
        selectedSources: [],
        selectedCategories: [],
        contentFilterState: 'all',
        selectedDateRange: 'all'
    };
    // Pagination watcher in usePagination will handle reset if needed
};

// --- Filtering Logic (via Composable) ---
const { filteredRssItems } = useRssFiltering(allRssItems, activeFilters);

// --- Pagination Logic (via Composable) ---
const totalFilteredItems = computed(() => filteredRssItems.value.length);
const {
    rowsPerPage,
    firstRecordIndex,
    onPageChange
    // currentPage, // Not directly used in template, but available
    // resetPagination // Available if manual reset needed
} = useVuePagination(totalFilteredItems, 10); // Pass totalItems, set initial rows

// --- Paginated Data ---
const paginatedRssItems = computed(() => {
    // Ensure start/end are valid even during loading/filtering transitions
    const start = Math.max(0, firstRecordIndex.value);
    const end = start + rowsPerPage.value;
    // Slice the *already filtered* items
    return filteredRssItems.value.slice(start, end);
});

// --- Data for Filter Props ---
const availableSources = computed(() => {
    // Calculate from the *original* sorted list
    const sources = new Set(allRssItems.value.map(item => item.feedName).filter(Boolean));
    return Array.from(sources).sort();
});

const availableCategories = computed(() => {
    // Calculate from the *original* sorted list
    const categories = new Set(allRssItems.value.flatMap(item => item.category ? [item.category] : []));
    return Array.from(categories).sort();
});

// --- No Results Message ---
const noResultsMessage = computed(() => {
    // Check if any filter is active (not in its default state)
    const hasActiveFilters = activeFilters.value.searchQuery ||
        activeFilters.value.selectedSources.length > 0 ||
        activeFilters.value.selectedCategories.length > 0 ||
        activeFilters.value.contentFilterState !== 'all' ||
        activeFilters.value.selectedDateRange !== 'all';

    if (hasActiveFilters) {
        return "Aucun élément ne correspond à vos critères de recherche/filtre actifs.";
    } else if (!isLoading.value && allRssItems.value.length === 0) {
        return "Aucun élément n'a été chargé."; // Message if initial load is empty
    } else {
        return "Aucun élément à afficher pour le moment."; // Default empty state
    }
});

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
            <RssFilters :available-sources="availableSources" :available-categories="availableCategories"
                @update:filters="handleFiltersChanged" @reset="handleResetFilters" class="p-mb-3" />

            <Paginator v-if="totalFilteredItems > 0" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange($event)" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} éléments" class="p-mb-3">
            </Paginator>

            <div v-else-if="!isLoading && !errorLoading && totalFilteredItems === 0" class="p-mb-3">
                <Message severity="info" :closable="false" class="info-message">
                    <span>{{ noResultsMessage }}</span>
                </Message>
            </div>

            <div v-if="paginatedRssItems && paginatedRssItems.length > 0" class="rss-items-list">
                <RssItemPanel v-for="item in paginatedRssItems" :key="item._id?.$oid || item.link" :item="item" />
            </div>

            <Paginator v-if="totalFilteredItems > rowsPerPage" :rows="rowsPerPage" :totalRecords="totalFilteredItems"
                :first="firstRecordIndex" @page="onPageChange($event)" :rowsPerPageOptions="[5, 10, 20, 50]"
                template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} éléments" class="p-mt-3">
            </Paginator>

        </div>
    </div>
</template>

<style scoped>
/* Keep only general styles, loading, error, and potentially Paginator overrides */
.rss-feed-container {
    /* Basic container styles if any */
    padding: 1rem;
    /* Example */
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #ccc;
}

.loading-indicator p {
    margin-top: 1rem;
}

.info-message {
    /* Style for the 'no results' message */
    width: 100%;
}

.rss-items-list {
    /* Styles for the list container if needed */
}


/* Paginator Dark Theme Adjustments (Keep these global overrides here or move to a global CSS) */
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
}

/* Tooltip global styles (if needed) */
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
</style>