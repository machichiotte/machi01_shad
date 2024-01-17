<!-- src/components/PieChart.vue -->
<template>
    <div class="pie-chart-container">
        <h2>{{ this.platform }}</h2>
        <canvas :id="'chart-' + platform"></canvas>
    </div>
</template>
  
<script>
import Chart from "chart.js/auto";

export default {
    name: "PieChart",
    props: {
        balances: {
            type: Array,
            required: true,
        },
        platform: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            chart: null,
        };
    },
    mounted() {
        // Ajout d'un délai pour s'assurer que le conteneur a correctement rendu la première fois
        setTimeout(() => {
            this.generateChart();
        }, 100);
    },
    watch: {
        balances: 'generateChart', // Ajout d'un watcher pour regénérer le graphique lorsque les balances changent
    },
    methods: {
        generateChart() {
            const canvas = document.getElementById('chart-' + this.platform);
            const ctx = canvas.getContext('2d');

            if (!canvas || !canvas.getContext) {
                console.log('Canvas or context not available.');
                return;
            }

            // Vérifier si le graphique existe déjà
            if (this.chart) {
                // Détruire le graphique existant
                console.log('Destroy chart');
                this.chart.destroy();
                this.chart = null; // Réinitialiser la référence du graphique
            }

            // Calculer les parts pour le graphique en camembert
            const data = this.calculateChartData();

            // Vérifier à nouveau si le contexte est valide
            if (!ctx) {
                console.error('Unable to get context from canvas.');
                return;
            }

            // Configurer le graphique en camembert avec Chart.js
            this.chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: data.map(item => item.label),
                    datasets: [
                        {
                            data: data.map(item => item.value),
                            backgroundColor: data.map(item => item.color),
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                            position: 'bottom', // Vous pouvez ajuster la position selon vos préférences
                        },
                    },
                },
            });
        },
        calculateChartData() {
            // Calculer le total du portefeuille
            const totalBalance = this.getTotalBalance(this.balances);

            // Filtrer les éléments qui représentent moins de 5% du portefeuille
            const smallBalances = this.balances.filter(balance => (balance.value / totalBalance) <= 0.01);

            // Filtrer les éléments qui représentent plus de 5% du portefeuille
            const largeBalances = this.balances.filter(balance => (balance.value / totalBalance) > 0.01);
            // Trier les éléments de manière décroissante par pourcentage
            largeBalances.sort((a, b) => (b.value / totalBalance) - (a.value / totalBalance));


            // Regrouper les petits éléments dans "Autre"
            const otherBalance = {
                symbol: "Autre",
                balance: this.getTotalBalance(smallBalances),
            };

            // Construire le tableau de données pour le graphique en camembert
            const data = [...largeBalances, otherBalance].map(item => ({
                label: item.symbol,
                value: item.value,
                color: this.getRandomColor(),
            }));

            return data;
        },

        getTotalBalance(balances) {
            // Fonction utilitaire pour calculer le total des soldes
            return balances.reduce((total, balance) => total + parseFloat(balance.value), 0);
        },
        getRandomColor() {
            // Fonction utilitaire pour générer des couleurs aléatoires
            const letters = "0123456789ABCDEF";
            let color = "#";
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
    },
};
</script>
  
<style scoped>
.pie-chart-container {
    display: inline-block;
    width: 300px;
    /* Ajustez la largeur en fonction de vos besoins */
    margin: 10px;
    /* Ajoutez une marge entre les camemberts si nécessaire */
}

/* Ajoutez d'autres styles au besoin */
</style>