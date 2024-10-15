<!-- src/components/block/StrategyBlock.vue -->
<script setup lang="ts">
import { ref } from 'vue';
// Données pour les stratégies
const valueStrat = ref(null);
const strats = ref([{ name: 'SHAD' }, { name: 'AB/CD' }, { name: '...' }]); // Exemple de stratégies
</script>

<template>
    <BaseBlock title="STRATEGY">
        <FloatLabel class="w-full md:w-56" variant="in">
            <!-- Select pour les stratégies -->
            <Select v-model="valueStrat" inputId="in_label" variant="filled" :options="strats" optionLabel="name"
                class="w-full" />
            <label for="in_label">strategy</label>
        </FloatLabel>

        <!-- Sélecteur pour l'exposition maximale -->
        <select class="max-exposure-select">
            <option>Max Exposition 1</option>
            <option>Max Exposition 2</option>
        </select>
    </BaseBlock>
</template>

<style scoped>
.max-exposure-select {
    margin-top: 1rem;
    padding: 0.2rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    width: 100%;
}
</style>