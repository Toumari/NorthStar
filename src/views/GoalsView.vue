<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { useSubscriptionStore } from '../stores/subscription'
import GoalCard from '../components/GoalCard.vue'
import CreateGoalModal from '../components/CreateGoalModal.vue'
import UpgradePrompt from '../components/UpgradePrompt.vue'
import { useRoute, useRouter } from 'vue-router'

const store = useGoalsStore()
const subscriptionStore = useSubscriptionStore()
const showCreateModal = ref(false)
const showUpgradePrompt = ref(false)
const route = useRoute()
const router = useRouter()

const currentFilter = ref('active') // active, completed, all, today

onMounted(() => {
  subscriptionStore.loadSubscription()
  if (route.query.filter) {
    currentFilter.value = route.query.filter as string
  }
})

// Update filter when URL changes (back/forward navigation)
watch(() => route.query.filter, (newFilter) => {
  if (newFilter) {
    currentFilter.value = newFilter as string
  } else {
    currentFilter.value = 'active'
  }
})

const setFilter = (filter: string) => {
  currentFilter.value = filter
  router.replace({ query: { ...route.query, filter } })
}

const filteredGoals = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return store.activeGoals
    case 'completed':
      return store.completedGoals
    case 'today':
      // Goals that have tasks due today OR are due today themselves
      const today = new Date().toISOString().split('T')[0]
      return store.activeGoals.filter(goal => {
        const goalDue = goal.dueDate === today
        const hasTaskDue = goal.tasks.some(t => !t.completed && t.dueDate === today)
        return goalDue || hasTaskDue
      })
    case 'all':
    default:
      return store.goals
  }
})

const canCreateGoal = computed(() => {
  return subscriptionStore.canCreateGoal(store.goals.length)
})

const remainingGoals = computed(() => {
  return subscriptionStore.getRemainingGoals(store.goals.length)
})

const handleNewGoalClick = () => {
  if (canCreateGoal.value) {
    showCreateModal.value = true
  } else {
    showUpgradePrompt.value = true
  }
}
</script>

<template>
  <div class="goals-view">
    <header class="page-header">
      <div class="header-left">
        <h2>My Goals</h2>
        <p class="subtitle">
          {{ store.activeGoalsCount }} active goals
          <span v-if="!subscriptionStore.isPremium" class="limit-badge">
            ({{ remainingGoals }} remaining)
          </span>
        </p>
      </div>
      <button class="btn-primary" @click="handleNewGoalClick">
        <span class="icon">+</span> New Goal
      </button>
    </header>

    <div class="filters">
      <button 
        class="filter-pill" 
        :class="{ active: currentFilter === 'active' }"
        @click="setFilter('active')"
      >
        Active
      </button>
      <button 
        class="filter-pill" 
        :class="{ active: currentFilter === 'today' }"
        @click="setFilter('today')"
      >
        Today
      </button>
      <button 
        class="filter-pill" 
        :class="{ active: currentFilter === 'completed' }"
        @click="setFilter('completed')"
      >
        Completed
      </button>
      <button 
        class="filter-pill" 
        :class="{ active: currentFilter === 'all' }"
        @click="setFilter('all')"
      >
        All
      </button>
    </div>

    <div v-if="filteredGoals.length === 0" class="empty-state">
      <h3>No {{ currentFilter !== 'all' ? currentFilter : '' }} goals found</h3>
      <p v-if="store.goals.length === 0">Define your PathMark and start tracking your progress.</p>
      <p v-else>Adjust your filters or create a new goal.</p>
      <button class="btn-secondary" @click="handleNewGoalClick">Create Goal</button>
    </div>

    <div v-else class="goals-grid">
      <GoalCard 
        v-for="goal in filteredGoals" 
        :key="goal.id" 
        :goal="goal"
      />
    </div>

    <CreateGoalModal 
      v-if="showCreateModal" 
      @close="showCreateModal = false"
    />
    
    <UpgradePrompt
      v-if="showUpgradePrompt"
      message="You've reached the free plan limit of 3 goals. Upgrade to Premium for unlimited goals!"
      @close="showUpgradePrompt = false"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.limit-badge {
  color: var(--color-primary);
  font-weight: 600;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  margin-top: 1rem;
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: var(--color-surface);
}

.empty-state {
  text-align: center;
  padding: 6rem 2rem;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border-radius: 16px;
  border: 1px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .subtitle {
    margin-top: 0.25rem;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 1rem;
    font-size: 1rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem; /* Space for scrollbar if needed */
  -webkit-overflow-scrolling: touch;
}

.filter-pill {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-pill:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.filter-pill.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
