<!-- src/components/Shad.vue -->
<template>
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <MyBunchSellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
          <MyEmergencySellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
          <MyBuyButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
          <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
            :disabled="!selectedAssets || !selectedAssets.length" />
          <MultiSelect v-model="selectedPlatforms" :options="platformOptions" optionLabel="name" optionValue="id"
            placeholder="Select Platforms" class="ml-2" display="chip" :panelClass="'platforms-multiselect-panel'">
            <template #item="slotProps">
              <Checkbox v-model="slotProps.checked" :label="slotProps.option.name" />
              <span>{{ slotProps.option.name }}</span>
            </template>
          </MultiSelect>

        </template>
        <template #end>
          <div class="flex justify-content-end">
            <IconField iconPosition="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </IconField>
          </div>
        </template>
      </Toolbar>

      <ShadDataTable :items="items" :filters="filters" @update:selectedAssets="updateSelectedAssets"/>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { FilterMatchMode } from 'primevue/api'
import MyEmergencySellButton from './buttons/MyEmergencySellButton.vue'
import MyBunchSellButton from './buttons/MyBunchSellButton.vue'
import MyBuyButton from './buttons/MyBuyButton.vue'
import ShadDataTable from './shad/ShadDataTable.vue'

import {
  FETCH_SHAD, GET_SHAD
} from '../store/storeconstants';

const store = useStore();

const selectedAssets = ref([]);

const shad = ref([]);

const showOverlay = ref(false);
const selectedAsset = ref();
const allRows = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const platformOptions = computed(() => {
  return [
    { id: 'binance', name: 'Binance' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'htx', name: 'HTX' },
    { id: 'okx', name: 'OKX' },
    { id: 'gateio', name: 'Gate.io' }
  ];
});
const selectedPlatforms = ref(platformOptions.value.map(platform => platform.id));

const items = computed(() => {
  return shad.value && shad.value.length > 0 ? shad.value : [];
});

onMounted(async () => {
  try {
    await store.dispatch('calcul/' + FETCH_SHAD);
    shad.value = await store.getters['calcul/' + GET_SHAD];
    console.log("Données Shad récupérées:", shad.value);  // Ajoutez ceci pour vérifier les données récupérées
  } catch (e) {
    console.error("Une erreur s'est produite lors de la récupération des données :", e);
  }
});

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};

function updateSelectedAssets(newSelection) {
    selectedAssets.value = newSelection;
}

</script>

<style scoped>
html {
  font-size: 14px;
}

body {
  font-family: var(--font-family);
  font-weight: normal;
  background: var(--surface-ground);
  color: var(--text-color);
  padding: 1rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.platforms-multiselect-panel {
  min-width: 200px;
}

/*p {
  line-height: 1.75;
}*/
</style>
