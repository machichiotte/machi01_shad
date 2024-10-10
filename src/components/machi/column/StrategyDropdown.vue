<!-- src/components/machi/column/StrategyDropdown.vue -->
<template>
    <div>
        <select v-model="selectedStrategy" @change="onStrategyChange">
            <option value=""></option>
            <option v-for="strategy in strategyLabels" :key="strategy" :value="strategy">
                {{ strategy }}
            </option>
        </select>
        <input type="number" v-model.number="maxExposure" @input="onMaxExposureChange" @blur="onMaxExposureChange"
            placeholder="Max Exposure" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Strategy {
    label: string;
    value: string;
}

interface DataItem {
    strat: string;
    maxExposition: number;
    // Ajoutez d'autres propriétés si nécessaire
}

interface Props {
    data: DataItem;
    strategiesList: Strategy[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'apply-strategy', strategy: string, row: DataItem): void;
    (e: 'set-max-exposure', maxExposure: number, row: DataItem): void;
}>();

const selectedStrategy = ref(props.data.strat);
const maxExposure = ref<number>(props.data.maxExposition);

const strategyLabels = computed(() => props.strategiesList.map(strategy => strategy.label));

function onStrategyChange() {
    emit('apply-strategy', selectedStrategy.value, props.data);
}

function onMaxExposureChange() {
    emit('set-max-exposure', maxExposure.value, props.data);
}
</script>