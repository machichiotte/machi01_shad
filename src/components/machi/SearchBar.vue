<!-- src/components/machi/SearchBar.vue -->
<template>
    <IconField iconPosition="left">
        <InputIcon>
            <i class="pi pi-search" />
        </InputIcon>
        <InputText v-model="props.filters.global.value" placeholder="Search..." />
    </IconField>
</template>

<script setup lang="ts">

interface Filters {
    global: {
        value: string | null;
    };
}

const props = defineProps<{
    filters: Filters;
}>();
</script>