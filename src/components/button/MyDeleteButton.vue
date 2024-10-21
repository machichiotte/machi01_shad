<!-- src/components/buttons/MyDeleteButton.vue -->
<template>
    <div>
        <Button label="Delete" icon="pi pi-trash" severity="danger" class="mr-2" @click="handleClick"
            :disabled="!selectedBases || !selectedBases.length" />
    </div>
</template>

<script setup>
const props = defineProps({
    selectedBases: {
        type: Array,
        default: () => []
    },
    model: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['delete:clicked'])

const handleClick = () => {
    emit('delete:clicked')
}
</script>