<!-- src/components/buttons/MyBuyButton.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import AddBuyOrdersForm from '../form/AddBuyOrdersForm.vue'

interface BaseOption {
    base: string;
    platform: string;
}

const props = defineProps<{
    selectedBases: BaseOption[];
}>();

const showBuyOrdersForm = ref(false)
</script>

<template>
    <div>
        <Button label="Add Buy Orders" icon="pi pi-cart-plus" severity="success" class="mr-2"
            @click="showBuyOrdersForm = true" />

        <Dialog v-if="showBuyOrdersForm" header="Add Buy Orders" :visible="showBuyOrdersForm" modal :closable="false"
            @hide="showBuyOrdersForm = false">
            <AddBuyOrdersForm :selectedBases="props.selectedBases" @close="showBuyOrdersForm = false" />
        </Dialog>
    </div>
</template>