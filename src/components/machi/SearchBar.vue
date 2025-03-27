<!-- src/components/machi/SearchBar.vue -->
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
    border: 1px solid #ced4da;
    transition: all 0.3s ease;
    font-size: 1rem;
}

.search-input:hover {
    border-color: #2196F3;
}

.search-input:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
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
    color: #6c757d;
    z-index: 1;
}

.p-input-icon-left i:hover {
    color: #2196F3;
}
</style>