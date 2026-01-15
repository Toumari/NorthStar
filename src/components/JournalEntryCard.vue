<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useSubscriptionStore } from '../stores/subscription'
import { useJournalStore } from '../stores/journal'

const props = defineProps<{
    entry?: { id: string, content: string, date: string } // Optional, might be a fresh date
    date: string
    isToday?: boolean
}>()

const emit = defineEmits(['save', 'delete'])

const store = useJournalStore()
const subscriptionStore = useSubscriptionStore()

const isEditing = ref(false)
const editContent = ref('')
const isSaving = ref(false)

// Check lock stats
const isEntryLocked = computed(() => {
    const entryDate = new Date(props.date)
    return !subscriptionStore.canEditJournalEntry(entryDate)
})

const formattedDate = computed(() => {
    return new Date(props.date).toLocaleDateString('en-US', {
        weekday: 'short', // Mon
        year: 'numeric', // 2026
        month: 'short', // Jan
        day: 'numeric' // 12
    })
})

const startEditing = () => {
    if (isEntryLocked.value) {
        emit('upgrade-req')
        return
    }
    editContent.value = props.entry?.content || ''
    isEditing.value = true
    
    // Focus textarea
    nextTick(() => {
        const textarea = document.querySelector(`.edit-area-${props.date}`) as HTMLTextAreaElement
        if (textarea) textarea.focus()
    })
}

const cancelEditing = () => {
    isEditing.value = false
    editContent.value = ''
}

const save = async () => {
    if (!editContent.value.trim()) return
    
    isSaving.value = true
    try {
        await store.saveEntry(editContent.value, props.date)
        isEditing.value = false
        // Emit save so parent can maybe refresh or show toast? Store updates reactively usually.
    } catch (e) {
        console.error(e)
    } finally {
        isSaving.value = false
    }
}

const handleDelete = async () => {
    if(!props.entry) return
    if(!confirm('Delete this entry?')) return
    await store.deleteEntry(props.entry.id)
}

// Display text preserving newlines
const displayText = computed(() => {
    return props.entry?.content || ''
})
</script>

<template>
  <div class="journal-card" :class="{ 'is-today': isToday }">
    <header class="card-header">
        <div class="date-group">
            <h3 class="date-title">{{ formattedDate }}</h3>
            <span v-if="isToday" class="today-badge">TODAY</span>
        </div>
        
        <div class="actions" v-if="!isEditing && entry">
            <button class="btn-action edit" @click="startEditing">
                Edit
            </button>
            <button class="btn-action delete" @click="handleDelete" title="Delete Entry">
                 Delete
            </button>
        </div>
    </header>

    <!-- READ MODE -->
    <div v-if="!isEditing && entry" class="content-read" @click="startEditing"> <!-- Click to edit convenience -->
        <p class="text-display">{{ displayText }}</p>
    </div>

    <!-- EMPTY / PROMPT MODE -->
    <div v-else-if="!isEditing && !entry" class="content-empty" @click="startEditing">
        <p class="placeholder-text">Write about your day...</p>
        <button class="btn-start">Start Writing</button>
    </div>

    <!-- EDIT MODE -->
    <div v-else class="content-edit">
        <textarea 
            v-model="editContent" 
            :class="`edit-area-${date}`"
            placeholder="What's on your mind?"
            @keydown.ctrl.enter="save"
        ></textarea>
        <div class="edit-footer">
            <button class="btn-text" @click="cancelEditing">Cancel</button>
            <button class="btn-primary" @click="save" :disabled="isSaving || !editContent.trim()">
                {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
        </div>
    </div>
    
    <div v-if="isEntryLocked && !isEditing" class="locked-overlay" @click="$emit('upgrade-req')">
        <span class="lock-icon">🔒</span>
    </div>
  </div>
</template>

<style scoped>
.journal-card {
    background-color: var(--color-surface);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow-soft);
    margin-bottom: 2rem;
    position: relative;
    border: 1px solid transparent;
    transition: transform 0.2s, box-shadow 0.2s;
}

@media (max-width: 600px) {
    .journal-card {
        padding: 1rem; /* More space for content relative to edges */
        border-radius: 8px;
    }
}

.journal-card:hover {
    box-shadow: var(--shadow-medium); /* Lift slightly on hover */
}

/* Today Highlight */
.journal-card.is-today {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.15);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem; /* Increased from 1rem */
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-surface-hover);
    gap: 1rem; /* Base gap */
}

@media (max-width: 600px) {
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem; /* Distinct separation on mobile */
    }
    
    .actions {
        width: 100%;
        justify-content: flex-end; /* Push buttons to right or keep left? Standard is Right for actions */
        padding-top: 0.5rem; /* Little extra breathing room */
    }
}

.date-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.date-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text);
}

.today-badge {
    background-color: var(--color-primary);
    color: white;
    font-size: 0.65rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.05em;
}

.actions {
    display: flex;
    gap: 0.5rem;
    opacity: 1; 
}

.btn-action {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
    padding: 0.25rem 0.75rem; /* Larger touch target */
    border-radius: 6px;
}

.btn-action.edit {
    color: var(--color-text-muted);
}
.btn-action.edit:hover {
    background-color: var(--color-surface-hover);
    color: var(--color-primary);
}

.btn-action.delete {
    color: var(--color-danger); /* Explicit red */
    background-color: rgba(220, 38, 38, 0.05); /* Very subtle red bg */
}

.btn-action.delete:hover {
    background-color: rgba(220, 38, 38, 0.15);
}

.content-read {
    cursor: pointer; /* Indicate interaction */
}

.text-display {
    white-space: pre-wrap;
    font-family: inherit;
    line-height: 1.7;
    color: var(--color-text);
}

.content-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: var(--color-background);
    border-radius: 8px;
    border: 1px dashed var(--color-border);
    cursor: pointer;
    transition: background-color 0.2s;
}

.content-empty:hover {
    background-color: var(--color-surface-hover);
}

.placeholder-text {
    color: var(--color-text-muted);
    margin-bottom: 1rem;
    font-style: italic;
}

.btn-start {
    background-color: var(--color-surface-hover);
    border: none;
    color: var(--color-primary);
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
}

.content-edit textarea {
    width: 100%;
    min-height: 200px;
    padding: 1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text);
    font-family: inherit;
    line-height: 1.6;
    font-size: 1rem;
    resize: vertical;
    outline: none;
}

.content-edit textarea:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.edit-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.btn-text {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-weight: 500;
}

.btn-text:hover {
    color: var(--color-text);
}

.btn-primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.locked-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
}

.lock-icon {
    font-size: 1.2rem;
}
</style>
