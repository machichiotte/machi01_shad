<!-- src/components/block/StrategyBlock.vue -->
<script setup lang="ts">
import { ref, watch, defineEmits } from 'vue';
import BaseBlock from './BaseBlock.vue';


const props = defineProps({
    strat: String,
    stratExpo: Number
});


// Données pour les stratégies
const valueStrat = ref(props.strat);
const valueMaxExpo = ref(props.stratExpo);

const strats = ref([{ name: 'SHAD', value: 'shad' }, { name: 'AB/CD', value: 'ab/cd' }, { name: '...' }]); // Exemple de stratégies

const emit = defineEmits(['update:strat', 'update:stratExpo'])

// Émettre les valeurs au parent lorsqu'elles changent
watch(valueStrat, (newValue) => {
    emit('update:strat', newValue);
});

watch(valueMaxExpo, (newValue) => {
    emit('update:stratExpo', newValue);
});

// Prépare l'appel de la fonction de sauvegarde
const handleSave = () => {
    // Fonction de sauvegarde à appeler
    // emit('save', { strat: valueStrat.value, stratExpo: valueMaxExpo.value });
};
</script>

<template>
    <BaseBlock title="STRATEGY">
        <Button label="Save" icon="pi pi-save" class="p-button-success" @click="handleSave" />
        <!-- Bouton de sauvegarde -->

        <Select v-model="valueStrat" id="strat" :options="strats" optionLabel="name" optionValue="value"
            autocomplete="off" placeholder="Select a Strat" />
        <InputNumber id="expo" v-model="valueMaxExpo" class="input-small" autocomplete="off"
            placeholder="Select a max expo" />

    </BaseBlock>
</template>

<style scoped>
.input-small {
    width: 50%;
    /* Ajuste la largeur ici */
}

.max-exposure-select {
    margin-top: 1rem;
    padding: 0.2rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    width: 100%;
}
</style>