<!-- src/components/block/StrategyBlock.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import BaseBlock from './BaseBlock.vue';
// Données pour les stratégies
const valueStrat = ref(null);
const valueMaxExpo = ref(null);

const strats = ref([{ name: 'SHAD' }, { name: 'AB/CD' }, { name: '...' }]); // Exemple de stratégies
</script>

<template>
    <BaseBlock title="STRATEGY">
        <FloatLabel class="w-full md:w-56" variant="on">
            <!-- Select pour les stratégies -->
            <Select v-model="valueStrat" inputId="on_label" variant="filled" :options="strats" optionLabel="name"
                class="w-full" />
            <label for="on_label">strategy</label>
        </FloatLabel>

        <FloatLabel class="w-full md:w-56" variant="in">
            <Select v-model="valueStrat" inputId="in_label" :options="strats" optionLabel="name" class="w-full"
                variant="filled" />
            <label for="in_label">In Label</label>
        </FloatLabel>

        <FloatLabel variant="on">
            <InputText id="value3" v-model="valueMaxExpo" autocomplete="off" />
            <label for="value3">MAX EXPO</label>
        </FloatLabel>

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