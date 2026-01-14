<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'
import { useSubscriptionStore } from '../stores/subscription'
import JournalCalendar from '../components/JournalCalendar.vue'
import UpgradePrompt from '../components/UpgradePrompt.vue'

const store = useJournalStore()
const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const router = useRouter()
const showUpgradePrompt = ref(false)

onMounted(() => {
  subscriptionStore.loadSubscription()
})

// Get date from query or default to today
const selectedDate = computed(() => {
  return (route.query.date as string) || new Date().toISOString().split('T')[0]
})

const content = ref('')
const isSaving = ref(false)
const saveMessage = ref('')

// Check if current entry can be edited (older than 14 days for free users)
const isEntryLocked = computed(() => {
  const entryDate = new Date(selectedDate.value)
  return !subscriptionStore.canEditJournalEntry(entryDate)
})

// Load content when selectedDate changes
watchEffect(() => {
  const dateStr = selectedDate.value
  const entry = store.entries.find(e => e.date === dateStr)
  content.value = entry ? entry.content : ''
  saveMessage.value = ''
})

const handleSave = async () => {
  if (!content.value.trim() || isEntryLocked.value) return
  
  isSaving.value = true
  saveMessage.value = 'Saving...'
  try {
    // @ts-ignore
    await store.saveEntry(content.value, selectedDate.value)
    saveMessage.value = 'Saved'
    setTimeout(() => {
      if (saveMessage.value === 'Saved') saveMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error(error)
    saveMessage.value = 'Error saving'
  } finally {
    isSaving.value = false
  }
}

// Auto-save debounce could be added here, but manual for now is safer/simpler
const formattedDate = computed(() => {
  return new Date(selectedDate.value).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const handleDelete = async () => {
    if (isEntryLocked.value) return
    if(!confirm('Are you sure you want to delete this entry?')) return
    const entry = store.entries.find(e => e.date === selectedDate.value)
    if(entry) {
        await store.deleteEntry(entry.id)
        content.value = ''
        saveMessage.value = 'Deleted'
    }
}
</script>

<template>
  <div class="journal-view">
    <div class="layout-grid">
      <!-- Left Sidebar: Calendar & Stats -->
      <aside class="journal-sidebar">
        <div class="sidebar-content">
             <JournalCalendar mode="sidebar" />
        </div>
      </aside>

      <!-- Main Content: Daily Editor -->
      <main class="daily-page">
        <header class="page-header">
           <div class="date-display">
             <h1>{{ formattedDate }}</h1>
             <p class="subtitle">
               Daily Journal
               <span v-if="isEntryLocked" class="locked-badge" @click="showUpgradePrompt = true">
                 🔒 Read-only
               </span>
             </p>
           </div>
           
           <div class="actions">
             <span class="save-status" :class="{ 'visible': saveMessage }">{{ saveMessage }}</span>
             <button class="btn-text delete-btn" @click="handleDelete" v-if="store.entries.find(e => e.date === selectedDate)">
                Delete
             </button>
           </div>
        </header>

        <div class="editor-container">
          <div v-if="isEntryLocked" class="read-only-banner">
            <span class="banner-icon">🔒</span>
            <span class="banner-text">Read-only mode - Entries older than 14 days can't be edited on the free plan.</span>
            <button class="btn-banner-upgrade" @click="showUpgradePrompt = true">Upgrade to Edit</button>
          </div>
          
          <textarea 
            v-model="content" 
            placeholder="What's on your mind?..." 
            class="main-textarea"
            :disabled="isEntryLocked"
            @blur="handleSave"
            @keydown.ctrl.enter="handleSave"
          ></textarea>
          <!-- Save hint -->
           <div class="editor-footer">
              <button class="btn-primary" @click="handleSave" :disabled="isSaving || isEntryLocked || !content.trim()">
                  {{ isSaving ? 'Saving...' : 'Save Entry' }}
              </button>
           </div>
        </div>
      </main>
    </div>
    
    <UpgradePrompt
      v-if="showUpgradePrompt"
      message="Free users can only edit journal entries from the last 14 days. Upgrade to Premium to edit your full journal history!"
      @close="showUpgradePrompt = false"
    />
  </div>
</template>

<style scoped>
/* Layout */
.journal-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layout-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  height: 100%;
  padding-bottom: 2rem; /* Bottom breathing room */
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto; /* Scroll the whole page on mobile */
  }
}

/* Sidebar Area */
.journal-sidebar {
  /* No border, just a container for the card */
  height: fit-content; /* Don't force full height */
}

.sidebar-content {
    position: sticky;
    top: 0;
}

@media (max-width: 900px) {
    .sidebar-content {
        position: static;
    }
}

/* Main Content Area */
.daily-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0; /* Flexbox text overflow fix */
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align top for better multiline title handling */
  margin-bottom: 1.5rem;
}

.date-display h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.locked-badge {
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  background-color: var(--color-surface-hover);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
}

.actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.save-status {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-style: italic;
    opacity: 0;
    transition: opacity 0.3s;
}

.save-status.visible {
    opacity: 1;
}

.delete-btn {
    color: var(--color-danger);
    font-size: 0.875rem;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.delete-btn:hover {
    opacity: 1;
}

.btn-text {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-weight: 500;
}

/* Editor Card */
.editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface);
    border-radius: 12px;
    padding: 2rem;
    /* Clean Card Style with Soft Shadow */
    box-shadow: var(--shadow-soft);
    border: 1px solid transparent; 
}

:root.dark .editor-container {
    border-color: var(--color-border);
    box-shadow: none;
}

/* Mobile Adjustments for Editor */
@media (max-width: 900px) {
    .editor-container {
        padding: 1.5rem;
        min-height: 400px; /* Ensure editable area on mobile */
    }
}

.read-only-banner {
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-primary-light); /* Soft border */
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}

.banner-icon {
  font-size: 1.2rem;
}

.banner-text {
  flex: 1;
}

.btn-banner-upgrade {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.main-textarea {
    flex: 1;
    width: 100%;
    border: none;
    background: transparent;
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-text);
    resize: none;
    font-family: inherit;
    outline: none;
    padding: 0; /* Remove default padding since container has padding */
}

/* Placeholder styling */
.main-textarea::placeholder {
    color: var(--color-text-muted);
    opacity: 0.6;
}

.editor-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-surface-hover); /* Subtle divider */
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(var(--color-primary-rgb), 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
}
</style>
