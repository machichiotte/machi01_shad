<!-- src/components/machi/ActionSelector.vue -->
<template>
    <div class="action-selector">
        <p v-if="!selectedBases || selectedBases.length === 0" class="no-bases-message">
            No Base selected. Please select base to display available actions.
        </p>
        <!-- Action buttons -->
        <MyBunchSellButton v-if="selectedBases && selectedBases.length > 0" :selectedBases="selectedBases" />
        <MyEmergencySellButton v-if="selectedBases && selectedBases.length > 0" :selectedBases="selectedBases" />
        <MyBuyButton v-if="selectedBases && selectedBases.length > 0" :selectedBases="selectedBases" />
        <MyDeleteButton v-if="selectedBases && selectedBases.length > 0" :selectedBases="selectedBases"
            @delete-clicked="onDeleteClicked" />
    </div>
</template>

<script setup lang="ts">
import MyBunchSellButton from '../button/MyBunchSellButton.vue'
import MyEmergencySellButton from '../button/MyEmergencySellButton.vue'
import MyBuyButton from '../button/MyBuyButton.vue'
import MyDeleteButton from '../button/MyDeleteButton.vue'

// Définir les types pour les props
const { selectedBases } = defineProps<{
    selectedBases: Array<any>; // Remplacez `any` par le type approprié
    //filters: Record<string, any>; // Remplacez `any` par le type approprié
}>();

// Exposer `confirmDeleteSelected` pour être appelé par les composants parents
const emit = defineEmits<{
    (e: 'delete-action'): void;
}>();

// Relayer l'événement au composant grand-parent
const onDeleteClicked = () => {
    emit('delete-action'); // Émettre l'événement "delete-action"
};
</script>

<style scoped>
.action-selector {
    display: flex;
    justify-content: space-between;
    /* Distributes action buttons and search bar */
    align-items: center;
    margin-bottom: 16px;
}
</style>