<template>
    <div>
        <canvas ref="chart"></canvas>
    </div>
</template>
  
<script>
import { Chart, LinearScale } from 'chart.js/auto';
Chart.register(LinearScale);

/*export default {
    name: "ShadOverlayGraph",
    mounted() {
        this.renderChart();
    },
    methods: {
        renderChart() {
            const ctx = this.$refs.chart.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [
                        {
                            label: 'Sales',
                            data: [120, 150, 180, 170, 200, 250, 210, 250, 150, 140],
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            type: 'linear',
                            beginAtZero: true,
                        },
                    },
                },
            });
        },
    },
};*/


export default {
    props: {
        trades: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            prices: [],
            chartData: null,
            chartOptions: {
                // Options de configuration du graphique
            }
        };
    },
    mounted() {
        // Récupération des données des trades et des prix depuis vos sources de données

        // Préparation des données pour le graphique
        this.prepareChartData();

        // Initialisation du graphique
        this.initChart();
    },
    methods: {
        prepareChartData() {
            // Préparation des données pour le graphique
            this.chartData = {
                labels: this.prices.map(price => price.snapped_at),
                datasets: [
                    {
                        label: 'Wallet',
                        data: this.prices.map(price => this.calculateTotalQuantity(new Date(price.snapped_at))),
                        borderColor: 'blue',
                        fill: false
                    }
                ]
            };
        },
        calculateTotalQuantity(date) {
            let totalQuantity = 0;

            // Parcourez les trades et effectuez les calculs appropriés
            this.trades.forEach(trade => {
                const tradeDate = new Date(trade.date);

                // Vérifiez si la date du trade correspond à la date spécifiée
                if (tradeDate.getTime() === date.getTime()) {
                    // Calculez la quantité en fonction du type de trade (achat ou vente)
                    if (trade.type === 'buy') {
                        totalQuantity += parseFloat(trade.amount);
                    } else if (trade.type === 'sell') {
                        totalQuantity -= parseFloat(trade.amount);
                    }
                }
            });

            return totalQuantity;
        },
        initChart() {
            const ctx = this.$refs.chart.getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: this.chartData,
                options: this.chartOptions
            });
        }
    }
};

</script>
  
<style scoped>
canvas {
    max-width: 600px;
    margin: 0 auto;
}
</style>
  