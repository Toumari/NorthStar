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

// Simple Linear Regression to project next values
const calculateRegression = (values: number[]) => {
    const n = values.length
    if (n < 2) return { slope: 0, intercept: 0 }

    const x = Array.from({ length: n }, (_, i) => i) // 0, 1, 2...
    const y = values

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((a, b, i) => a + (b * y[i]), 0)
    const sumXX = x.reduce((a, b) => a + (b * b), 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
}

const chartData = computed(() => {
    const existingDates = props.tracker.data.map(d => d.date)
    const existingValues = props.tracker.data.map(d => d.value)
    
    // Project 5 data points into the future
    const projectionPoints = 5
    const { slope, intercept } = calculateRegression(existingValues)
    
    const labels = [...existingDates]
    const projectionDataset = Array(existingValues.length).fill(null) // Empty for existing part usually, but to connect line we can calculate trend for all

    // If we have enough data, generate projection
    if (existingValues.length >= 2) {
        // Last known date
        const lastDate = new Date(existingDates[existingDates.length - 1])
        
        for (let i = 1; i <= projectionPoints; i++) {
            const d = new Date(lastDate)
            d.setDate(d.getDate() + i) // Assuming daily tracking for simplicity of projection visual
            labels.push(d.toISOString().split('T')[0])
            
            // Calculate value: y = mx + c
            // x is index. Existing indices were 0 to n-1. New is n-1+i
            const x = (existingValues.length - 1) + i
            const y = slope * x + intercept
            projectionDataset.push(y)
        }
        
        // Connect projection to last real point
        projectionDataset[existingValues.length - 1] = existingValues[existingValues.length - 1]
    }

  return {
    labels: labels,
    datasets: [
      {
        label: props.tracker.name,
        backgroundColor: '#38bdf8',
        borderColor: '#38bdf8',
        data: existingValues,
        tension: 0.3,
        pointRadius: 4
      },
      {
        label: 'Trend',
        backgroundColor: 'rgba(168, 85, 247, 0.2)', // Purple
        borderColor: '#a855f7',
        borderDash: [5, 5],
        data: projectionDataset,
        tension: 0,
        pointRadius: 0,
        fill: false
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
        display: true,
        labels: {
            color: tickColor
        }
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
