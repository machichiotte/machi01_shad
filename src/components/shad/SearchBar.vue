<!-- src/components/trades/TradeSearch.vue -->
<template>
    <div class="search-container mb-4">
        <Toolbar>
            <template #start>
                <IconField iconPosition="left">
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Search..." />
                </IconField>
            </template>
        </Toolbar>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
})
</script>

<style scoped>
.search-container {
    margin-bottom: 1rem;
}
</style>