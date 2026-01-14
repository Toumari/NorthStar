<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { useSubscriptionStore } from '../stores/subscription'
import GoalCard from '../components/GoalCard.vue'
import CreateGoalModal from '../components/CreateGoalModal.vue'
import UpgradePrompt from '../components/UpgradePrompt.vue'

const store = useGoalsStore()
const subscriptionStore = useSubscriptionStore()
const showCreateModal = ref(false)
const showUpgradePrompt = ref(false)

onMounted(() => {
  console.log('[GoalsView] onMounted called')
  try {
    subscriptionStore.loadSubscription()
    console.log('[GoalsView] Subscription load triggered')
  } catch (e) {
    console.error('[GoalsView] Error in onMounted:', e)
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

  store.addGoal(goalData)
  showCreateModal.value = false
}

console.log('[GoalsView] Setup completed')
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

    <div v-if="store.goals.length === 0" class="empty-state">
      <h3>No Goals Yet</h3>
      <p>Define your PathMark and start tracking your progress.</p>
      <button class="btn-secondary" @click="handleNewGoalClick">Create First Goal</button>
    </div>

    <div v-else class="goals-grid">
      <GoalCard 
        v-for="goal in store.goals" 
        :key="goal.id" 
        :goal="goal"
      />
    </div>

    <CreateGoalModal 
      v-if="showCreateModal" 
      @close="showCreateModal = false"
      @save="handleCreateGoal"
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
</style>
