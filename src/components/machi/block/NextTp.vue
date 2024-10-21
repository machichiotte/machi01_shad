<!-- src/components/block/WalletBlock.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import BaseBlock from './BaseBlock.vue';
import InfoLabel from './InfoLabel.vue';
import { TakeProfits } from '../../../types/responseData';
// On définit les props que le composant WalletBlock va recevoir
const props = defineProps<{
    takeProfits: TakeProfits; // Le parent passe un objet item
    recupTp1: number; // Correction de la syntaxe
    currentPrice: number; // Correction de la syntaxe
}>();

const formattedRecupTp1 = computed(() => {
    if (props?.recupTp1) {
        // Récupère le nombre de chiffres significatifs de currentPrice
        // Applique le même nombre de chiffres significatifs à priceTp1
        return Number(props.recupTp1).toFixed(2);
    }
    return props?.recupTp1; // Si currentPrice ou priceTp1 ne sont pas disponibles, on renvoie la valeur brute
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