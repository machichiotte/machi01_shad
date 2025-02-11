<!-- src/components/machi/StrategyTable.vue -->
<script setup lang="ts">
// 1: Importation des fonctions nécessaires depuis Vue
import { computed, defineProps } from 'vue';

// 2: Définition de l'interface pour les données d'une plateforme dans une ligne du tableau
interface PlatformData {
    strategy: string;
    maxExposure: number | string;
    isVisible: boolean;
}

// 3: Définition de l'interface pour une ligne de tableau (chaque ligne représente une "base")
interface TableRow {
    base: string;
    // 4: Clés dynamiques pour chaque plateforme contenant un objet PlatformData
    [platform: string]: PlatformData | string;
}

// 5: Déclaration des props du composant
const props = defineProps<{
    tableData: TableRow[];
    platforms: string[];
    strategyLabels: string[];
    exposures: Array<number | string>;
    setSelectedStrategy: (base: string, platform: string, value: string) => void;
    setSelectedMaxExposure: (base: string, platform: string, value: number | string) => void;
    globalFilter?: string; // 6: Prop optionnelle pour le filtre global
}>();

// 7: Propriété calculée pour filtrer les données selon la valeur du filtre global
const filteredTableData = computed(() => {
    if (!props.globalFilter || props.globalFilter.trim() === '') {
        return props.tableData;
    }
    const filterText = props.globalFilter.toLowerCase();
    return props.tableData.filter(row => {
        // 8: On filtre sur le champ 'base'
        if (row.base.toLowerCase().includes(filterText)) {
            return true;
        }
        // 9: On filtre également sur les valeurs des plateformes (strategy et maxExposure)
        return props.platforms.some(platform => {
            const cell = row[platform] as PlatformData;
            if (cell && cell.isVisible) {
                return cell.strategy.toLowerCase().includes(filterText) ||
                    String(cell.maxExposure).toLowerCase().includes(filterText);
            }
            return false;
        });
    });
});

// 10: Gestionnaire d'événement pour la modification de la stratégie
const onStrategyChange = (base: string, platform: string, event: Event) => {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
        props.setSelectedStrategy(base, platform, target.value);
    }
};

// 11: Gestionnaire d'événement pour la modification du maxExposure
const onMaxExposureChange = (base: string, platform: string, event: Event) => {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
        props.setSelectedMaxExposure(base, platform, target.value);
    }
};
</script>

<template>
    <!-- 12: Conteneur du tableau -->
    <div class="table-container">
        <!-- 13: Début du tableau -->
        <table class="strategy-table">
            <!-- 14: En-tête du tableau -->
            <thead>
                <tr>
                    <th>Base</th>
                    <!-- 15: Création dynamique des colonnes pour chaque plateforme -->
                    <th v-for="platform in props.platforms" :key="platform">{{ platform }}</th>
                </tr>
            </thead>
            <!-- 16: Corps du tableau utilisant les données filtrées -->
            <tbody>
                <tr v-for="(row, rowIndex) in filteredTableData" :key="rowIndex">
                    <td>{{ row.base }}</td>
                    <td v-for="platform in props.platforms" :key="platform">
                        <!-- 17: Si les données de la plateforme sont visibles, on affiche les sélecteurs -->
                        <div v-if="(row[platform] as PlatformData)?.isVisible" class="select-container">
                            <!-- 18: Sélecteur pour la stratégie -->
                            <select :value="(row[platform] as PlatformData).strategy"
                                @change="(e) => onStrategyChange(row.base, platform, e)">
                                <option value=""></option>
                                <option v-for="strategy in props.strategyLabels" :key="strategy" :value="strategy">
                                    {{ strategy }}
                                </option>
                            </select>
                            <!-- 19: Sélecteur pour le maxExposure -->
                            <select :value="(row[platform] as PlatformData).maxExposure"
                                @change="(e) => onMaxExposureChange(row.base, platform, e)">
                                <option value=""></option>
                                <option v-for="exposure in props.exposures" :key="exposure" :value="exposure">
                                    {{ exposure }}
                                </option>
                            </select>
                        </div>
                        <!-- 20: Si les données ne sont pas visibles, affichage d'un indicateur -->
                        <div v-else>
                            -
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
/* 21: Style du conteneur du tableau */
.table-container {
    margin-top: 1rem;
}

/* 22: Style de la table */
.strategy-table {
    width: 100%;
    border-collapse: collapse;
}

/* 23: Style des en-têtes et des cellules */
.strategy-table th,
.strategy-table td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
}

/* 24: Style du conteneur pour les sélecteurs */
.select-container {
    display: flex;
    justify-content: center;
    gap: 10px;
}
</style>
