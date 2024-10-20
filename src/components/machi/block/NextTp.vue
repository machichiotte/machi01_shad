<!-- src/components/block/WalletBlock.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';

// On définit les props que le composant WalletBlock va recevoir
const props = defineProps({
    item: Object // Le parent passe un objet item
});

const formattedRecupTp1 = computed(() => {
    if (props?.item?.recupTp1) {
        // Récupère le nombre de chiffres significatifs de currentPrice
        // Applique le même nombre de chiffres significatifs à priceTp1
        return Number(props.item.recupTp1).toFixed(2);
    }
    return props?.item?.recupTp1; // Si currentPrice ou priceTp1 ne sont pas disponibles, on renvoie la valeur brute
});

const formattedPriceTp1 = computed(() => {
    if (props?.item?.currentPrice && props?.item?.priceTp1) {
        // Récupère le nombre de chiffres significatifs de currentPrice
        const significantDigits = props.item.currentPrice.toString().replace('.', '').length;
        // Applique le même nombre de chiffres significatifs à priceTp1
        return Number(props.item.priceTp1).toPrecision(significantDigits);
    }
    return props?.item?.priceTp1; // Si currentPrice ou priceTp1 ne sont pas disponibles, on renvoie la valeur brute
});

</script>

<template>
    <BaseBlock title="NEXT TP">
        <InfoLabel :label="`${formattedRecupTp1}$`" :small="`${props?.item?.base}: ${formattedPriceTp1} USDT`" />
    </BaseBlock>
</template>

<style scoped></style>