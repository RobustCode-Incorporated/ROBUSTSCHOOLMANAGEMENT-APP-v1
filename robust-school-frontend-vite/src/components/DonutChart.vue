<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!chartCanvas.value || !props.data) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: props.data.labels,
      datasets: [{
        data: props.data.values,
        backgroundColor: ['#3498db', '#2ecc71'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#0E2C5A',
            font: { family: 'Inter', size: 12 }
          }
        }
      }
    }
  })
}

onMounted(renderChart)
watch(() => props.data, renderChart, { deep: true })
</script>

<template>
  <div style="height: 100%; width: 100%;">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<style scoped>
.donut-chart-box {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-title {
  font-family: 'Ysabeau Office', sans-serif;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #0E2C5A;
  text-align: center;
}
</style>