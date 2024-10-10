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

<script setup lang="ts">
import { ref } from 'vue'
import AddBuyOrdersForm from '../form/AddBuyOrdersForm.vue'

// Define an interface for the props
interface Props {
    selectedAssets: Record<string, any>; // Define the prop type as an object
}

const props = defineProps<Props>() // Use the interface with defineProps

const showBuyOrdersForm = ref(false)
</script>