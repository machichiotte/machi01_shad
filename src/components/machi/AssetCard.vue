<!-- src/components/machi/AssetCard.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { Machi } from '../../types/responseData';

import WalletBlock from './block/WalletBlock.vue';
import CurrentPriceBlock from './block/CurrentPriceBlock.vue';
import NextTp from './block/NextTp.vue';
import StratBlock from './block/StratBlock.vue';
import AssetBlock from './block/AssetBlock.vue';

// Déclarer les props
const props = defineProps<{
    item: Machi;
}>();

// Accès à 'item' via 'props'
const item = props.item;

const detailValue = ref(null);
const detailOptions = ref([
    { name: 'Open Orders', value: 1 },
    { name: 'Next TP', value: 2 },
    { name: 'Historic', value: 3 }
]);

const isDetailsVisible = ref(false);

const toggleDetails = () => {
    isDetailsVisible.value = !isDetailsVisible.value;
};
</script>

<template>

    <div class="card" v-if="item">
        <div class="card-header" @click="toggleDetails">
            <!-- Affichage de l'item et d'autres éléments -->

            <div class="case-a1">
                <AssetBlock :item="item" />

                <CurrentPriceBlock :item=item />

                <WalletBlock :item=item />

                <NextTp :item=item />

                <StratBlock />

            </div>

            <div class="case-a2">
                <p>{{ item.platform }}</p>

            </div>

            <div class="case-a3">
                <Button :icon="isDetailsVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="expand-button" />


            </div>

        </div>

        <!-- Détails supplémentaires lorsque le chevron est cliqué -->
        <div class="card-details" v-if="isDetailsVisible">
            <SelectButton v-model="detailValue" :options="detailOptions" optionLabel="name" multiple
                aria-labelledby="multiple" />

            <!-- ici je veux rajouter un triple choix avec des tabs primevue, qui va me permettre dafficher-->
            <p>Status: {{ item.status }}</p>
            <p>Profit: {{ item.profit }}</p>
            <p>Average Entry Price: {{ item.averageEntryPrice }}</p>
            <p>Total Amount: {{ item.totalAmount }}</p>
        </div>
    </div>

    <!-- Affichage si item est non défini -->
    <div v-else>
        <p>Chargement des données...</p>
        <!-- rajouter un loader -->
    </div>
</template>


<style scoped>
.card {
    border: 1px solid white;
    border-radius: 15px;
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    padding: 0.5rem;
    cursor: pointer;
    background-color: blue;
}

.card-header {
    display: grid;
    background-color: yellowgreen;
    height: fit-content;
}

.card-details {
    display: grid;
    background-color: darkblue;
    height: fit-content;
}

.icon {
    width: 64px;
    height: 64px;
}

.case-a1 {
    background-color: darkgoldenrod;
    display: flex;
    justify-content: space-between;
    align-items: center;
    grid-column: 1;
    grid-row: 1;
}

.case-a2 {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    align-items: center;
}

.case-a3 {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
}

/* Détails supplémentaires */
.card-details {
    margin-top: 1rem;
}

/* Chevron d'expansion */
.expand-button .pi-chevron-down {
    background-color: darkkhaki;
    font-size: 24px;
    /* Taille de l'icône */
    color: red;
    /* Couleur de l'icône */
}
</style>