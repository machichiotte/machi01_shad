<!-- Chemin du fichier : src/components/strat/Strategy.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { strategies } from '../../js/strat/index';
import { useCalculStore } from '../../store/calculStore';
import { FilterMatchMode } from 'primevue/api';
import SearchBar from "../machi/SearchBar.vue";
import StrategyTable from "./StrategyTable.vue";
import {
  getSelectedStrategy,
  setSelectedStrategy,
  isVisible,
  getSelectedMaxExposure,
  setSelectedMaxExposure
} from '../../js/utils/strategyUtils';

// Interface pour définir la structure d'une stratégie
interface Strategy {
  label: string;
  // Vous pouvez ajouter d'autres propriétés si nécessaire
}

// Interface pour un item de solde
interface BalanceItem {
  platform: string;
  base: string;
  // Ajoutez d'autres propriétés en fonction de vos données
}

// Interface pour une ligne du tableau dynamique
interface TableRow {
  base: string;
  // Propriétés dynamiques pour chaque plateforme
  [platform: string]: any;
}

// Référence pour le filtre global avec valeur initiale ''
const filters = ref<{ global: { value: string; matchMode: string } }>({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS }
});

const calculStore = useCalculStore();

// Liste des stratégies et expositions disponibles
const strategiesList = ref<Strategy[]>(strategies);
const exposures = ref<(number | string)[]>([5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 900, 1000]);

// Extraction des labels pour les stratégies
const strategyLabels = computed<string[]>(() => strategiesList.value.map(strategy => strategy.label));

// Récupération des données du store
const balance = computed<BalanceItem[]>(() => calculStore.getBalance);
const strat = computed<any>(() => calculStore.getStrat); // Typage à affiner si possible

// Extraction et tri des plateformes et bases depuis le solde
const platforms = computed<string[]>(() => {
  return [...new Set(balance.value.map(item => item.platform))].sort();
});
const bases = computed<string[]>(() => {
  return [...new Set(balance.value.map(item => item.base))].sort();
});

// Construction des données du tableau
const tableData = computed<TableRow[]>(() => {
  if (!bases.value.length) {
    console.error('Aucune base trouvée');
    return [];
  }
  return bases.value.map(base => {
    const row: TableRow = { base };
    platforms.value.forEach(platform => {
      row[platform] = {
        strategy: getSelectedStrategy(strat.value, base, platform),
        maxExposure: getSelectedMaxExposure(strat.value, base, platform),
        isVisible: isVisible(strat.value, base, platform)
      };
    });
    return row;
  });
});

// Wrapper pour adapter la signature attendue par StrategyTable
const handleSetSelectedStrategy = (base: string, platform: string, value: string): void => {
  // Utilise strat.value pour passer la valeur supplémentaire attendue par la fonction d'origine
  setSelectedStrategy(strat.value, base, platform, value);
};

const handleSetSelectedMaxExposure = (base: string, platform: string, value: number | string): void => {
  // Conversion de value en number si nécessaire
  const numericValue = typeof value === 'string' ? Number(value) : value;
  setSelectedMaxExposure(strat.value, base, platform, numericValue);
};

// Chargement asynchrone des données
const getStrategyData = async (): Promise<void> => {
  try {
    await calculStore.loadStrat();
    await calculStore.loadBalance();
  } catch (error) {
    console.error("An error occurred while retrieving data:", error);
  }
};

onMounted(async () => {
  await getStrategyData();
});
</script>

<template>
  <div>
    <div class="text-align-left">
      <SearchBar :filters="filters" />
    </div>
    <!-- Wrapper pour centrer le tableau -->
    <div class="data-table-wrapper">
      <StrategyTable :tableData="tableData" :platforms="platforms" :strategyLabels="strategyLabels"
        :exposures="exposures" :setSelectedStrategy="handleSetSelectedStrategy"
        :setSelectedMaxExposure="handleSetSelectedMaxExposure" :globalFilter="filters.global.value" />
    </div>
  </div>
</template>

<style scoped>
.button {
  background: #007bff;
  color: white;
  padding: 0.3rem 0.7rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Style pour centrer le SearchBar */
.text-align-left {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

/* Style pour centrer le tableau */
.data-table-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
</style>
