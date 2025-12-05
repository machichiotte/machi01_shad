<!-- src/components/dashboard/SearchBar.vue -->
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

<template>
    <div class="search-container">
        <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="props.filters.global.value" placeholder="Rechercher..." class="search-input" />
        </span>
    </div>
</template>

<style scoped>
.search-container {
    margin: 1rem 0;
    display: inline-block;
}

.search-input {
    width: auto;
    min-width: 250px;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 1rem;
    border: 1px solid var(--searchbar-border);
    background-color: var(--searchbar-bg);
    color: var(--searchbar-text);
}

.search-input:hover {
    border-color: var(--searchbar-border-hover);
}

.search-input:focus {
    outline: none;
    border-color: var(--searchbar-border-hover);
}

.p-input-icon-left {
    position: relative;
    display: block;
}

.p-input-icon-left i {
    position: absolute;
    top: 50%;
    left: 0.75rem;
    transform: translateY(-50%);
    color: var(--searchbar-icon);
    z-index: 1;
}

.p-input-icon-left i:hover {
    color: var(--searchbar-icon-hover);
}
</style>