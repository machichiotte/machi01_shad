<!-- src/components/rss/RssFilters.vue -->
<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue';

// PrimeVue Components
import MultiSelect from 'primevue/multiselect';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';

// Define the shape of the filters object this component emits
export interface FilterState {
    searchQuery: string;
    selectedSources: string[];
    selectedCategories: string[];
    contentFilterState: 'all' | 'withContent' | 'noContent';
    selectedDateRange: 'all' | 'hour' | 'day' | 'week' | 'month' | 'year';
}

// Props
const props = defineProps({
    availableSources: {
        type: Array as PropType<string[]>,
        required: true
    },
    availableCategories: {
        type: Array as PropType<string[]>,
        required: true
    }
});

// Emits
const emit = defineEmits<{
    (e: 'update:filters', value: FilterState): void
    (e: 'reset'): void
}>();

// --- Internal Filter State Refs ---
const searchQuery = ref(''); // User input
const debouncedSearchQuery = ref(''); // Value used for emitting after debounce
const selectedSources = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const contentFilterState = ref<FilterState['contentFilterState']>('all');
const selectedDateRange = ref<FilterState['selectedDateRange']>('all');
// --- End Internal Filter State Refs ---

// --- Filter Options ---
const contentFilterOptions = ref([
    { label: 'Tous', value: 'all' },
    { label: 'Avec Contenu', value: 'withContent' },
    { label: 'Sans Contenu', value: 'noContent' }
]);

const dateRangeOptions = ref([
    { label: 'Tout', value: 'all' },
    { label: 'Heure', value: 'hour', tooltip: 'Dernière heure' },
    { label: '24h', value: 'day', tooltip: 'Dernières 24 heures' },
    { label: 'Semaine', value: 'week', tooltip: 'Derniers 7 jours' },
    { label: 'Mois', value: 'month', tooltip: 'Derniers 30 jours' },
    { label: 'Année', value: 'year', tooltip: 'Derniers 365 jours' }
]);
// --- End Filter Options ---

// --- Debounce Logic ---
let searchDebounceTimer: number | undefined;
watch(searchQuery, (newValue) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = window.setTimeout(() => {
        debouncedSearchQuery.value = newValue.trim(); // Update debounced value
    }, 400); // 400ms delay
});
// --- End Debounce Logic ---

// --- Watch for any filter change and emit update ---
watch(
    [debouncedSearchQuery, selectedSources, selectedCategories, contentFilterState, selectedDateRange],
    () => {
        emit('update:filters', {
            searchQuery: debouncedSearchQuery.value,
            selectedSources: selectedSources.value,
            selectedCategories: selectedCategories.value,
            contentFilterState: contentFilterState.value,
            selectedDateRange: selectedDateRange.value
        });
    },
    { deep: true } // Necessary for watching arrays
);

// --- Reset Logic ---
const resetAllFilters = () => {
    searchQuery.value = ''; // Also clears debounced value via its watcher
    selectedSources.value = [];
    selectedCategories.value = [];
    contentFilterState.value = 'all';
    selectedDateRange.value = 'all';
    // No need to emit here, the watchers will trigger the 'update:filters' emit
    // We emit 'reset' separately to signal the intention to the parent if needed
    emit('reset');
};

const isResetDisabled = computed(() => {
    return !debouncedSearchQuery.value &&
        selectedSources.value.length === 0 &&
        selectedCategories.value.length === 0 &&
        contentFilterState.value === 'all' &&
        selectedDateRange.value === 'all';
});
// --- End Reset Logic ---

</script>

<template>
    <div class="filters-container p-mb-3 p-d-flex p-flex-wrap p-ai-center p-gap-3">

        <span class="p-input-icon-left search-input-wrapper">
            <i class="pi pi-search" />
            <InputText v-model="searchQuery" placeholder="Rechercher (titre, résumé, analyse...)"
                class="p-inputtext-sm search-input" />
        </span>

        <MultiSelect v-model="selectedSources" :options="props.availableSources" placeholder="Filtrer par Source"
            :maxSelectedLabels="1" showClear filter class="p-inputtext-sm filter-multiselect"
            :disabled="props.availableSources.length === 0" />

        <MultiSelect v-if="props.availableCategories.length > 0" v-model="selectedCategories"
            :options="props.availableCategories" placeholder="Filtrer par Catégorie" :maxSelectedLabels="1" showClear
            filter class="p-inputtext-sm filter-multiselect" />

        <SelectButton v-model="contentFilterState" :options="contentFilterOptions" optionLabel="label"
            optionValue="value" aria-labelledby="content-filter-label" class="content-filter-selectbutton" />
        <span id="content-filter-label" class="p-sr-only">Filtrer par présence de contenu</span>

        <SelectButton v-model="selectedDateRange" :options="dateRangeOptions" optionLabel="label" optionValue="value"
            aria-labelledby="date-filter-label" class="date-filter-selectbutton">
            <template #option="slotProps">
                <span v-tooltip.bottom="slotProps.option.tooltip || slotProps.option.label">
                    {{ slotProps.option.label }}
                </span>
            </template>
        </SelectButton>
        <span id="date-filter-label" class="p-sr-only">Filtrer par période (date d'analyse)</span>

        <Button icon="pi pi-filter-slash" label="Effacer Filtres" class="p-button-sm p-button-secondary reset-button"
            @click="resetAllFilters" v-tooltip.bottom="'Réinitialiser tous les filtres et la recherche'"
            :disabled="isResetDisabled" />

    </div>
</template>

<style scoped>
/* Styles specific to the filters container and its elements */
/* Copied and potentially adapted from the original RssFeedDisplay.vue */
.filters-container {
    padding: 0.75rem 1rem;
    background-color: #3a3a3a;
    border-radius: 6px;
    border: 1px solid #555;
    /* display: flex; Already set by p-d-flex */
    /* flex-wrap: wrap; Already set by p-flex-wrap */
    /* align-items: center; Already set by p-ai-center */
    /* gap: 0.75rem; Already set by p-gap-3 */
    margin-bottom: 1.5rem;
    /* Use PrimeFlex class p-mb-3 */
}

.search-input-wrapper {
    flex-grow: 1;
    min-width: 200px;
    flex-basis: 250px;
}

.search-input {
    width: 100%;
}

.filter-multiselect {
    min-width: 160px;
    flex-basis: 180px;
    flex-grow: 1;
}

.content-filter-selectbutton,
.date-filter-selectbutton {
    flex-shrink: 0;
}

/* Responsive adjustments, same as before */
@media (max-width: 1100px) {
    .reset-button {
        margin-left: 0;
        flex-basis: 100%;
        order: 10;
        margin-top: 0.5rem;
    }

    .search-input-wrapper {
        flex-basis: calc(40% - 1rem);
    }

    .filter-multiselect {
        flex-basis: calc(30% - 1rem);
    }

    .content-filter-selectbutton,
    .date-filter-selectbutton {
        flex-basis: auto;
        order: 5;
    }
}

@media (max-width: 768px) {

    .search-input-wrapper,
    .filter-multiselect {
        flex-basis: calc(50% - 0.5rem);
    }

    .content-filter-selectbutton,
    .date-filter-selectbutton {
        flex-basis: calc(50% - 0.5rem);
    }
}

@media (max-width: 576px) {

    .search-input-wrapper,
    .filter-multiselect,
    .content-filter-selectbutton,
    .date-filter-selectbutton {
        flex-basis: 100%;
    }

    .reset-button {
        margin-top: 0.75rem;
    }
}

/* PrimeVue component overrides for filters (can stay here or be global) */
:deep(.p-multiselect) {
    /* Keep :deep if styles are scoped */
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
    font-size: 0.875rem;
}

:deep(.p-multiselect:not(.p-disabled):hover) {
    border-color: #888;
}

:deep(.p-multiselect.p-focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    border-color: #0ea5e9;
}

:deep(.p-inputtext) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
    font-size: 0.875rem;
}

:deep(.p-inputtext:enabled:hover) {
    border-color: #888;
}

:deep(.p-inputtext:enabled:focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    border-color: #0ea5e9;
}

:deep(.p-selectbutton .p-button) {
    background-color: #555;
    border-color: #777;
    color: #ccc;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
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
}

/* Accessibility helper */
.p-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

/* Tooltip styles (if v-tooltip is used and locally registered/imported) */
/* Or rely on global tooltip styles */
</style>