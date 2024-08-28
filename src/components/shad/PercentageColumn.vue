<!-- src/components/shad/PercentageColumn.vue -->
<template>
    <span :class="{
        'text-green-500': percentage > 0,
        'text-red-500': percentage < 0
    }">
        {{ (percentage * 100).toFixed(2) }}%
    </span>
</template>

<script setup>
defineProps({
    percentage: {
        type: Number,
        required: true
    }
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
