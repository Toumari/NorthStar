<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalStore } from '../stores/journal'

const store = useJournalStore()

const newContent = ref('')
// Default to today's date
const newDate = ref(new Date().toISOString().split('T')[0])

const handleSave = () => {
  if (!newContent.value.trim() || !newDate.value) return
  store.addEntry(newContent.value, newDate.value)
  newContent.value = ''
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="journal-view">
    <header class="page-header">
      <h2>Journal</h2>
      <p class="subtitle">Capture your thoughts and progress.</p>
    </header>

    <div class="main-layout">
      <section class="editor-section">
        <div class="card editor-card">
          <div class="editor-header">
            <h3>New Entry</h3>
            <input type="date" v-model="newDate" class="date-picker">
          </div>
          <textarea 
            v-model="newContent" 
            placeholder="What's on your mind today?"
            class="journal-input"
          ></textarea>
          <div class="editor-footer">
            <button class="btn-primary" @click="handleSave" :disabled="!newContent.trim()">Save Entry</button>
          </div>
        </div>
      </section>

      <section class="entries-section">
        <div v-if="store.entries.length === 0" class="empty-state">
          <p>No entries yet. Write your first one!</p>
        </div>
        
        <div v-else class="entries-list">
          <div v-for="entry in store.entries" :key="entry.id" class="entry-card">
            <div class="entry-header">
              <span class="entry-date">{{ formatDate(entry.date) }}</span>
              <button class="btn-delete" @click="store.deleteEntry(entry.id)">&times;</button>
            </div>
            <p class="entry-content">{{ entry.content }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.date-picker {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: 6px;
}

.journal-input {
  width: 100%;
  min-height: 150px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  color: var(--color-text);
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1rem;
}

.journal-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.entry-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.entry-date {
  font-weight: 600;
  color: var(--color-primary);
}

.btn-delete {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.25rem;
  line-height: 1;
  padding: 0 0.5rem;
}

.btn-delete:hover {
  color: var(--color-danger);
}

.entry-content {
  white-space: pre-wrap;
  color: var(--color-text);
  line-height: 1.6;
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: 3rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  border: 1px dashed var(--color-border);
}
</style>
