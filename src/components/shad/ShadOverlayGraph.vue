<!-- src/components/shad/ShadOverlayGraph.vue -->
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
                // Chart configuration options
            }
        };
    },
    mounted() {
        // Retrieve trade and price data from your data sources

        // Prepare data for the chart
        this.prepareChartData();

        // Initialize the chart
        this.initChart();
    },
    methods: {
        prepareChartData() {
            // Prepare data for the chart
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

            // Loop through trades and perform appropriate calculations
            this.trades.forEach(trade => {
                const tradeDate = new Date(trade.date);

                // Check if the trade date matches the specified date
                if (tradeDate.getTime() === date.getTime()) {
                    // Calculate quantity based on trade type (buy or sell)
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