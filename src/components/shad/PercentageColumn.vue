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
        type: [Number, String], // Accept Number or String
        default: 'N/A' // Default value if null or undefined
    }
});

// Check if the value is a valid number
const isNumber = computed(() => typeof props.percentage === 'number' && !isNaN(props.percentage));

// Display the default value or the formatted percentage
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
