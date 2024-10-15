<!-- src/components/block/WalletBlock.vue -->
<script setup lang="ts">
import { defineProps } from 'vue';
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';

const props = defineProps({
    item: Object
});

</script>

<template>
    <BaseBlock title="WALLET">
        <InfoLabel :label="`${props?.item?.currentPossession}$`"
            :small="`${props?.item?.balance} ${props?.item?.base}`" />

    </BaseBlock>
</template>

<style scoped></style>