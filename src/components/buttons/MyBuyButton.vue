<!-- src/components/buttons/MyBuyButton.vue -->
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
import { ref } from 'vue' // Import computed from the vue library
import AddBuyOrdersForm from '../forms/AddBuyOrdersForm.vue'

//const selectedAssets = ref([]) // declare the selectedAssets reference

const props = defineProps({
    selectedAssets: Object // Define the prop type as an object
})

const showBuyOrdersForm = ref(false)
</script>