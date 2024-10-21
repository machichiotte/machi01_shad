<!-- src/components/machi/column/PriceWithChange.vue -->
<template>
    <div class="price-container">
        <div class="main-text">{{ formattedPrice }}</div>
        <div :class="percentageClass + ' percentage-text'">{{ formattedChange }}%</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    price: number;
    change: number;
}

const props = defineProps<Props>();

const formattedPrice = computed(() => {
    return props.price !== undefined && props.price !== null ? props.price.toFixed(2) : NaN;
});

const formattedChange = computed(() => {
    return props.change !== undefined && props.change !== null ? (props.change * 100).toFixed(2) : '0.00';
});

const percentageClass = computed(() => {
    if (props.change > 0) return 'text-green';
    if (props.change < 0) return 'text-red';
    return '';
});
</script>

<style scoped>
.price-container {
    position: relative;
    height: 50px;
    padding: 5px;
}

.main-text {
    text-align: center;
    font-size: 1rem;
    line-height: 20px;
}

.percentage-text {
    position: absolute;
    bottom: 2px;
    right: 5px;
    font-size: 0.8rem;
}

.text-green {
    color: #10b981;
}

.text-red {
    color: #ef4444;
}
</style>