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

onMounted(() => {
  subscriptionStore.loadSubscription()
})

const todayStr = new Date().toISOString().split('T')[0]

// Main Feed Logic
const feedItems = computed(() => {
    // 1. Get all existing entries sorted DESC
    const entries = [...store.entries].sort((a, b) => b.date.localeCompare(a.date))
    
    const items = []
    const entryDates = new Set(entries.map(e => e.date))

    // 2. Ensure Today is present (if not exists)
    //    We prioritize showing Today at the very top if it's not there.
    if (!entryDates.has(todayStr)) {
         items.push({ date: todayStr, entry: undefined, isToday: true })
    }

    // 3. Add existing entries
    //    If we already pushed "Today" (as empty), we skip it here (it won't be in entries anyway).
    //    If "Today" IS in entries, we add it here naturally.
    entries.forEach(entry => {
        items.push({ 
            date: entry.date, 
            entry: entry, 
            isToday: entry.date === todayStr 
        })
    })

    // 4. Handle "Jump to Date" injection
    //    If user picked a date that isn't today and isn't in entries, we should show it.
    if (datePickerValue.value) {
        const picked = datePickerValue.value
        if (picked !== todayStr && !entryDates.has(picked)) {
            // Insert it after Today (or at top if somehow Today isn't there)
            // Actually, let's just replace the view or unshift? 
            // Better UX: Insert it at the top (above today? or just below?) 
            // Let's put it at the very top for focus.
            items.unshift({ date: picked, entry: undefined, isToday: false })
        } else {
             // If it exists, we might want to scroll to it... 
             // For now, logic handles display.
        }
    }

    // Sort again? Or keep "Focus" -> "Today" -> "History"?
    // "Focus" -> "Today" -> "History" seems best for interaction.
    // But logically, reverse chrono is best.
    // Let's stick to: If Picked Date is effectively "New Focus", put it top.
    
    return items
})

const handleJumpDate = () => {
    // Just triggering reactivity for the computed property is enough
    // But we might want to auto-scroll if it exists deep down.
    if (!datePickerValue.value) return
    
    const element = document.getElementById(`entry-${datePickerValue.value}`)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Clear picker so we don't duplicate sticky logic? 
        // No, keep it so they know what they picked.
    }
}
</script>

<template>
  <div class="journal-feed-view">
      <div class="feed-container">
          <header class="feed-header">
              <h1>Journal</h1>
              <div class="header-controls">
                  <span class="label">Jump to:</span>
                  <input 
                    type="date" 
                    v-model="datePickerValue" 
                    class="date-picker-input"
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
    max-width: 700px;
    margin: 0 auto;
}

.feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.feed-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text);
    margin: 0;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--color-surface);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    box-shadow: var(--shadow-soft);
}

.label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: 500;
}

.date-picker-input {
    background: transparent;
    border: none;
    color: var(--color-text);
    font-family: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;
}

/* Mobile Tweak */
@media (max-width: 600px) {
    .journal-feed-view {
        padding: 1rem;
    }
    
    .feed-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .header-controls {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
