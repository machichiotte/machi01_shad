<template>
    <div class="label-indice">
        <!-- Le label principal (ex: prix courant) -->
        <label>{{ label }}</label>

        <!-- Un seul small, qui change de valeur à chaque clic -->
        <small @click="showNextPeriod">
            {{ currentPeriod.period }}:
            <span :class="{ 'positive': currentPeriod.value >= 0, 'negative': currentPeriod.value < 0 }">
                {{ currentPeriod.value?.toFixed(2) }}%
            </span>
        </small>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Définition des props que le composant recevra
const props = defineProps<{
    label: string | number; // Le label principal (ex: currentPrice)
    periods: Array<{ period: string, value: number }>; // Liste des périodes et leurs pourcentages
}>();

// Index de la période actuellement affichée
const currentPeriodIndex = ref(0);

// Calcul de la période actuellement affichée
const currentPeriod = computed(() => props.periods[currentPeriodIndex.value]);

// Fonction pour passer à la période suivante
const showNextPeriod = () => {
    currentPeriodIndex.value = (currentPeriodIndex.value + 1) % props.periods.length; // Cycle à travers les périodes
};
</script>

<style scoped>
.label-indice {
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: 0.5rem;
}

.label-indice label {
    font-size: 1.2rem;
}

.label-indice small {
    font-size: 0.9rem;
    margin-left: 10px;
    cursor: pointer;
    font-weight: bold;
    transition: color 0.3s;
    /* Transition fluide */
}

.label-indice small:hover {
    text-decoration: underline;
}

/* Classe pour les valeurs positives */
.label-indice small .positive {
    color: green;
}

/* Classe pour les valeurs négatives */
.label-indice small .negative {
    color: red;
}
</style>
