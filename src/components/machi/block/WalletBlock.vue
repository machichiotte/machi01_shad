<!-- src/components/block/WalletBlock.vue -->
<script setup lang="ts">
import { Asset } from '../../../types/responseData';
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';

const props = defineProps<{
    item: Asset
}>();

</script>

<template>
    <BaseBlock title="WALLET">
        <InfoLabel :label="`${props.item.liveData.currentPossession}$`"
            :small="`${props.item.liveData.balance} ${props.item.base}`" />

    </BaseBlock>
</template>

<style scoped></style>