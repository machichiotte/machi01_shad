<!-- src/components/PieChart.vue -->
<template>
    <div class="pie-chart-container">
        <h2>{{ platform }}</h2>
        <canvas :id="`chart-${platform}`"></canvas>
    </div>
</template>

<script lang="ts">
import Chart from "chart.js/auto";

/**
 * @component PieChart
 * @props {Array} balances
 * @props {String} platform
 */
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
        this.$nextTick(() => {
            this.generateChart();
        });
    },
    watch: {
        balances: 'generateChart',
    },
    methods: {
        generateChart() {
            const canvas = document.getElementById(`chart-${this.platform}`);
            if (!canvas) {
                console.error(`Canvas with ID chart-${this.platform} not found.`);
                return;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                console.error("Unable to get context from canvas.");
                return;
            }

            if (this.chart) {
                this.chart.destroy();
            }

            const data = this.calculateChartData();

            this.chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: data.map(item => item.label),
                    datasets: [{
                        data: data.map(item => item.value),
                        backgroundColor: data.map(item => item.color),
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom",
                        },
                    },
                },
            });
        },

        calculateChartData() {

            const totalBalance = this.getTotalBalance(this.balances);
            const largeBalances = this.balances
                .map(balance => this.calculateBalanceValue(balance))
                .filter(balance => (balance.currentPossession / totalBalance) > 0.01)
                .sort((a, b) => (b.currentPossession / totalBalance) - (a.currentPossession / totalBalance));

            const smallBalances = this.balances
                .map(balance => this.calculateBalanceValue(balance))
                .filter(balance => (balance.currentPossession / totalBalance) <= 0.01);

            const otherBalance = {
                label: "Other",
                value: smallBalances.reduce((acc, balance) => acc + parseFloat(balance.value), 0),
            };

            const data = [...largeBalances, otherBalance].map(balance => {
                const transformedBalance = {
                    label: balance.asset || "Unknown",
                    value: parseFloat(balance.value).toFixed(2),
                    color: this.getRandomColor(),
                };

                console.log("Transformed Balance:", transformedBalance);
                return transformedBalance;
            });

            return data;
        },

        calculateBalanceValue(balance) {
            console.log(`Calculating balance value for platform: ${balance.platform}, asset: ${balance.asset}`);

            const value = (parseFloat(balance.balance) * parseFloat(balance.currentPrice)).toFixed(2);
            console.log(`Value calculated: ${value}`);

            return {
                ...balance,
                value: value,
            };
        },

        getTotalBalance(balances) {
            return balances.reduce((total, balance) => {
                const currentPossession = parseFloat(balance.currentPossession);

                // Add to the sum only if currentPossession is a number
                if (!isNaN(currentPossession)) {
                    return total + currentPossession;
                }

                // If it's not a number, simply return the current total
                return total;
            }, 0);
        },

        getRandomColor() {
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