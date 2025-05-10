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
    <div class="filters-container p-mb-3">
        <div class="p-d-flex p-flex-wrap p-ai-center p-gap-3">

            <span class="p-input-icon-left search-input-wrapper">
                <i class="pi pi-search search-icon" />
                <InputText v-model="searchQuery" placeholder="Rechercher..." class="p-inputtext-sm search-input"
                    style="width: 200px;" />
            </span>

            <MultiSelect v-model="selectedSources" :options="props.availableSources" placeholder="Sources"
                :maxSelectedLabels="1" showClear filter class="p-inputtext-sm compact-multiselect"
                :disabled="props.availableSources.length === 0" />

            <MultiSelect v-if="props.availableCategories.length > 0" v-model="selectedCategories"
                :options="props.availableCategories" placeholder="Catégories" :maxSelectedLabels="1" showClear filter
                class="p-inputtext-sm compact-multiselect" />

            <SelectButton v-model="contentFilterState" :options="contentFilterOptions" optionLabel="label"
                optionValue="value" aria-labelledby="content-filter-label" class="compact-selectbutton" />
            <span id="content-filter-label" class="p-sr-only">Filtrer par présence de contenu</span>


            <SelectButton v-model="selectedDateRange" :options="dateRangeOptions" optionLabel="label"
                optionValue="value" aria-labelledby="date-filter-label" class="compact-selectbutton" />
            <span id="date-filter-label" class="p-sr-only">Filtrer par période</span>


            <div class="reset-button-wrapper">
                <Button icon="pi pi-filter-slash" label="Reset" class="p-button-sm p-button-secondary reset-button"
                    @click="resetAllFilters" v-tooltip.bottom="'Réinitialiser tous les filtres'"
                    :disabled="isResetDisabled" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Conteneur général */
.filters-container {
    padding: 0.75rem;
    background-color: var(--card-secondary-bg);
    border-radius: 6px;
    margin-bottom: 1.5rem;
}

/* --- Barre de Recherche --- */
.search-input-wrapper {
    position: relative;
    flex-grow: 1;
    flex-basis: 250px;
    min-width: 200px;
}

.search-input {
    width: 100%;
}

/* --- Filtres Compacts --- */
.compact-multiselect,
.compact-selectbutton,
.reset-button-wrapper {
    flex-shrink: 0;
}

.compact-multiselect {
    min-width: 140px;
    width: auto;
}

.compact-selectbutton {
    width: auto;
}

/* --- Bouton Reset --- */
.reset-button-wrapper {
    margin-left: auto;
}

.reset-button {
    white-space: nowrap;
}

/* Accessibilité : Classe pour masquer visuellement mais garder accessible */
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
</style>
