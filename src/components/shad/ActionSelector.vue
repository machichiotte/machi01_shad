<!-- src/components/shad/ActionSelector.vue -->
<template>
    <div class="action-selector">
        <p v-if="!selectedAssets || selectedAssets.length === 0" class="no-assets-message">
            Aucun actif sélectionné. Veuillez sélectionner des actifs pour afficher les actions disponibles.
        </p>
        <!-- Boutons d'action -->
        <MyBunchSellButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets" />
        <MyEmergencySellButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets" />
        <MyBuyButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets" />
        <MyDeleteButton v-if="selectedAssets && selectedAssets.length > 0" :selectedAssets="selectedAssets"
            @delete-clicked="onDeleteClicked" />
    </div>
</template>

<script setup>
import MyBunchSellButton from '../buttons/MyBunchSellButton.vue'
import MyEmergencySellButton from '../buttons/MyEmergencySellButton.vue'
import MyBuyButton from '../buttons/MyBuyButton.vue'
import MyDeleteButton from '../buttons/MyDeleteButton.vue'

// Props à recevoir de ShadContainer.vue
const props = defineProps({
    selectedAssets: Array,
    filters: Object
});

// Expose `confirmDeleteSelected` pour être appelée par les composants parents
const emit = defineEmits(['delete-action']);
// Relayer l'événement vers le composant grand-parent
const onDeleteClicked = () => {
    emit('delete-action'); // Émettre l'événement "delete-action"
};
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

.no-assets-message {
    color: black;
    text-align: center;
    width: 100%;
}
</style>