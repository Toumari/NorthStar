<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useJournalStore } from '../stores/journal'
import { useSubscriptionStore } from '../stores/subscription'
import JournalEntryCard from '../components/JournalEntryCard.vue'
import UpgradePrompt from '../components/UpgradePrompt.vue'

const store = useJournalStore()
const subscriptionStore = useSubscriptionStore()
const showUpgradePrompt = ref(false)

const datePickerValue = ref('')
const dateInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  subscriptionStore.loadSubscription()
})

const todayStr = new Date().toISOString().split('T')[0]

// Main Feed Logic
const feedItems = computed(() => {
    const entries = [...store.entries].sort((a, b) => b.date.localeCompare(a.date))
    
    const items = []
    const entryDates = new Set(entries.map(e => e.date))

    if (!entryDates.has(todayStr)) {
         items.push({ date: todayStr, entry: undefined, isToday: true })
    }

    entries.forEach(entry => {
        items.push({ 
            date: entry.date, 
            entry: entry, 
            isToday: entry.date === todayStr 
        })
    })

    if (datePickerValue.value) {
        const picked = datePickerValue.value
        if (picked !== todayStr && !entryDates.has(picked)) {
            items.unshift({ date: picked, entry: undefined, isToday: false })
        }
    }
    
    return items
})

const handleJumpDate = () => {
    if (!datePickerValue.value) return
    const element = document.getElementById(`entry-${datePickerValue.value}`)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}

const triggerDatePicker = () => {
    // Programmatically open the native picker
    if (dateInputRef.value) {
        // @ts-ignore - showPicker is modern API supported in most browsers
        if (dateInputRef.value.showPicker) {
            // @ts-ignore
            dateInputRef.value.showPicker()
        } else {
            // Fallback for older browsers (focus might trigger it on mobile)
            dateInputRef.value.focus()
            dateInputRef.value.click() // forceful attempt
        }
    }
}
</script>

<template>
  <div class="journal-feed-view">
      <div class="feed-container">
          <header class="feed-header">
              <h1>Journal</h1>
              <div class="header-controls">
                  <button class="btn-calendar" @click="triggerDatePicker">
                      <span class="icon">📅</span>
                      <span class="label">Jump to Date</span>
                  </button>
                  <!-- Hidden Input for Native Picker -->
                  <input 
                    ref="dateInputRef"
                    type="date" 
                    v-model="datePickerValue" 
                    class="hidden-date-input"
                    @change="handleJumpDate"
                  />
              </div>
          </header>

          <div class="entries-stream">
              <JournalEntryCard 
                v-for="item in feedItems" 
                :key="item.date"
                :id="`entry-${item.date}`"
                :date="item.date"
                :entry="item.entry"
                :isToday="item.isToday"
                @upgrade-req="showUpgradePrompt = true"
              />
          </div>
      </div>

    <UpgradePrompt
      v-if="showUpgradePrompt"
      message="Unlock your full history with Premium."
      @close="showUpgradePrompt = false"
    />
  </div>
</template>

<style scoped>
.journal-feed-view {
    height: 100%;
    overflow-y: auto;
    background-color: var(--color-background);
    padding: 2rem;
}

.feed-container {
    max-width: 850px; /* Widened from 700px */
    margin: 0 auto;
}

.feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border); /* Added logic to define header area better */
}

.feed-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text);
    margin: 0;
}

.header-controls {
    position: relative;
}

.btn-calendar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    color: var(--color-text);
    box-shadow: var(--shadow-soft);
}

.btn-calendar:hover {
    background-color: var(--color-surface-hover);
    transform: translateY(-1px);
}

.btn-calendar .icon {
    font-size: 1.1rem;
}

.hidden-date-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    pointer-events: none; /* Let button handle clicks via script, or allow click-through? */
    /* pointer-events: none is safer if we use showPicker() */
}

/* Fallback: If showPicker not supported, make input cover button */
@supports not selector(::-webkit-calendar-picker-indicator) {
    .hidden-date-input {
        pointer-events: auto;
    }
}

/* Mobile Tweak */
@media (max-width: 600px) {
    .journal-feed-view {
        padding: 1rem;
    }
    
    .feed-header {
        margin-bottom: 1.5rem;
    }
}
</style>
