<script setup lang="ts">
import { computed, ref } from 'vue'
import { useJournalStore } from '../stores/journal'

const props = defineProps<{
    selectedDate: string
}>()

const emit = defineEmits(['select-date', 'create-new'])

const store = useJournalStore()
const searchQuery = ref('')

// Computed: Group entries by Month/Year
const groupedEntries = computed(() => {
    const groups: Record<string, any[]> = {}
    
    // Sort entries by date descending
    const sorted = [...store.entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Filter by search
    const filtered = sorted.filter(e => {
        if (!searchQuery.value) return true
        const q = searchQuery.value.toLowerCase()
        return e.content.toLowerCase().includes(q) || e.date.includes(q)
    })
    
    if (filtered.length === 0 && !searchQuery.value) {
        // If no entries at all, maybe return empty? Or handle in template.
    }

    filtered.forEach(entry => {
        const date = new Date(entry.date)
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
        
        if (!groups[monthYear]) {
            groups[monthYear] = []
        }
        
        groups[monthYear].push({
            ...entry,
            day: date.getDate(),
            weekday: date.toLocaleString('default', { weekday: 'short' }),
            preview: entry.content.slice(0, 80) + (entry.content.length > 80 ? '...' : '') || 'No content...'
        })
    })

    return groups
})

const handleEntryClick = (date: string) => {
    emit('select-date', date)
}

const handleCreateClick = () => {
    // Pick today's date, or if today exists, pick the next available or just focus.
    // For simplicity: Just emit today's date
    const today = new Date().toISOString().split('T')[0]
    emit('select-date', today)
}
</script>

<template>
  <div class="timeline-container">
    <div class="timeline-header">
        <h3>Journal</h3>
        <button class="btn-icon-soft" @click="handleCreateClick" title="New Entry">
            <span class="icon">+</span>
        </button>
    </div>

    <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Search entries..." />
    </div>

    <div class="entries-list">
        <div v-for="(entries, month) in groupedEntries" :key="month" class="month-group">
            <h4 class="month-label">{{ month }}</h4>
            <div 
                v-for="entry in entries" 
                :key="entry.id"
                class="entry-card"
                :class="{ active: entry.date === selectedDate }"
                @click="handleEntryClick(entry.date)"
            >
                <div class="date-col">
                    <span class="day-number">{{ entry.day }}</span>
                    <span class="weekday">{{ entry.weekday }}</span>
                </div>
                <div class="content-col">
                    <p class="preview-text">{{ entry.preview }}</p>
                </div>
            </div>
        </div>

        <div v-if="store.entries.length === 0" class="empty-state">
            <p>No entries yet.</p>
            <button class="btn-text" @click="handleCreateClick">Write your first one</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface);
    border-right: 1px solid var(--color-border);
}

.timeline-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--color-border);
}

.timeline-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
}

.btn-icon-soft {
    background: var(--color-surface-hover);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.25rem;
    color: var(--color-primary);
    transition: transform 0.2s;
}

.btn-icon-soft:hover {
    transform: scale(1.1);
}

.search-bar {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.search-bar input {
    width: 100%;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    color: var(--color-text);
    font-size: 0.875rem;
}

.entries-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.month-group {
    margin-bottom: 1.5rem;
}

.month-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
    padding-left: 0.5rem;
}

.entry-card {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 0.5rem;
}

.entry-card:hover {
    background-color: var(--color-surface-hover);
}

.entry-card.active {
    background-color: var(--color-primary-light);
    border-left: 3px solid var(--color-primary);
}

.date-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 40px;
}

.day-number {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
}

.weekday {
    font-size: 0.65rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
}

.content-col {
    flex: 1;
    overflow: hidden;
}

.preview-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-family: 'Lora', serif; /* Use the new serif for previews too? Or clean sans? */
}

/* Dark mode tweaks handled by CSS vars mostly */

.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-muted);
}

.btn-text {
    background: none;
    border: none;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
    margin-top: 0.5rem;
}
</style>
