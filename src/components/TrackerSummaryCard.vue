<script setup lang="ts">
import { computed } from 'vue'
import type { Tracker } from '../stores/trackers'

const props = defineProps<{
  tracker: Tracker
}>()

const hasData = computed(() => props.tracker.data.length > 0)

const latestData = computed(() => {
  if (!hasData.value) return null
  return props.tracker.data[props.tracker.data.length - 1]
})

const previousData = computed(() => {
  if (props.tracker.data.length < 2) return null
  return props.tracker.data[props.tracker.data.length - 2]
})

const trend = computed(() => {
  if (!latestData.value || !previousData.value) return 'neutral'
  const current = latestData.value.value
  const prev = previousData.value.value
  
  if (current > prev) return 'up'
  if (current < prev) return 'down'
  return 'neutral'
})

const diff = computed(() => {
    if (!latestData.value || !previousData.value) return null
    const val = latestData.value.value - previousData.value.value
    // Fix floating point precision issues (e.g. 0.5999999 instead of 0.6)
    return Number(Math.abs(val).toFixed(2))
})

const formattedDate = computed(() => {
  if (!latestData.value) return ''
  const date = new Date(latestData.value.date)
  const today = new Date()
  
  // Reset hours for accurate comparison
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})
</script>

<template>
  <div class="summary-card">
    <div class="header">
      <h4 class="name">{{ tracker.name }}</h4>
      <span class="unit">{{ tracker.unit }}</span>
    </div>
    
    <div class="content" v-if="hasData">
      <div class="main-metric">
        <span class="value">{{ latestData?.value }}</span>
        <span class="trend-badge" :class="trend" v-if="diff !== null">
            <span class="icon" v-if="trend === 'up'">↑</span>
            <span class="icon" v-else-if="trend === 'down'">↓</span>
            <span class="icon" v-else>−</span>
            {{ diff }}
        </span>
      </div>
      <div class="meta">
         <span class="date">{{ formattedDate }}</span>
      </div>
    </div>
    
    <div class="empty" v-else>
      <span class="text-muted">No data yet</span>
    </div>
  </div>
</template>

<style scoped>
.summary-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* Allow name to take available space */
  min-width: 0; /* Enable flex shrinkage */
}

.unit {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap; /* Prevent wrapping */
  flex-shrink: 0; /* Don't shrink the unit */
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.main-metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.trend-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.trend-badge.up {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981; /* Emerald 500 */
}

.trend-badge.down {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444; /* Red 500 */
}

.trend-badge.neutral {
  background-color: var(--color-background);
  color: var(--color-text-muted);
}

.meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-style: italic;
}

/* Dark mode adjustments explicitly if needed, but var colors handle it */
</style>
