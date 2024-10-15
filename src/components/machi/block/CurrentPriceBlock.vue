<!-- src/components/block/CurrentPriceBlock.vue -->
<script setup lang="ts">
import { defineProps } from 'vue';
import BaseBlock from './BaseBlock.vue';
import InfoLabelClick from './InfoLabelClick.vue';

// On définit les props que le composant WalletBlock va recevoir
const props = defineProps({
    item: Object // Le parent passe un objet item
});

const periods = [
    { period: '24h', value: props?.item?.cryptoPercentChange24h },
    { period: '7d', value: props?.item?.cryptoPercentChange7d },
    { period: '30d', value: props?.item?.cryptoPercentChange30d },
    { period: '60d', value: props?.item?.cryptoPercentChange60d },
    { period: '90d', value: props?.item?.cryptoPercentChange90d }
];

</script>

<template>
    <BaseBlock title="CURRENT PRICE">
        <InfoLabelClick :label="`${props?.item?.currentPrice}`" :periods="periods" />
    </BaseBlock>
</template>

<style scoped></style>