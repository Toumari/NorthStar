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

        <div class="editor-container" :class="{ 'locked': isEntryLocked }">
          <div v-if="isEntryLocked" class="lock-overlay" @click="showUpgradePrompt = true">
            <div class="lock-content">
              <div class="lock-icon">🔒</div>
              <h3>Read-Only Mode</h3>
              <p>Entries older than 14 days are read-only for free users.<br>Upgrade to Premium to edit your full journal history.</p>
              <button class="btn-upgrade" @click.stop="showUpgradePrompt = true">Upgrade Now</button>
            </div>
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
              <button class="btn-primary" @click="handleSave" :disabled="isSaving || isEntryLocked">
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
  overflow: hidden; /* Prevent double scrollbars */
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .journal-sidebar {
      order: -1; /* Sidebar ON TOP */
      height: auto;
      border-right: none;
      padding-right: 0;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 2rem;
  }
}

/* Sidebar */
.journal-sidebar {
  border-right: 1px solid var(--color-border);
  padding-right: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically */
  height: 100%;
  overflow-y: auto;
}

@media (max-width: 900px) {
    .journal-sidebar {
        border-right: none;
        padding-right: 0;
        border-bottom: 1px solid var(--color-border);
        padding-bottom: 2rem;
        justify-content: flex-start; /* Reset for mobile */
        max-height: 50vh; /* Limit height so it doesn't take over */
    }
}

.sidebar-content {
    /* Container for calendar */
}

/* Main Page */
.daily-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-right: 1rem; /* Space for scrollbar */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.date-display h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.locked-badge {
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.locked-badge:hover {
  text-decoration: underline;
}

.actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.save-status {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    opacity: 0;
    transition: opacity 0.3s;
}

.save-status.visible {
    opacity: 1;
}

.delete-btn {
    color: var(--color-danger);
    font-size: 0.875rem;
}

.btn-text {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-weight: 500;
}

.btn-text:hover {
    text-decoration: underline;
}

/* Editor */
.editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface);
    border-radius: 12px;
    border: 1px solid var(--color-border);
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    position: relative;
}

.editor-container.locked {
  filter: blur(4px);
  pointer-events: none;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: all;
  cursor: pointer;
}

.lock-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.lock-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.lock-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.lock-content p {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.btn-upgrade {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-upgrade:hover {
  opacity: 0.9;
}

.main-textarea {
    flex: 1;
    width: 100%;
    border: none;
    background: transparent;
    font-size: 1.125rem;
    line-height: 1.6;
    color: var(--color-text);
    resize: none;
    font-family: inherit; /* OR 'Merriweather', serif if we want book feel */
}

.main-textarea:focus {
    outline: none;
}

.editor-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@media (max-width: 900px) {
    .editor-container {
        padding: 1rem;
        min-height: 50vh;
    }
}
</style>
