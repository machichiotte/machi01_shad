<template>
  <div>
    <h1>Mon portefeuille</h1>
    <div v-for="position in positions" :key="position.id">
      <p>{{ position.name }} : {{ position.percent }}%</p>
    </div>
    <div>
      <line-chart :data="chartData"></line-chart>
    </div>
  </div>
</template>
  
<script>
import { Line } from 'vue-chartjs';

export default {
  name: 'HomePage',
  extends: Line,
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.renderChart(this.data, { responsive: true, maintainAspectRatio: false });
  },
  data() {
    return {
      chartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Portfolio Value',
          data: [10000, 12000, 14000, 16000, 18000, 20000, 22000],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }],
      },
    };
  },
};
</script>