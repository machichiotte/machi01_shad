<!-- src/components/block/StrategyBlock.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import BaseBlock from './BaseBlock.vue';

const props = defineProps({
    item: Object
});

const strat = props?.item?.strat || 'Shad';  //ce sont lesvaleurs que je veux attribuer 
const stratExpo = props?.item?.stratExpo || 0;

// Données pour les stratégies
const valueStrat = ref(strat);
const valueMaxExpo = ref(stratExpo);

const strats = ref([{ name: 'SHAD', value: 'Shad' }, { name: 'AB/CD', value: 'AB/CD' }, { name: '...' }]); // Exemple de stratégies
</script>

<template>
    <BaseBlock title="STRATEGY">

        <Select v-model="valueStrat" id="strat" :options="strats" optionLabel="name" optionValue="value"
            autocomplete="off" placeholder="Select a Strat" />

        <InputText id="expo" v-model="valueMaxExpo" autocomplete="off" placeholder="Select a max expo" />


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

.float-label {
    position: relative;
    margin-top: 1.5rem;
}

.float-label input {
    width: 100%;
    padding: 8px 8px 8px 12px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
}

/* Par défaut, le label est centré dans l'input */
.float-label label {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    font-size: 16px;
    color: #aaa;
    pointer-events: none;
    transition: all 0.2s ease;
}

/* Si le champ a du texte ou est en focus, le label flotte au-dessus */
.float-label input:focus+label,
.float-label input:not(:placeholder-shown)+label {
    top: 0;
    left: 8px;
    font-size: 12px;
    color: #007bff;
}

/* Modification de la bordure lorsque l'input est en focus */
.float-label input:focus {
    border-color: #007bff;
}
</style>