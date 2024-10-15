<!-- src/components/block/WalletBlock.vue -->
<script setup lang="ts">
import { defineProps } from 'vue';
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';

// On définit les props que le composant WalletBlock va recevoir
const props = defineProps({
    item: Object // Le parent passe un objet item
});

</script>

<template>
    <BaseBlock title="NEXT TP">
        <InfoLabel :label="`${props?.item?.recupTp1}$`"
            :small="`${props?.item?.base}: ${props?.item?.priceTp1} USDT`" />
    </BaseBlock>
</template>

<style scoped></style>