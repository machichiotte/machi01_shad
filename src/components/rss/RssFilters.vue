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
        <div class="p-grid p-formgrid p-align-center p-nogutter-lg">

            <div class="p-col-12 p-md-5 p-lg-4 p-field p-mb-2 p-mb-lg-0">
                <span class="p-input-icon-left search-input-wrapper">
                    <i class="pi pi-search search-icon" />
                    <InputText v-model="searchQuery" placeholder="Rechercher..." class="p-inputtext-sm search-input" />
                </span>
            </div>

            <div class="p-col-12 p-sm-6 p-md-3 p-lg-auto p-field p-mb-2 p-mb-lg-0">
                <MultiSelect v-model="selectedSources" :options="props.availableSources" placeholder="Sources"
                    :maxSelectedLabels="1" showClear filter class="p-inputtext-sm compact-multiselect"
                    :disabled="props.availableSources.length === 0" />
            </div>

            <div v-if="props.availableCategories.length > 0"
                class="p-col-12 p-sm-6 p-md-3 p-lg-auto p-field p-mb-2 p-mb-lg-0">
                <MultiSelect v-model="selectedCategories" :options="props.availableCategories" placeholder="Catégories"
                    :maxSelectedLabels="1" showClear filter class="p-inputtext-sm compact-multiselect" />
            </div>

            <div class="p-col-12 p-sm-6 p-md-3 p-lg-auto p-field p-mb-2 p-mb-lg-0">
                <span id="content-filter-label" class="p-sr-only">Filtrer par présence de contenu</span>
                <SelectButton v-model="contentFilterState" :options="contentFilterOptions" optionLabel="label"
                    optionValue="value" aria-labelledby="content-filter-label" class="compact-selectbutton" />
            </div>

            <div class="p-col-12 p-sm-6 p-md-3 p-lg-auto p-field p-mb-2 p-mb-lg-0">
                <span id="date-filter-label" class="p-sr-only">Filtrer par période</span>
                <SelectButton v-model="selectedDateRange" :options="dateRangeOptions" optionLabel="label"
                    optionValue="value" aria-labelledby="date-filter-label" class="compact-selectbutton">
                    <template #option="slotProps">
                        <span v-tooltip.bottom="slotProps.option.tooltip || slotProps.option.label">
                            {{ slotProps.option.label }}
                        </span>
                    </template>
                </SelectButton>
            </div>

            <div class="p-col-12 p-md-2 p-lg-auto p-field p-ml-lg-auto p-text-right">
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
    /* Padding uniforme */
    background-color: #3a3a3a;
    border-radius: 6px;
    border: 1px solid #555;
    margin-bottom: 1.5rem;
}

/* Espacement entre les colonnes/champs */
.p-field {
    /* Utilise p-formgrid pour l'espacement ou ajoute un padding léger si nécessaire */
    padding: 0 0.4rem;
    /* Léger padding horizontal entre les éléments */
    margin-bottom: 0.5rem;
    /* Espacement vertical mobile */
}

/* Responsive: Pas de marge en bas et ajustement padding sur grand écran */
@media (min-width: 992px) {

    /* lg */
    .p-field.p-mb-lg-0 {
        margin-bottom: 0;
    }

    .p-grid>.p-field:last-child {
        padding-right: 0;
    }

    /* Pas de padding après le dernier */
    .p-grid>.p-field:first-child {
        padding-left: 0;
    }

    /* Pas de padding avant le premier */
}

/* Responsive: Reset alignement bouton reset sur écrans moyens et petits */
@media (max-width: 991px) {

    /* En dessous de lg */
    .p-ml-lg-auto {
        margin-left: 0 !important;
    }

    /* Reset le push à droite */
    .p-text-right {
        text-align: left;
    }

    /* Alignement gauche pour reset sur mobile */
}

/* Responsive: Assure alignement gauche sur mobile */
@media (max-width: 767px) {

    /* md et en dessous */
    .p-text-right {
        text-align: left;
    }
}


/* --- Barre de Recherche --- */
.search-input-wrapper {
    position: relative;
    /* Nécessaire pour positionner l'icône absolument */
    display: block;
    /* Prend la largeur de la colonne */
    width: 100%;
}

.search-input {
    width: 100%;
    /* Prend toute la largeur du wrapper */
    /* Le padding est géré par :deep ci-dessous */
}

/* Positionnement et alignement de l'icône de recherche */
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

/* S'assurer que le texte ne va pas sous l'icône */
:deep(.p-input-icon-left > .p-inputtext.search-input) {
    padding-left: 2.5rem !important;
    /* Espace suffisant pour l'icône */
}


/* --- Filtres Compacts --- */
/* Style pour rendre MultiSelect plus compact */
.compact-multiselect {
    min-width: 140px;
    /* Largeur minimale pour lisibilité */
    width: auto;
    /* Taille naturelle */
}

/* Styles pour rendre SelectButton compact */
.compact-selectbutton {
    width: auto;
    /* Taille naturelle */
}

/* Styles pour le bouton Reset */
.reset-button {
    white-space: nowrap;
    /* Empêche le retour à la ligne du texte */
}


/* --- Overrides PrimeVue pour Apparence (Thème Sombre) --- */

/* InputText (partie de la recherche) */
:deep(.p-inputtext) {
    /* Style de base */
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
    /* Cibler via la classe ajoutée */
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

/* Panel du MultiSelect (dropdown) */
:deep(.p-multiselect-panel) {
    background-color: #444;
    border: 1px solid #666;
}

:deep(.p-multiselect-items) {
    /* Conteneur des items */
    padding: 0.25rem 0;
}

:deep(.p-multiselect-header) {
    background-color: #3a3a3a;
    border-bottom: 1px solid #555;
    padding: 0.5rem;
}

:deep(.p-multiselect-header .p-inputtext) {
    /* Style du filtre dans le dropdown */
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
    /* Pas de flex-grow pour garder compact */
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

/* Tooltips (si nécessaire de styliser spécifiquement) */
/* :deep(.p-tooltip .p-tooltip-text) { ... } */

/* Accessibilité */
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