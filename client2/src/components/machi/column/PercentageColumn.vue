<!-- src/components/machi/column/PercentageColumn.vue -->
<template>
    <span :class="percentageClass">
        {{ formattedPercentage }}%
    </span>
</template>

<script>
export default {
    name: 'PercentageColumn',
    props: {
        percentage: {
            type: Number,
            required: true
        }
    },
    computed: {
        // Formate le pourcentage à deux décimales
        formattedPercentage() {
            return this.percentage.toFixed(2);
        },
        // Applique des classes CSS en fonction de la valeur
        percentageClass() {
            return {
                'text-green': this.percentage > 0,
                'text-red': this.percentage < 0,
                'text-neutral': this.percentage === 0
            };
        }
    }
};
</script>

<style scoped>
.text-green {
    color: #4CAF50;
    /* Vert pourcentage positif */
}

.text-red {
    color: #F44336;
    /* Rouge pourcentage négatif */
}

.text-neutral {
    color: #9E9E9E;
    /* Gris pourcentage neutre */
}
</style>