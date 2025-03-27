<!-- src/components/machi/PercentageColumn.vue -->
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    percentage: number
}>();

// Check if the value is a valid number
const isNumber = computed(() => typeof props.percentage === 'number' && !isNaN(props.percentage));

// Display the default value or the formatted percentage
const displayValue = computed(() => {
    return isNumber.value ? `${(props.percentage as number * 100).toFixed(2)}%` : props.percentage;
});
</script>

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

<style scoped>
.text-green-500 {
    color: #10b981;
}

.text-red-500 {
    color: #ef4444;
}
</style>
