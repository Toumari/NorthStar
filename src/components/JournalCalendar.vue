<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'

const props = defineProps<{
  mode?: 'dashboard' | 'sidebar'
}>()

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
  const dates: Set<string> = new Set(store.entries.map((e: any) => e.date))
  const today = new Date()
  let streak = 0
  let checkDate = today
  
  // Check if today has an entry, if not, check yesterday to start streak (allow 1 day gap if today isn't done yet)
  const todayStr = checkDate.toISOString().split('T')[0]
  // @ts-ignore
  if (!dates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayStr = checkDate.toISOString().split('T')[0]
    // @ts-ignore
    if (!dates.has(yesterdayStr)) {
      return 0
    }
  }
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    // @ts-ignore
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
  <div class="calendar-card" :class="{ 'sidebar-mode': mode === 'sidebar' }">
    <div class="calendar-section">
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
    </div>
    
    <div class="stats-section">
      <div class="stat-item">
         <span class="stat-value">{{ currentStreak }}</span>
         <span class="stat-label">Day Streak</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
         <span class="stat-value">{{ entriesThisMonth }}</span>
         <span class="stat-label">Entries this month</span>
      </div>
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
  /* height: 100%; Removed to allow natural height in sidebar */
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.calendar-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-section {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

@media (min-width: 1024px) {
  .calendar-card:not(.sidebar-mode) {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }

  .calendar-card:not(.sidebar-mode) .stats-section {
    flex-direction: column;
    border-top: none;
    padding-top: 0;
    padding-left: 2rem;
    border-left: 1px solid var(--color-border);
    height: 100%;
    justify-content: center;
    gap: 2rem;
    min-width: 150px;
  }
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
  flex: 1;
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
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
  color: var(--color-text);
  max-width: 40px; /* Prevent being too huge */
  margin: 0 auto; /* Center in grid cell */
  width: 100%;
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

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 2rem;
  line-height: 1.1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: var(--color-border);
}

@media (min-width: 1024px) {
  .stat-divider {
    width: 40px;
    height: 1px;
  }
}
</style>
