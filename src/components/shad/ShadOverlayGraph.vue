<!-- src/components/shad/ShadOverlayGraph.vue -->
<template>
    <div>
        <canvas ref="chart"></canvas>
    </div>
</template>

<script setup lang="ts">
import { Chart, LinearScale } from 'chart.js/auto';
Chart.register(LinearScale);

interface Props {
    trades: Array<{
        date: string;
        type: string;
        amount: string;
    }>;
}

const props = defineProps<Props>();

const prices = ref<Array<{ snapped_at: string }>>([]);
const chartData = ref<null | { labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number }[] }>(null);
const chartOptions = ref<{ scales: { y: { type: string; beginAtZero: boolean } } }>({
    scales: {
        y: {
            type: 'linear',
            beginAtZero: true,
        },
    },
});

onMounted(() => {
    prepareChartData();
    initChart();
});

function prepareChartData() {
    prices.value = props.trades.map(trade => ({
        snapped_at: trade.date,
    }));
    chartData.value = {
        labels: prices.value.map(price => price.snapped_at),
        datasets: [
            {
                label: 'Wallet',
                data: prices.value.map(price => calculateTotalQuantity(new Date(price.snapped_at))),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };
}

function calculateTotalQuantity(date: Date): number {
    let totalQuantity = 0;

    props.trades.forEach(trade => {
        const tradeDate = new Date(trade.date);

        if (tradeDate.getTime() === date.getTime()) {
            if (trade.type === 'buy') {
                totalQuantity += parseFloat(trade.amount);
            } else if (trade.type === 'sell') {
                totalQuantity -= parseFloat(trade.amount);
            }
        }
    });

    return totalQuantity;
}

function initChart() {
    const ctx = ref.value.$refs.chart.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: chartData.value,
        options: chartOptions.value,
    });
}
</script>

<style scoped>
canvas {
    max-width: 600px;
    margin: 0 auto;
}
</style>