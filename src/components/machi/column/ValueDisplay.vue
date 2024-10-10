<!-- src/components/machi/column/ValueDisplay.vue -->
<template>
    <span>
        {{ formattedValue }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    value: number | null | undefined;
}

const props = defineProps<Props>();

const formattedValue = computed(() => {
    if (typeof props.value === 'number') {
        return props.value.toFixed(2) + '$';
    } else {
        return 'N/A';
    }
});
</script>