<!-- src/components/machi/column/ChangePercentage.vue -->
<template>
    <span :class="percentageClass">
        {{ formattedPercentage }}%
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    percentage: number;
}

const props = defineProps<Props>();

const formattedPercentage = computed(() => {
    return props.percentage !== undefined && props.percentage !== null ? (props.percentage * 100).toFixed(2) : '0.00';
});

const percentageClass = computed(() => {
    if (props.percentage > 0) return 'text-green';
    if (props.percentage < 0) return 'text-red';
    return '';
});
</script>

<style scoped>
.text-green {
    color: #10b981;
}

.text-red {
    color: #ef4444;
}
</style>