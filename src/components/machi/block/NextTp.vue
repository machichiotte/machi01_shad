<!-- src/components/block/NextTp.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';
import { TakeProfits } from '../../../types/responseData';
// On définit les props que le composant WalletBlock va recevoir
const props = defineProps<{
    takeProfits: TakeProfits; // Le parent passe un objet i
    currentPrice: number; // Correction de la syntaxe
}>();

const formattedRecupTp1 = computed(() => {
    return (props.takeProfits.tp1.amount * props.takeProfits.tp1.price).toFixed(2); // Si currentPrice ou priceTp1 ne sont pas disponibles, on renvoie la valeur brute
});

const formattedPriceTp1 = computed(() => {
    if (props?.currentPrice && props?.takeProfits?.tp1.price) {
        // Récupère le nombre de chiffres significatifs de currentPrice
        const significantDigits = props.currentPrice.toString().replace('.', '').length;
        // Applique le même nombre de chiffres significatifs à priceTp1
        return Number(props.takeProfits.tp1.price).toPrecision(significantDigits);
    }
    return props?.takeProfits?.tp1.price; // Si currentPrice ou priceTp1 ne sont pas disponibles, on renvoie la valeur brute
});

</script>

<template>
    <BaseBlock title="NEXT TP">
        <InfoLabel :label="`${formattedRecupTp1}$`" :small="`sell price: ${formattedPriceTp1} USDT`" />
    </BaseBlock>
</template>

<style scoped></style>