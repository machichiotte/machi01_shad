<!-- src/components/trades/TradeActions.vue -->
<template>
    <div class="actions-container">
        <Toolbar>
            <template #start>
                <Button label="Add a new trade" icon="pi pi-cart-plus" severity="info" class="mr-2"
                    @click="handleShowDialog" />
            </template>
        </Toolbar>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['showDialog'])

function handleShowDialog() {
    emit('showDialog')
}
</script>

<style scoped>
.actions-container {
    margin-bottom: 1rem;
}
</style>