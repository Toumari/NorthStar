<script setup lang="ts">
import { useGoalsStore } from '../stores/goals'
import { useJournalStore } from '../stores/journal'
import { useTrackersStore } from '../stores/trackers'
import GoalCard from '../components/GoalCard.vue'
import TrackerChart from '../components/TrackerChart.vue'
import { RouterLink } from 'vue-router'

import CreateGoalModal from '../components/CreateGoalModal.vue'
import CreateTrackerModal from '../components/CreateTrackerModal.vue'
import JournalCalendar from '../components/JournalCalendar.vue'
import { ref } from 'vue'

const store = useGoalsStore()
const journalStore = useJournalStore()
const trackersStore = useTrackersStore()

const showGoalModal = ref(false)
const showTrackerModal = ref(false)

const handleCreateGoal = (goalData: any) => {
  store.addGoal(goalData)
  showGoalModal.value = false
}

const handleCreateTracker = (trackerData: any) => {
  trackersStore.addTracker(trackerData.name, trackerData.unit)
  showTrackerModal.value = false
}
</script>

<template>
  <div class="dashboard-view">
    <header class="page-header">
      <h2>Dashboard</h2>
      <p class="subtitle">Welcome back to your NorthStar.</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <h3>Completed Goals</h3>
        <p class="stat-value">{{ store.completedGoals.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Goals</h3>
        <p class="stat-value">{{ store.activeGoalsCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Tasks for Today</h3>
        <p class="stat-value">{{ store.todaysTasksCount }}</p>
      </div>
    </div>

    <section class="recent-goals" v-if="store.activeGoals.length > 0">
      <header class="section-header">
        <h3>Recent Goals</h3>
        <div class="actions">
           <button class="btn-text-action" @click="showGoalModal = true">+ Add Goal</button>
           <RouterLink to="/goals" class="view-all">View All</RouterLink>
        </div>
      </header>
      <div class="goals-grid">
        <GoalCard 
          v-for="goal in store.activeGoals.slice(0, 3)" 
          :key="goal.id" 
          :goal="goal"
        />
      </div>
    </section>

    <div class="dashboard-grid">
      <!-- Journal Section -->
      <section class="dashboard-section journal-section">
        <header class="section-header">
          <h3>My Journal</h3>
          <RouterLink to="/journal" class="view-all">Open Journal</RouterLink>
        </header>
        
        <JournalCalendar />
      </section>

      <!-- Trackers Section -->
      <section class="dashboard-section trackers-section">
        <header class="section-header">
          <h3>Trackers</h3>
          <div class="actions">
             <button class="btn-text-action" @click="showTrackerModal = true">+ Add Tracker</button>
             <RouterLink to="/trackers" class="view-all">View All</RouterLink>
          </div>
        </header>

        <div class="trackers-grid" v-if="trackersStore.trackers.length > 0">
          <div class="tracker-mini-card card" v-for="tracker in trackersStore.trackers.slice(0, 2)" :key="tracker.id">
            <h4>{{ tracker.name }}</h4>
            <div class="mini-chart">
               <TrackerChart :tracker="tracker" />
            </div>
          </div>
        </div>
        <div class="empty-state card" v-else>
          <p>No trackers active.</p>
          <RouterLink to="/trackers" class="btn-small">Add Tracker</RouterLink>
        </div>
      </section>
    </div>

    <CreateGoalModal 
      v-if="showGoalModal" 
      @close="showGoalModal = false"
      @save="handleCreateGoal"
    />

    <CreateTrackerModal 
      v-if="showTrackerModal" 
      @close="showTrackerModal = false"
      @save="handleCreateTracker"
    />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background-color: var(--color-surface);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.stat-card.highlight {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  border: none;
}

.stat-card.highlight h3, 
.stat-card.highlight .stat-value {
  color: white;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.section-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.view-all {
  font-size: 0.875rem;
  color: var(--color-primary);
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-text-action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-text-action:hover {
  text-decoration: underline;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.journal-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.journal-content {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}

.tracker-mini-card {
  margin-bottom: 1rem;
}

.tracker-mini-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--color-text);
}

.mini-chart {
  height: 150px;
}

.btn-small {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
