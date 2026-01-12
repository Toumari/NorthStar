<script setup lang="ts">
import { ref } from 'vue'
import { useTrackersStore } from '../stores/trackers'
import TrackerChart from '../components/TrackerChart.vue'

const store = useTrackersStore()

const newTrackerName = ref('')
const newTrackerUnit = ref('')

const newDataValue = ref<number | null>(null)
const newDataDate = ref(new Date().toISOString().split('T')[0])
const selectedTrackerId = ref<string | null>(null)

const createTracker = () => {
  if (newTrackerName.value && newTrackerUnit.value) {
    store.addTracker(newTrackerName.value, newTrackerUnit.value)
    newTrackerName.value = ''
    newTrackerUnit.value = ''
  }
}

const deleteTracker = (id: string, name: string) => {
  if (confirm(`Are you sure you want to delete the tracker "${name}"? This action cannot be undone.`)) {
    store.removeTracker(id)
  }
}

const addData = (trackerId: string) => {
  if (newDataValue.value !== null && newDataDate.value) {
    store.addDataPoint(trackerId, newDataValue.value, newDataDate.value)
    newDataValue.value = null
  }
}
</script>

<template>
  <div class="trackers-view">
    <header class="page-header">
      <h2>Trackers</h2>
      <p class="subtitle">Monitor your habits and vital metrics.</p>
    </header>

    <section class="create-tracker-section">
      <div class="card create-card">
        <h3>Create New Tracker</h3>
        <div class="form-row">
          <input v-model="newTrackerName" placeholder="Tracker Name (e.g. Weight)" />
          <input v-model="newTrackerUnit" placeholder="Unit (e.g. kg)" />
          <button class="btn-primary" @click="createTracker" :disabled="!newTrackerName || !newTrackerUnit">Create</button>
        </div>
      </div>
    </section>

    <div v-if="store.trackers.length === 0" class="empty-state">
      <p>No trackers yet. Start measuring what matters.</p>
    </div>

    <div v-else class="trackers-grid">
      <div v-for="tracker in store.trackers" :key="tracker.id" class="card tracker-card">
        <header class="tracker-header">
          <h3>{{ tracker.name }} <span class="unit">({{ tracker.unit }})</span></h3>
          <button class="btn-delete" @click="deleteTracker(tracker.id, tracker.name)">&times;</button>
        </header>

        <div class="chart-wrapper">
          <TrackerChart :tracker="tracker" v-if="tracker.data.length > 0" />
          <p v-else class="no-data">No data points yet.</p>
        </div>

        <div class="data-input-row">
          <input 
            type="number" 
            v-model="newDataValue" 
            placeholder="Value" 
            @focus="selectedTrackerId = tracker.id"
          >
          <input 
            type="date" 
            v-model="newDataDate"
            @focus="selectedTrackerId = tracker.id"
          >
          <button 
            class="btn-small" 
            @click="selectedTrackerId === tracker.id && addData(tracker.id)"
            :disabled="selectedTrackerId !== tracker.id || newDataValue === null || !newDataDate"
          >Add</button>
        </div>
      </div>
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

.create-tracker-section {
  margin-bottom: 2rem;
}

.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .form-row input,
  .form-row .btn-primary {
    width: 100%;
  }
}

input {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  border-radius: 8px;
  color: var(--color-text);
  flex: 1;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.trackers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .trackers-grid {
    grid-template-columns: 1fr;
    min-width: 0; /* Prevent grid blowout */
  }
  
  .tracker-card {
    padding: 1rem;
  }
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.unit {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.btn-delete {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.btn-delete:hover {
  color: var(--color-danger);
}

.chart-wrapper {
  margin-bottom: 1rem;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.no-data {
  color: var(--color-text-muted);
}

.data-input-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap; /* Allow wrapping */
}

@media (max-width: 768px) {
  .data-input-row {
    flex-direction: column;
    width: 100%;
  }
  
  .data-input-row input {
    width: 100%;
    margin-bottom: 0.5rem; /* Add spacing between stacked inputs */
  }
  
  .btn-small {
    width: 100%;
    padding: 0.75rem;
  }
}

.btn-small {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-surface-hover);
  color: var(--color-text-muted);
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
