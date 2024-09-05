<!-- src/components/shad/ActionSelector.vue -->
<template>
    <div class="action-selector">
        <!-- Boutons d'action -->
        <MyBunchSellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
        <MyEmergencySellButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
        <MyBuyButton :selectedAssets="selectedAssets" :disabled="!selectedAssets || !selectedAssets.length"
            :model="allRows" />
        <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
            :disabled="!selectedAssets || !selectedAssets.length" />
    </div>
</template>

<script setup>
import { MyBunchSellButton } from '../buttons/MyBunchSellButton.vue'
import { MyEmergencySellButton } from '../buttons/MyEmergencySellButton.vue'
import { MyBuyButton } from '../buttons/MyBuyButton.vue'

// Props à recevoir de ShadContainer.vue
const props = defineProps({
    selectedAssets: Array,
    allRows: Array,
    filters: Object
});

// Expose `confirmDeleteSelected` pour être appelée par les composants parents
const emit = defineEmits(['confirmDeleteSelected']);
</script>

<style scoped>
.action-selector {
    display: flex;
    justify-content: space-between;
    /* Répartit les boutons d'action et la barre de recherche */
    align-items: center;
    margin-bottom: 16px;
}

.flex {
    display: flex;
}

.justify-content-end {
    margin-left: auto;
    /* Aligne à droite */
}
</style>