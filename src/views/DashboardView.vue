<script setup lang="ts">
import { useGoalsStore } from '../stores/goals'
import GoalCard from '../components/GoalCard.vue'

const store = useGoalsStore()
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
      </header>
      <div class="goals-grid">
        <GoalCard 
          v-for="goal in store.activeGoals.slice(0, 3)" 
          :key="goal.id" 
          :goal="goal"
        />
      </div>
    </section>
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
}

.section-header h3 {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
