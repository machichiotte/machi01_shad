<!-- src/components/machi/MachiCard.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { Machi } from '../../types/responseData';
const valueStrat = ref(null);
const strats = ref([{ name: 'shad' }, { name: 'ab/cd' }, { name: '...' }])

defineProps<{
    item: Machi;
}>();

const isDetailsVisible = ref(false);

const toggleDetails = () => {
    isDetailsVisible.value = !isDetailsVisible.value;
};
</script>

<template>
    <div class="machi-card">
        <div class="card-header" @click="toggleDetails">
            <!-- Partie 1 : Image et Rang -->
            <!-- Ligne 1 : Espace vide pour équilibrer visuellement -->
            <div class="case-a1">
                <p>#{{ item.rank }}</p>

            </div>
            <!-- Ligne 2 : Image -->
            <div class="case-b1">
                //todo bloquer a 64px
                <img :src="item.iconUrl" alt="Icon" class="icon" />
            </div>

            <!-- Ligne 3 : Rang -->
            <div class="case-c1">
                <p>{{ item.platform }}</p>

            </div>


            <!-- Partie 2 : Informations de l'asset -->
            <!-- Ligne 1 : Nom et Symbole, Possession et Balance -->
            <div class="case-a2">

                <!-- Nom et Symbole : pour le momeent cest au centre au dessus de lautre div, je veux cette div a gauche de case-a2 -->
                <div class="label-indice">

                    <label>{{ item.base }}</label>
                    <small>{{ 'XXX' }}</small>
                </div>

                <!-- Possession et Balance au centre de case-a2-->
                <div class="label-indice">
                    <label>{{ item.currentPossession }}$</label>
                    <small>{{ item.balance }} {{ item.base }}</small>
                </div>
            </div>

            <!-- Ligne 2 : Barre de progression -->
            <div class="case-b2">
                <ProgressBar :value='item.percentToNextTp'></ProgressBar>
            </div>

            <!-- Ligne 3 : Prix actuel et variation -->
            <div class="case-c2">
                <div class="label-indice">
                    <label>{{ item.currentPrice }}</label>
                    <small>
                        <span @click="">{{ '24h' }}</span>: {{ '666' }}%
                    </small>
                </div>
            </div>

            <!-- Partie 3 : Stratégie et Exposition -->
            <!-- Ligne 1 : Sélection de stratégie et exposition -->
            <div class="case-a3">
                <FloatLabel class="w-full md:w-56" variant="in">
                    <Select v-model="valueStrat" inputId="in_label" variant="filled" :options="strats"
                        optionLabel="name" class="w-full" />
                    <label for="in_label">strategy</label>
                </FloatLabel>
                <select>
                    <option>Max Exposition 1</option>
                    <option>Max Exposition 2</option>
                </select>
            </div>

            <!-- Ligne 2 : TP1 et prix -->
            <div class="case-b3">
                <div class="label-indice">
                    <label class="tp1-price"> {{ item.recupTp1 }}$</label>
                    <small>{{ item.base }}:{{ item.priceTp1 }}</small>
                </div>
            </div>

            <!-- Partie 4 : Chevron pour expansion -->
            <div class="case-b4">
                <Button icon="pi pi-chevron-down" class="expand-button" />
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
    padding: 0.5rem;
    height: 200px;
    gap: 0.5rem;
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

.label-indice label {
    text-align: left;
    background-color: pink;
}

.label-indice small {
    background-color: chocolate;
    display: inline-block;
    margin-left: 10px;
    font-size: 0.9rem;
}

.case-a1 {
    grid-column: 1;
    grid-row: 1;
}

.case-a2 {
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
}

.case-b2 {
    grid-column: 2;
    grid-row: 2;
}

.case-b3 {
    grid-column: 3;
    grid-row: 2;
}

.case-b4 {
    grid-column: 4;
    grid-row: 2;
}

.case-c1 {
    grid-column: 1;
    grid-row: 3;
}

.case-c2 {
    display: flex;
    align-items: center;
    grid-column: 2;
    grid-row: 3;
}

.case-c3 {
    grid-column: 3;
    grid-row: 3;
}

.case-b4 {
    display: flex;
    justify-content: center;
    align-items: center;
}

.expand-button {
    margin: 0;
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
.expand-button {
    margin-top: 0.5rem;
}
</style>