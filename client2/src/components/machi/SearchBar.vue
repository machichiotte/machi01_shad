<!-- src/components/machi/SearchBar.vue -->
<template>
    <div class="search-container mb-4">
        <Toolbar>
            <template #start>
                <IconField iconPosition="left">
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="props.filters.global.value" placeholder="Search..." />
                </IconField>
            </template>
        </Toolbar>
    </div>
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

<style scoped>
.search-container {
    margin-bottom: 1rem;
}
</style>