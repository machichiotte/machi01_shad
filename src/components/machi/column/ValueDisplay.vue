<!-- src/components/machi/column/ValueDisplay.vue -->
<template>
    <span>
        {{ formattedValue }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    value: number | null | undefined;
}>();

const formattedValue = computed(() => {
    if (typeof props.value === 'number') {
        return props.value.toFixed(2) + '$';
    } else {
        return NaN;
    }
});
</script>