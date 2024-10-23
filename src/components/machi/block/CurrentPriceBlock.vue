<!-- src/components/block/CurrentPriceBlock.vue -->
<script setup lang="ts">
import { Asset } from '../../../types/responseData';
import BaseBlock from './BaseBlock.vue';
import InfoLabelClick from './InfoLabelClick.vue';

// On définit les props que le composant WalletBlock va recevoir
const props = defineProps<{
    item: Asset// Le parent passe un objet item
}>();

const periods = [
    { period: '24h', value: props.item.cmc.cryptoPercentChange24h },
    { period: '7d', value: props.item.cmc.cryptoPercentChange7d },
    { period: '30d', value: props.item.cmc.cryptoPercentChange30d },
    { period: '60d', value: props.item.cmc.cryptoPercentChange60d },
    { period: '90d', value: props.item.cmc.cryptoPercentChange90d }
];

</script>

<template>
    <BaseBlock title="CURRENT PRICE">
        <InfoLabelClick :label="`${props.item.liveData.currentPrice}`" :periods="periods" />
    </BaseBlock>
</template>

<style scoped></style>