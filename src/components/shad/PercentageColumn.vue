<!-- src/components/shad/PercentageColumn.vue -->
<template>
    <span v-if="isNumber" :class="{
        'text-green-500': percentage > 0,
        'text-red-500': percentage < 0
    }">
        {{ (percentage * 100).toFixed(2) }}%
    </span>
    <span v-else>
        {{ displayValue }}
    </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    percentage: {
        type: [Number, String], // Accepter Number ou String
        default: 'N/A' // Valeur par défaut si null ou undefined
    }
});

// Vérifier si la valeur est un nombre valide
const isNumber = computed(() => typeof props.percentage === 'number' && !isNaN(props.percentage));

// Afficher la valeur par défaut ou le pourcentage formaté
const displayValue = computed(() => {
  return isNumber.value ? `${(props.percentage * 100).toFixed(2)}%` : props.percentage;
});
</script>

<style scoped>
.text-green-500 {
    color: #10b981;
}

.text-red-500 {
    color: #ef4444;
}
</style>
