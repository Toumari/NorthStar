<script setup lang="ts">
import { computed } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { useJournalStore } from '../stores/journal'
import { useTrackersStore } from '../stores/trackers'

const goalsStore = useGoalsStore()
const journalStore = useJournalStore()
const trackersStore = useTrackersStore()

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0]

// Generate last 365 days
const days = computed(() => {
  const dates = []
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
})

// Calculate activity level for each day
const activityMap = computed(() => {
  const map: Record<string, number> = {}
  
  // 1. Goals/Tasks completions (Note: We only track current state, not history date, 
  // so for this MVP we'll use creation date as a proxy for activity if we don't have completion date.
  // Ideally we'd have an activity log. For now, we'll use Journal entries and Tracker logs as primary data)
  
  // 2. Journal Entries
  journalStore.entries.forEach(entry => {
    const count = map[entry.date] || 0
    map[entry.date] = count + 2 // Journaling is significant
  })

  // 3. Tracker Data Points
  trackersStore.trackers.forEach(tracker => {
    tracker.data.forEach(point => {
        const count = map[point.date] || 0
        map[point.date] = count + 1
    })
  })

  return map
})

const getColor = (date: string) => {
  const count = activityMap.value[date] || 0
  if (count === 0) return 'var(--color-surface-hover)'
  if (count <= 1) return '#0ea5e940' // Sky 500 with low opacity
  if (count <= 2) return '#0ea5e980'
  if (count <= 4) return '#0ea5e9'
  return '#0369a1' // Sky 700
}

const getTooltip = (date: string) => {
    const count = activityMap.value[date] || 0
    return `${date}: ${count} activities`
}
</script>

<template>
  <div class="heatmap-container">
    <div class="heatmap-grid">
      <div 
        v-for="date in days" 
        :key="date" 
        class="day-cell"
        :style="{ backgroundColor: getColor(date) }"
        :title="getTooltip(date)"
      ></div>
    </div>
    <div class="legend">
      <span>Less</span>
      <div class="legend-scale">
          <div class="day-cell" style="background-color: var(--color-surface-hover)"></div>
          <div class="day-cell" style="background-color: #0ea5e940"></div>
          <div class="day-cell" style="background-color: #0ea5e980"></div>
          <div class="day-cell" style="background-color: #0ea5e9"></div>
          <div class="day-cell" style="background-color: #0369a1"></div>
      </div>
      <span>More</span>
    </div>
  </div>
</template>

<style scoped>
.heatmap-container {
    width: 100%;
    overflow-x: auto;
}

.heatmap-grid {
    display: grid;
    grid-template-rows: repeat(7, 10px); /* 7 days a week */
    grid-auto-flow: column;
    gap: 3px;
    margin-bottom: 1rem;
}

.day-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
}

.legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
}

.legend-scale {
    display: flex;
    gap: 3px;
}
</style>
