<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import type { Tracker } from '../stores/trackers'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps<{
  tracker: Tracker
}>()

const chartData = computed(() => {
  return {
    labels: props.tracker.data.map(d => d.date),
    datasets: [
      {
        label: props.tracker.name,
        backgroundColor: '#38bdf8',
        borderColor: '#38bdf8',
        data: props.tracker.data.map(d => d.value),
        tension: 0.3
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        color: '#334155'
      },
      ticks: {
        color: '#94a3b8'
      }
    },
    y: {
      grid: {
        color: '#334155'
      },
      ticks: {
        color: '#94a3b8'
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
}
</style>
