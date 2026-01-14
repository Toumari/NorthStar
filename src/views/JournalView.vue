<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJournalStore } from '../stores/journal'
import { useSubscriptionStore } from '../stores/subscription'
import JournalTimeline from '../components/JournalTimeline.vue'
import UpgradePrompt from '../components/UpgradePrompt.vue'

const store = useJournalStore()
const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const router = useRouter()
const showUpgradePrompt = ref(false)

// Mobile State
const isMobile = ref(false)
const showTimelineMobile = ref(true) // Start showing timeline on mobile

onMounted(() => {
  subscriptionStore.loadSubscription()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 900
    if (!isMobile.value) {
        showTimelineMobile.value = true // Always show sidebar on desktop
    }
}

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

const formattedDateHeader = computed(() => {
  return new Date(selectedDate.value).toLocaleDateString('en-US', {
    weekday: 'long',
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
        // Go back to timeline view on mobile to pick another
        if (isMobile.value) showTimelineMobile.value = true
    }
}

const handleSelectDate = (date: string) => {
    router.replace({ query: { date } })
    if (isMobile.value) {
        showTimelineMobile.value = false // Slide to editor
    }
}

const backToTimeline = () => {
    showTimelineMobile.value = true
}
</script>

<template>
  <div class="journal-layout">
    <!-- Sidebar: Timeline (Always visible on DT, conditionally on Mobile) -->
    <aside class="journal-sidebar" :class="{ 'hidden-mobile': isMobile && !showTimelineMobile }">
        <JournalTimeline 
            :selectedDate="selectedDate"
            @select-date="handleSelectDate"
        />
    </aside>

    <!-- Main Editor -->
    <main class="journal-editor" :class="{ 'visible-mobile': isMobile && !showTimelineMobile }">
        <header class="editor-header">
            <button class="back-btn" v-if="isMobile" @click="backToTimeline">
                ← Back
            </button>
            <div class="date-info">
                <h2>{{ formattedDateHeader }}</h2>
                <span v-if="isEntryLocked" class="locked-label" @click="showUpgradePrompt = true">🔒 Read-only</span>
            </div>
            <div class="actions">
                <span class="save-status" :class="{ visible: saveMessage }">{{ saveMessage }}</span>
                <button class="icon-btn delete" @click="handleDelete" title="Delete Entry" v-if="store.entries.find(e => e.date === selectedDate)">
                    🗑️
                </button>
            </div>
        </header>

        <div class="editor-body font-serif">
             <div v-if="isEntryLocked" class="locked-banner">
                <p>To edit past entries, upgrade to Premium.</p>
                <button class="btn-xs" @click="showUpgradePrompt = true">Upgrade</button>
             </div>

            <textarea 
                v-model="content" 
                placeholder="Write your story..."
                class="zen-textarea"
                :disabled="isEntryLocked"
                @blur="handleSave"
                @keydown.ctrl.enter="handleSave" 
            ></textarea>
        </div>
    </main>
    
    <UpgradePrompt
      v-if="showUpgradePrompt"
      message="Unlock your full history with Premium."
      @close="showUpgradePrompt = false"
    />
  </div>
</template>

<style scoped>
.journal-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
    background-color: var(--color-background);
}

.journal-sidebar {
    width: 350px;
    height: 100%;
    flex-shrink: 0;
    z-index: 2;
    background-color: var(--color-surface);
    border-right: 1px solid var(--color-border);
}

.journal-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-background); /* Maybe make this white/paper color? */
}

/* Mobile Responsive Logic */
@media (max-width: 900px) {
    .journal-sidebar {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(0);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .journal-sidebar.hidden-mobile {
        transform: translateX(-100%);
    }

    .journal-editor {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 3; /* Above sidebar */
    }

    .journal-editor.visible-mobile {
        transform: translateX(0);
    }
}

/* Editor Styles */
.editor-header {
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* border-bottom: 1px solid var(--color-border); */ /* Keep it clean? */
}

.back-btn {
    background: none;
    border: none;
    font-size: 1rem;
    color: var(--color-primary);
    cursor: pointer;
    margin-right: 1rem;
}

.date-info h2 {
    font-size: 1.5rem;
    font-family: 'Lora', serif;
    font-weight: 600;
    color: var(--color-text);
}

.locked-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    background: var(--color-surface-hover);
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 0.5rem;
    cursor: pointer;
}

.actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.save-status {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    opacity: 0;
    transition: opacity 0.3s;
}

.save-status.visible {
    opacity: 1;
}

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.5;
    transition: opacity 0.2s;
}

.icon-btn:hover {
    opacity: 1;
}

.editor-body {
    flex: 1;
    padding: 0 2rem 2rem 2rem; /* Comfortable padding */
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

@media (max-width: 900px) {
    .editor-body {
        padding: 0 1rem 1rem 1rem;
    }
}

.font-serif {
    font-family: 'Lora', serif;
}

.zen-textarea {
    flex: 1;
    width: 100%;
    background: transparent;
    border: none;
    resize: none;
    font-size: 1.25rem;
    line-height: 1.8;
    color: var(--color-text);
    outline: none;
    padding-top: 1rem;
}

.zen-textarea::placeholder {
    color: var(--color-text-muted);
    font-style: italic;
    opacity: 0.5;
}

.locked-banner {
    background-color: var(--color-surface);
    border: 1px dashed var(--color-border);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.locked-banner p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.btn-xs {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
}
</style>
