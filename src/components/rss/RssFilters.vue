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
    background-color: #3a3a3a;
    border-radius: 6px;
    border: 1px solid #555;
    margin-bottom: 1.5rem;
    /* Le div interne avec p-d-flex gère maintenant la disposition */
}

/* --- Barre de Recherche --- */
.search-input-wrapper {
    position: relative;
    /* Pour l'icône absolue */
    /* display: block; Removed - let flexbox handle display */
    flex-grow: 1;
    /* Permet de grandir */
    flex-basis: 250px;
    /* Taille de base avant de grandir/rétrécir */
    min-width: 200px;
    /* Largeur minimale */
}

.search-input {
    width: 100%;
    /* Prend toute la largeur du wrapper */
}

/* Positionnement icône recherche */
:deep(.p-input-icon-left > i.search-icon) {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
    /* Reset margin éventuelle */
    color: #999;
    z-index: 2;
    /* Au cas où */
}

/* Padding Input pour ne pas passer sous l'icône */
:deep(.p-input-icon-left > .p-inputtext.search-input) {
    padding-left: 2.5rem !important;
}

/* --- Filtres Compacts --- */
/* Assurer que les filtres ne rétrécissent pas trop */
.compact-multiselect,
.compact-selectbutton,
.reset-button-wrapper {
    flex-shrink: 0;
    /* Empêche de rétrécir en dessous de leur taille naturelle */
}

.compact-multiselect {
    min-width: 140px;
    /* Largeur minimale */
    width: auto;
    /* Adjust width based on content */
}

.compact-selectbutton {
    width: auto;
    /* Adjust width based on content */
}

/* --- Bouton Reset --- */
.reset-button-wrapper {
    margin-left: auto;
    /* Pousse cet élément vers la fin de la ligne flex */
    /* flex-shrink: 0; déjà défini au-dessus */
}

.reset-button {
    white-space: nowrap;
    /* Empêche le retour à la ligne du texte */
}

/* --- Overrides PrimeVue pour Apparence (Thème Sombre) --- */

/* InputText */
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

/* MultiSelect */
:deep(.compact-multiselect .p-multiselect) {
    background-color: #444;
    border: 1px solid #666;
    color: #eee;
    font-size: 0.875rem;
}

:deep(.compact-multiselect .p-multiselect:not(.p-disabled):hover) {
    border-color: #888;
}

:deep(.compact-multiselect .p-multiselect.p-focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    border-color: #0ea5e9;
}

/* Panel du MultiSelect */
:deep(.p-multiselect-panel) {
    background-color: #444;
    border: 1px solid #666;
}

:deep(.p-multiselect-items) {
    padding: 0.25rem 0;
}

:deep(.p-multiselect-header) {
    background-color: #3a3a3a;
    border-bottom: 1px solid #555;
    padding: 0.5rem;
}

:deep(.p-multiselect-header .p-inputtext) {
    background-color: #555;
    border: 1px solid #777;
    color: #eee;
    font-size: 0.875rem;
    padding: 0.4rem 0.6rem;
}

:deep(.p-multiselect-header .p-multiselect-close) {
    color: #ccc;
    margin-left: 0.5rem;
}

:deep(.p-multiselect-item) {
    color: #eee;
    padding: 0.5rem 0.75rem;
    margin: 0;
    border-radius: 0;
}

:deep(.p-multiselect-item:hover) {
    background-color: #555;
}

:deep(.p-multiselect-item.p-highlight) {
    background-color: #0ea5e9;
    color: #fff;
}

:deep(.p-multiselect-item .p-checkbox) {
    margin-right: 0.5rem;
}

:deep(.p-multiselect-empty-message) {
    color: #aaa;
    padding: 0.5rem 0.75rem;
}

/* SelectButton */
:deep(.compact-selectbutton .p-button) {
    background-color: #555;
    border-color: #777;
    color: #ccc;
    /* Texte gris clair par défaut */
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
    /* Transition douce */
}

:deep(.compact-selectbutton .p-button:not(.p-highlight):not(.p-disabled):hover) {
    background-color: #666;
    border-color: #888;
    color: #fff;
    /* Texte blanc au survol */
}

/* Bouton sélectionné : Assurer que le texte est blanc et visible */
:deep(.compact-selectbutton .p-button.p-highlight) {
    background-color: #0ea5e9 !important;
    /* Bleu */
    border-color: #0ea5e9 !important;
    color: #ffffff !important;
    /* Blanc, !important pour forcer si conflit */
}

:deep(.compact-selectbutton .p-button:focus) {
    box-shadow: 0 0 0 0.2rem rgba(14, 165, 233, 0.3);
    z-index: 1;
    /* Pour que le focus soit visible au-dessus des autres */
}

/* Tooltips (styles par défaut de PrimeVue ou globaux sont généralement suffisants) */
/* :deep(.p-tooltip .p-tooltip-text) { ... } */

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
