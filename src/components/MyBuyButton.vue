<!-- src/components/MyBuyButton.vue -->
<template>
    <div>
        <Button label="Add Buy Orders" icon="pi pi-cart-plus" severity="success" class="mr-2"
            @click="showBuyOrdersForm = true" />

        <Dialog v-if="showBuyOrdersForm" header="Add Buy Orders" :visible="showBuyOrdersForm" modal :closable="false"
            @hide="showBuyOrdersForm = false">
            <AddBuyOrdersForm :selectedAssets="props.selectedAssets" @close="showBuyOrdersForm = false" />

        </Dialog>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue' // Importer computed depuis la bibliothèque vue
import AddBuyOrdersForm from './AddBuyOrdersForm.vue'

//const selectedAssets = ref([]) // déclarer la référence selectedAssets

const props = defineProps({
    selectedAssets: Object // Définir le type de la prop comme un objet
})

const showBuyOrdersForm = ref(false)
</script>