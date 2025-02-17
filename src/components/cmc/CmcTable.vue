<!-- src/components/machi/CmcTable.vue -->
<script setup lang="ts">
import { cmcColumns } from '../../js/columns.ts'

// 1: Importation des fonctions réactives de Vue
import { computed, ref, watch } from 'vue';

// 2: Définition de l'interface pour une ligne de données CMC
interface CmcRow {
    rank: number;
    name: string;
    symbol: string;
    price: number;
    tags: string;
}

const cols = ref(cmcColumns)

// 3: Déclaration des props attendues par le composant avec un typage précis
const props = defineProps<{
    rows: CmcRow[]; // Liste des lignes à afficher
    globalFilter?: string; // Chaîne de filtre globale (optionnelle)
    itemsPerPage?: number; // Nombre d'éléments par page (optionnel)
}>();

// 5: Calcul du nombre d'éléments par page, valeur par défaut 100
const itemsPerPage = computed(() => props.itemsPerPage ?? 100);

// 6: Propriété calculée pour filtrer les lignes selon le filtre global
const filteredRows = computed(() => {
    if (!props.globalFilter || props.globalFilter.trim() === '') {
        return props.rows;
    }
    const filterText = props.globalFilter.toLowerCase();
    return props.rows.filter(row => {
        // Parcours de toutes les valeurs de la ligne pour voir si l'une contient le texte recherché
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(filterText)
        );
    });
});

// 7: Variable réactive pour la page courante
const currentPage = ref(1);

// 8: Calcul du nombre total de pages
const totalPages = computed(() => {
    return Math.ceil(filteredRows.value.length / itemsPerPage.value) || 1;
});

// 9: Réinitialisation de la page si le filtre change et que la page courante dépasse le total
watch(filteredRows, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
    }
});

// 10: Propriété calculée qui retourne uniquement les lignes de la page courante
const paginatedRows = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredRows.value.slice(start, start + itemsPerPage.value);
});

// 11: Fonction pour revenir à la page précédente
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value -= 1;
    }
};

// 12: Fonction pour passer à la page suivante
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
    }
};
</script>

<template>
    <!-- 13: Conteneur principal du tableau -->
    <div class="table-container">
        <table class="cmc-table">
            <!-- 14: En-tête du tableau généré dynamiquement en fonction des colonnes -->
            <thead>
                <tr>
                    <th v-for="(col, index) in cols" :key="index">
                        {{ col.header }}
                    </th>
                </tr>
            </thead>
            <!-- 15: Corps du tableau affichant uniquement les lignes paginées et filtrées -->
            <tbody>
                <tr v-for="(row, index) in paginatedRows" :key="index">
                    <td v-for="(col, idx) in cols" :key="idx">
                        {{ row[col.field as keyof CmcRow] }}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 16: Contrôles de pagination -->
        <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
    </div>
</template>

<style scoped>
/* 17: Style du conteneur global du tableau */
.table-container {
    margin-top: 1rem;
}

/* 18: Style de la table CMC */
.cmc-table {
    width: 100%;
    border-collapse: collapse;
}

/* 19: Style des en-têtes et cellules du tableau */
.cmc-table th,
.cmc-table td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
}

/* 20: Style des contrôles de pagination */
.pagination {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.pagination button {
    padding: 0.5rem 1rem;
    border: none;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}
</style>
