<!-- src/components/machi/ActionSelector.vue -->
<template>
    <div class="action-selector">
        <p v-if="!selectedAssets || selectedAssets.length === 0" class="no-assets-message">
            No assets selected. Please select assets to display available actions.
        </p>
        <!-- Action buttons -->
        <MyBunchSellButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets" />
        <MyEmergencySellButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets" />
        <MyBuyButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets" />
        <MyDeleteButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets"
            @delete-clicked="onDeleteClicked" />
    </div>
</template>

<script setup lang="ts">
import MyBunchSellButton from '../button/MyBunchSellButton.vue'
import MyEmergencySellButton from '../button/MyEmergencySellButton.vue'
import MyBuyButton from '../button/MyBuyButton.vue'
import MyDeleteButton from '../button/MyDeleteButton.vue'

// Définir les types pour les props
const { selectedAssets } = defineProps<{
    selectedAssets: Array<any>; // Remplacez `any` par le type approprié
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

.flex {
    display: flex;
}

.justify-content-end {
    margin-left: auto;
    /* Aligns to the right */
}

.no-assets-message {
    color: black;
    text-align: center;
    width: 100%;
}
</style>