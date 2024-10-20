<!-- src/components/block/BaseBlock.vue -->
<template>
    <div class="custom-view">
        <!-- Zone tout en haut à gauche avec un titre configurable -->
        <header class="view-header">
            <p class="view-title">{{ props.title }}</p>
        </header>

        <!-- Contenu principal avec un slot pour du contenu personnalisé -->
        <div class="view-content">
            <div class="block">
                <slot></slot> <!-- Le contenu personnalisé sera injecté ici -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        default: 'DEFAULT TITLE'
    }
});
</script>

<style scoped>
/* Conteneur global de la vue */
.custom-view {
    border: 1px solid grey;
    border-radius: 4px;
    background-color: #df4949;
    padding-bottom: 0.8rem;
}

/* En-tête avec un titre configurable */
.view-header {
    height: 0.8rem;
    background-color: #5fe0c0;
    display: flex;
    justify-content: flex-start;
    padding-left: 0.4rem;
}

.view-title {
    margin: 0;
    font-size: 0.6rem;
    font-weight: bold;
    text-transform: uppercase;
    color: #666;
}

/* Contenu principal */
.view-content {
    padding-top: 0.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

/* Bloc réutilisable */
.block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
