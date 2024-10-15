<!-- src/components/machi/MachiCard.vue -->
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


const isDetailsVisible = ref(false);

const toggleDetails = () => {
    isDetailsVisible.value = !isDetailsVisible.value;
};

// Utiliser item depuis props pour les périodes


// jaimerais que la valeur priceTp1 ait exactement le meme nombre de chiffre significatif que currentPrice
</script>

<template>
    <div class="machi-card" v-if="item">
        <div class="card-header" @click="toggleDetails">
            <!-- Affichage de l'item et d'autres éléments -->
            <div class="case-a1">

            </div>

            <div class="case-a2">
                <AssetBlock :item="item" />

                <WalletBlock :item=item />
            </div>

            <div class="case-a3">
                <StratBlock />
            </div>


            <div class="case-b1">

            </div>
            <div class="case-b2">
                <ProgressBar :value='item.percentToNextTp'></ProgressBar>
            </div>
            <div class="case-b3">
                <NextTp :item=item />
            </div>

            <div class="case-b4">
                <Button icon="pi pi-chevron-down" class="expand-button" />
            </div>


            <div class="case-c1">
                <p>{{ item.platform }}</p>
            </div>
            <div class="case-c2">
                <CurrentPriceBlock :item=item />
            </div>

            <div class="case-c3">
            </div>

        </div>

        <!-- Détails supplémentaires lorsque le chevron est cliqué -->
        <div class="card-details" v-if="isDetailsVisible">
            <p>Status: {{ item.status }}</p>
            <p>Profit: {{ item.profit }}</p>
            <p>Average Entry Price: {{ item.averageEntryPrice }}</p>
            <p>Total Amount: {{ item.totalAmount }}</p>
        </div>
    </div>

    <!-- Affichage si item est non défini -->
    <div v-else>
        <p>Chargement des données...</p>
    </div>
</template>


<style scoped>
.machi-card {
    border: 1px solid white;
    border-radius: 15px;
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    padding: 0.5rem;
    background-color: grey;
    cursor: pointer;

}

.card-header {
    display: grid;
    grid-template-columns: 1fr 6fr 2fr 1fr;
    grid-template-rows: repeat(3, 1fr);
    background-color: grey;
    height: auto;
}

.icon {
    width: 64px;
    height: 64px;
}

.label-indice {
    background-color: green;
    display: flex;
    flex-direction: column;
}

.case-a1 {
    grid-column: 1;
    grid-row: 1;
    align-items: center;
    display: flex;
    justify-content: center;
}

.case-a2 {
    background-color: darkgoldenrod;
    display: flex;
    justify-content: space-between;
    align-items: center;
    grid-column: 2;
    grid-row: 1;
}

.case-a2 .label-indice:nth-child(2) {
    text-align: center;
    flex: 1;
}

.case-a3 {
    grid-column: 3;
    grid-row: 1;
}

.case-a4 {
    grid-column: 4;
    grid-row: 1;
}

.case-b1 {
    grid-column: 1;
    grid-row: 2;
    align-items: center;
    display: flex;
    justify-content: center;
}

.case-b2 {
    grid-column: 2;
    grid-row: 2;
    background-color: darkslateblue;
    align-items: center;
    display: flex;
    justify-content: center;
}

.case-b3 {
    align-items: center;
    display: flex;
    justify-content: center;
    grid-column: 3;
    grid-row: 2;
}

.case-b4 {
    align-items: center;
    display: flex;
    justify-content: center;
    grid-column: 4;
    grid-row: 2;
}

.case-c1 {
    grid-column: 1;
    grid-row: 3;
    align-items: center;
    display: flex;
    justify-content: center;
}

.case-c2 {
    display: flex;
    justify-content: center;
    align-items: center;
    grid-column: 2;
    grid-row: 3;
}

.case-c3 {
    grid-column: 3;
    grid-row: 3;
}

/* Style de la barre de progression */
.progress-bar {
    width: 100%;
    height: 20px;
    position: relative;
    background-color: #5551518e;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 1rem;
}

.filled {
    height: 100%;
    background-color: green;
}

.unfilled {
    height: 100%;
    background-color: red;
    position: absolute;
    right: 0;
    top: 0;
}

/* pour la progress bar de PrimeVue*/
.p-progressbar {
    height: 20px;
    background: blue;
    font-size: smaller;
    /*fonctionne*/
}

/* ne fonctionne pas*/
.p-progressbar-label {
    color: red;
    font-size: smaller;
}

/* ne fonctionne pas*/
.p-progressbar-value {
    color: green;
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