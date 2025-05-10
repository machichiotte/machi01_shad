<!-- src/components/buttons/MyDeleteButton.vue -->
<script setup lang="ts">

defineProps<{
    selectedBases?: any[];
    model?: any[];
}>();

const emit = defineEmits<{
    (event: 'delete:clicked'): void;
}>();

const handleClick = () => {
    emit('delete:clicked');
};
</script>

<template>
    <div>
        <Button label="Delete" icon="pi pi-trash" severity="danger" class="mr-2" @click="handleClick"
            :disabled="!selectedBases || selectedBases.length === 0" />
    </div>
</template>