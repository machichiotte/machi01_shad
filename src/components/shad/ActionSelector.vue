<!-- src/components/shad/ActionSelector.vue -->
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

<script setup>
import MyBunchSellButton from '../buttons/MyBunchSellButton.vue'
import MyEmergencySellButton from '../buttons/MyEmergencySellButton.vue'
import MyBuyButton from '../buttons/MyBuyButton.vue'
import MyDeleteButton from '../buttons/MyDeleteButton.vue'

// Props to receive from ShadContainer.vue
const props = defineProps({
    selectedAssets: Array,
    filters: Object
});

// Expose `confirmDeleteSelected` to be called by parent components
const emit = defineEmits(['delete-action']);
// Relay the event to the grandparent component
const onDeleteClicked = () => {
    emit('delete-action'); // Emit the "delete-action" event
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