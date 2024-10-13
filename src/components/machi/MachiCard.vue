    <!-- src/components/machi/MachiCard.vue -->
    <script setup lang="ts">
    import { ref } from 'vue';
    import { Machi } from '../../types/responseData';

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
            <div class="header-part part-1">
                <img :src="item.iconUrl" alt="Icon" class="icon" />
                <div>
                    <p>#{{ item.rank }}</p>
                </div>
            </div>

            <!-- Partie 2 : Informations de l'asset -->
            <div class="header-part part-2">
                <!-- Nom et Symbole : Aligné à gauche -->
                <div class="flex flex-col gap-2 text-left">
                    <label>{{ item.base }}</label>
                    <small>{{ 'XXX' }}</small>
                </div>

                <!-- Possession et Balance : Centré -->
                <div class="flex flex-col gap-2 text-center">
                    <label>{{ item.currentPossession }}</label>
                    <small>{{ item.balance }}</small>
                </div>

                <!-- Barre de progression -->
                <div class="progress-bar">
                    <div class="filled" :style="{ width: `${item.percentToNextTp}%`, backgroundColor: 'green' }"></div>
                    <div class="unfilled" :style="{ width: `${100 - item.percentToNextTp}%`, backgroundColor: 'red' }">
                    </div>
                    <span>{{ item.percentToNextTp.toFixed(2) }}%</span>
                </div>

                <!-- Prix actuel et variation -->
                <div class="flex flex-col gap-2 text-center">
                    <label>{{ item.currentPrice }}</label>
                    <small>
                        <span @click="">{{ '24h' }}</span>:
                        {{ '666' }}%
                    </small>
                </div>
            </div>

            <!-- Partie 3 : Stratégie et Exposition -->
            <div class="header-part part-3">
                <div class="flex flex-col gap-2">
                    <select>
                        <option>Stratégie 1</option>
                        <option>Stratégie 2</option>
                    </select>
                    <select>
                        <option>Max Exposition 1</option>
                        <option>Max Exposition 2</option>
                    </select>
                </div>

                <div class="flex flex-col gap-2 text-center">
                    <label class="tp1-price">TP1: {{ item.recupTp1 }}</label>
                    <small>{{ item.priceTp1 }}</small>
                </div>
            </div>

            <!-- Partie 4 : Chevron pour expansion -->
            <div class="header-part part-4">
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
/* Carte avec bordure arrondie et background gris clair */
.machi-card {
    border: 1px solid red;
    border-radius: 15px;
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    background-color: blue;
    cursor: pointer;
}

.card-header {
    display: flex;

    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
}

/* Proportions des parties 1, 2, 3, et 4 */
.part-1 {
    flex-basis: 10%;
    background-color: aquamarine;
}

.part-2 {
    flex-basis: 65%;
}

.part-3 {
    flex-basis: 20%;
    background-color: aquamarine;

}

.part-4 {
    flex-basis: 5%;
}

/* Partie 1 : Image et Rang */
.part-1 img {
    width: 50px;
    height: 50px;
}

.part-1 p {
    font-size: 0.9rem;
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

/* Centrer les éléments textuels */
.flex-col {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Alignement vertical pour les dropdowns */
.dropdowns select {
    margin-bottom: 0.5rem;
}

.tp1-price {
    font-weight: bold;
}

/* Style des détails supplémentaires */
.card-details {
    margin-top: 1rem;
}

/* Chevron d'expansion */
.expand-button {
    margin-top: 0.5rem;
}
</style>

