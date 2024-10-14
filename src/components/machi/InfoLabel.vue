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
    color: blueviolet;
    background-color: yellowgreen;
    padding: 0.5rem;
}

.label-indice label {
    font-size: 1.2rem;
    color: darkorange;
    background-color: pink;
}

.label-indice small {
    background-color: chocolate;
    color: darkolivegreen;
    font-size: 0.9rem;
    margin-left: 10px;
}
</style>