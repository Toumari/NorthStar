<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'

const store = useJournalStore()
const router = useRouter()

const currentDate = ref(new Date())

const displayMonth = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const days = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  
  const result = []
  
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    result.push({ id: `prev-${i}`, empty: true })
  }
  
  // Days of current month
  for (let i = 1; i <= days; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const hasEntry = store.entries.some(e => e.date === dateStr)
    
    result.push({
      id: dateStr,
      date: i,
      fullDate: dateStr,
      hasEntry,
      today: isToday(dateStr)
    })
  }
  
  return result
})

const isToday = (dateStr: string) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const onDayClick = (day: any) => {
  if (day.empty) return
  router.push({ path: '/journal', query: { date: day.fullDate } })
}
const entriesThisMonth = computed(() => {
  return daysInMonth.value.filter(d => d.hasEntry).length
})

const currentStreak = computed(() => {
  const dates = new Set(store.entries.map(e => e.date))
  const today = new Date()
  let streak = 0
  let checkDate = today
  
  // Check if today has an entry, if not, check yesterday to start streak (allow 1 day gap if today isn't done yet)
  const todayStr = checkDate.toISOString().split('T')[0]
  if (!dates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayStr = checkDate.toISOString().split('T')[0]
    if (!dates.has(yesterdayStr)) {
      return 0
    }
  }
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (dates.has(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
})
</script>

<template>
  <div class="calendar-card">
    <div class="calendar-wrapper">
      <header class="calendar-header">
        <button class="nav-btn" @click="prevMonth">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h4>{{ displayMonth }}</h4>
        <button class="nav-btn" @click="nextMonth">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </header>

      <div class="calendar-grid">
        <div class="weekday">S</div>
        <div class="weekday">M</div>
        <div class="weekday">T</div>
        <div class="weekday">W</div>
        <div class="weekday">T</div>
        <div class="weekday">F</div>
        <div class="weekday">S</div>

        <div 
          v-for="day in daysInMonth" 
          :key="day.id"
          class="day-cell"
          :class="{ 
            'empty': day.empty, 
            'today': day.today,
            'has-entry': day.hasEntry
          }"
          @click="onDayClick(day)"
        >
          <span v-if="!day.empty">{{ day.date }}</span>
          <div class="dot" v-if="day.hasEntry"></div>
        </div>
      </div>
      
      <footer class="calendar-footer">
        <div class="stat-group">
          <div class="stat-badge">
             <span class="stat-value">{{ currentStreak }}</span>
             <span class="stat-label">Day Streak</span>
          </div>
          <div class="divider"></div>
          <div class="stat-badge">
             <span class="stat-value">{{ entriesThisMonth }}</span>
             <span class="stat-label">Entries ({{ new Date().toLocaleString('default', { month: 'short' }) }})</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.calendar-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  display: flex;
  justify-content: center; /* Center the wrapper on desktop */
}

.calendar-wrapper {
  width: 100%;
  max-width: 320px; /* Constrain width to prevent huge height on wide screens */
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.nav-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.nav-btn:hover {
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.weekday {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border-radius: 50%; /* Circle shape */
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
  color: var(--color-text);
}

.day-cell:not(.empty):hover {
  background-color: var(--color-surface-hover);
}

.day-cell.today {
  border: 1px solid var(--color-primary);
  font-weight: 700;
  color: var(--color-primary);
}

.day-cell.has-entry {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: var(--color-primary);
  border-radius: 50%;
  position: absolute;
  bottom: 4px;
}

.empty {
  cursor: default;
  pointer-events: none;
}

.calendar-footer {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.stat-value {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border);
}
</style>
