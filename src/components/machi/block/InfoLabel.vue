<!-- /src/components/InfoLabel.vue -->
<script setup lang="ts">
defineProps<{
    label: string | number;
    small: string;
}>();
</script>

<template>
    <div class="label-indice">
        <label>{{ label }}</label>
        <small>{{ small }}</small>
    </div>
</template>

<style scoped>
.label-indice {
    display: flex;
    flex-direction: column;
    text-align: left;
    font-size: 1.2rem;
    padding: 0.5rem;
}

.label-indice label {
    font-size: 1.3rem;
}

.label-indice small {
    font-size: 0.8rem;
    margin-left: 20px;
}
</style>