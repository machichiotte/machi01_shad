<template>
    <div>
        <canvas ref="chart"></canvas>
    </div>
</template>
  
<script>
import { Chart, LinearScale } from 'chart.js/auto';
Chart.register(LinearScale);

export default {
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
};
</script>
  
<style scoped>
canvas {
    max-width: 600px;
    margin: 0 auto;
}
</style>
  