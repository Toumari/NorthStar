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
import { useThemeStore } from '../stores/theme'

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
  const isDark = themeStore.isDark
  const primaryColor = isDark ? '#38bdf8' : '#0284c7' // Sky 400 vs Sky 600 matches main.css
  
  return {
    labels: props.tracker.data.map(d => d.date),
    datasets: [
      {
        label: props.tracker.name,
        backgroundColor: primaryColor,
        borderColor: primaryColor,
        data: props.tracker.data.map(d => d.value),
        tension: 0.3
      }
    ]
  }
})

const themeStore = useThemeStore()

const chartOptions = computed(() => {
  const isDark = themeStore.isDark
  
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const tickColor = isDark ? '#94a3b8' : '#64748b'
  
  return {
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
          color: gridColor
        },
        ticks: {
          color: tickColor
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: tickColor
        }
      }
    }
  }
})
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
