<script setup lang="ts">
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { Radar } from 'vue-chartjs'
import { computed } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { useThemeStore } from '../stores/theme'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const goalsStore = useGoalsStore()
const themeStore = useThemeStore()

const chartData = computed(() => {
    const categories: Record<string, number> = {}
    
    // Count active goals per category
    goalsStore.activeGoals.forEach(goal => {
        const cat = goal.category || 'Uncategorized'
        categories[cat] = (categories[cat] || 0) + 1
    })

    const labels = Object.keys(categories)
    // Ensure we have at least 3 points for a radar to look good, fill dummies if needed
    if (labels.length < 3) {
       // Logic handled visually usually, but Radar needs dimensions. 
       // If empty, the chart just won't show much.
    }

    return {
        labels: labels,
        datasets: [
            {
                label: 'Focus Areas',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#38bdf8',
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#38bdf8',
                data: Object.values(categories)
            }
        ]
    }
})

const chartOptions = computed(() => {
    const isDark = themeStore.isDark
    const tickColor = isDark ? '#94a3b8' : '#64748b'
    const gridColor = isDark ? '#334155' : '#e2e8f0'
    const pointLabelColor = isDark ? '#e2e8f0' : '#475569'

    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: gridColor
                },
                grid: {
                    color: gridColor
                },
                pointLabels: {
                    color: pointLabelColor,
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: tickColor,
                    backdropColor: 'transparent' // Hide the white box behind numbers
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
})
</script>

<template>
  <div class="chart-container">
    <Radar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    height: 100%;
}
</style>
