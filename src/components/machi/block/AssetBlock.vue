<!-- src/components/block/AssetBlock.vue -->
<script setup lang="ts">
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';

// On définit les props que le composant WalletBlock va recevoir
const props = defineProps({
    item: Object // Le parent passe un objet item
});
</script>

<template>
    <BaseBlock :title="`#${props?.item?.rank}`">
        <!-- Conteneur pour aligner horizontalement -->
        <div class="asset-content">
            <img :src="props?.item?.iconUrl" alt="Icon" class="icon" />
            <InfoLabel :label="`${props?.item?.base}$`" :small="`${props?.item?.base}`" />
        </div>
    </BaseBlock>
</template>

<style scoped>
.asset-content {
    display: flex;
    /* Utilise Flexbox */
    align-items: center;
    /* Aligne verticalement au centre */
}

.icon {
    width: 64px;
    /* Ajuste la taille selon tes besoins */
    height: 64px;
    /* Ajuste la taille selon tes besoins */
    margin-right: 0rem;
    /* Espace entre l'image et le label */
}
</style>
