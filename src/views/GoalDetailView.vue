<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoalsStore, type Goal } from '../stores/goals'
import { useTrackersStore } from '../stores/trackers'
import { useToast } from '../composables/useToast'
import CreateGoalModal from '../components/CreateGoalModal.vue'
import TrackerSummaryCard from '../components/TrackerSummaryCard.vue'

const route = useRoute()
const router = useRouter()
const store = useGoalsStore()
const trackersStore = useTrackersStore()
const toast = useToast()

const goalId = route.params.id as string
const goal = computed(() => store.goals.find(g => g.id === goalId))

const relatedTracker = computed(() => {
    if (!goal.value?.relatedTrackerId) return null
    return trackersStore.trackers.find(t => t.id === goal.value?.relatedTrackerId)
})

const newTaskTitle = ref('')
const newTaskDate = ref(new Date().toISOString().split('T')[0])
const isEditing = ref(false)

const hasSmartDetails = computed(() => {
  if (!goal.value?.smart) return false
  const s = goal.value.smart
  // Check if any field has content
  return !!(s.specific || s.measurable || s.achievable || s.relevant || s.timeBound)
})

const isSystemGoal = computed(() => {
  if (!goal.value) return false
  return (
    goal.value.category === 'System Created' ||
    (goal.value.category === 'Inbox' && goal.value.title === 'Inbox') ||
    (goal.value.category === 'General' && goal.value.title === 'General')
  )
})

const isDeleting = ref(false)

const handleAddTask = () => {
  if (!newTaskTitle.value.trim()) return
  store.addTask(goalId, newTaskTitle.value, newTaskDate.value)
  newTaskTitle.value = ''
  newTaskDate.value = ''
}

const handleRemoveTask = async (taskId: string) => {
  if (confirm('Are you sure you want to remove this task?')) {
    await store.removeTask(goalId, taskId)
  }
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this goal?')) {
    isDeleting.value = true
    try {
        await store.removeGoal(goalId)
        router.push('/goals')
    } catch (e) {
        console.error(e)
        // If error, revert state (though likely goal is still there)
        isDeleting.value = false
        toast.error('Failed to delete goal.')
    }
  }
}

const handleUpdateGoal = async (updatedData: Partial<Goal>) => {
  try {
      await store.updateGoal(goalId, {
          title: updatedData.title,
          category: updatedData.category,
          dueDate: updatedData.dueDate,
          relatedTrackerId: updatedData.relatedTrackerId,
          smart: updatedData.smart
      })
      isEditing.value = false
  } catch (e) {
      console.error(e)
  }
}

const handleBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    // Default to Dashboard if no history (safer/more common landing)
    router.push('/')
  }
}
</script>

<template>
  <div v-if="goal && !isDeleting" class="goal-detail-view">
    <header class="page-header">
      <div class="header-content">

        <button class="back-btn" @click="handleBack">← Back</button>
        <div class="title-section">
          <span class="category-tag">{{ goal.category }}</span>
          <h2>{{ goal.title }}</h2>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-outline" @click="isEditing = true">Edit Goal</button>
        <button v-if="!isSystemGoal" class="btn-danger" @click="handleDelete">Delete</button>
      </div>
    </header>

    <div class="main-grid">
      <div class="left-col">
        <section class="progress-card">
          <div class="progress-header">
            <h3>Progress</h3>
            <span class="percentage">{{ goal.progress }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div 
              class="progress-bar-fill" 
              :style="{ width: `${goal.progress}%`, backgroundColor: goal.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)' }"
            ></div>
          </div>
          <p class="status-text" :class="{ success: goal.progress === 100 }">
            {{ goal.progress === 100 ? 'Goal Completed! 🎉' : `${goal.tasks.filter(t => !t.completed).length} tasks remaining` }}
          </p>
        </section>

        <section class="tracker-section" v-if="relatedTracker">
            <header class="section-header">
                <h3>Linked Tracker</h3>
                <RouterLink :to="{ name: 'trackers' }" class="view-link">View All</RouterLink>
            </header>
            <TrackerSummaryCard :tracker="relatedTracker" />
        </section>

        <section class="smart-info" v-if="hasSmartDetails">
          <div class="section-header">
            <h3>S.M.A.R.T. Framework</h3>
          </div>
          <div class="smart-content">
            <div class="smart-item" v-if="goal.smart?.specific">
              <strong>Specific</strong>
              <p>{{ goal.smart.specific }}</p>
            </div>
            <div class="smart-item" v-if="goal.smart?.measurable">
              <strong>Measurable</strong>
              <p>{{ goal.smart.measurable }}</p>
            </div>
            <div class="smart-item" v-if="goal.smart?.achievable">
              <strong>Achievable</strong>
              <p>{{ goal.smart.achievable }}</p>
            </div>
            <div class="smart-item" v-if="goal.smart?.relevant">
              <strong>Relevant</strong>
              <p>{{ goal.smart.relevant }}</p>
            </div>
            <div class="smart-item" v-if="goal.smart?.timeBound">
              <strong>Time-bound</strong>
              <p>{{ goal.smart.timeBound }}</p>
            </div>
          </div>
        </section>
        <section class="smart-info" v-else>
           <div class="section-header">
            <h3>S.M.A.R.T. Framework</h3>
          </div>
          <p class="text-muted">No S.M.A.R.T. details defined for this goal.</p>
          <button class="btn-text-primary" @click="isEditing = true">
            + Add Details
          </button>
        </section>
      </div>

      <div class="right-col">
        <section class="tasks-section">
          <h3>Tasks</h3>
          
          <div class="add-task-form">
            <input 
              v-model="newTaskTitle" 
              type="text" 
              placeholder="Add a new task..." 
              @keyup.enter="handleAddTask"
            >
            <input 
              v-model="newTaskDate" 
              type="date"
              class="date-input"
            >
            <button class="btn-add" @click="handleAddTask">+</button>
          </div>

          <div class="tasks-list">
            <div 
              v-for="task in goal.tasks" 
              :key="task.id" 
              class="task-item"
              :class="{ completed: task.completed }"
            >
              <label class="checkbox-container">
                <input 
                  type="checkbox" 
                  :checked="task.completed" 
                  @change="store.toggleTask(goal.id, task.id)"
                >
                <span class="checkmark"></span>
              </label>
              <div class="task-content">
                <span class="task-title">{{ task.title }}</span>
                <span v-if="task.dueDate" class="task-date">{{ task.dueDate }}</span>
              </div>
              <button 
                class="btn-delete-task" 
                @click.stop="handleRemoveTask(task.id)"
                title="Remove task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <p v-if="goal.tasks.length === 0" class="no-tasks">No tasks added yet.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
  <div v-else-if="store.isLoading || isDeleting" class="loading-state">
    <div class="spinner"></div>
    <p>{{ isDeleting ? 'Deleting goal...' : 'Loading goal details...' }}</p>
  </div>
  <div v-else class="not-found">
    <h2>Goal not found</h2>
    <p>The goal you're looking for doesn't exist or you don't have permission to view it.</p>
    <button class="btn-primary" @click="router.push('/goals')">Return to Goals</button>
  </div>

  <CreateGoalModal 
    v-if="isEditing" 
    :initial-goal="goal"
    @close="isEditing = false"
    @save="handleUpdateGoal"
  />
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  padding: 0;
  font-size: 0.9rem;
}

.back-btn:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.category-tag {
  background-color: var(--color-surface-hover);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: inline-block;
}

h2 {
  font-size: 2rem;
  color: var(--color-text);
}

.btn-danger {
  background: none;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.btn-danger:hover {
  background-color: var(--color-danger);
  color: white;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-outline {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-outline:hover {
  background-color: var(--color-surface-hover);
}

.main-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.progress-card, .smart-info, .tasks-section, .tracker-section {
  background-color: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.percentage {
  font-weight: 700;
  color: var(--color-primary);
}

.progress-bar-bg {
  height: 8px;
  background-color: var(--color-surface-hover);
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.status-text.success {
  color: var(--color-success);
  font-weight: 700;
}

.section-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-link {
    font-size: 0.85rem;
    color: var(--color-primary);
    text-decoration: none;
}
.view-link:hover {
    text-decoration: underline;
}

.smart-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.smart-item {
  font-size: 0.9rem;
}

.smart-item strong {
  color: var(--color-primary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.25rem;
}

.smart-item p {
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.tasks-section h3 {
  margin-bottom: 1.5rem;
}

.btn-text-primary {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 500;
  padding: 0;
  margin-top: 0.5rem;
  cursor: pointer;
}

.btn-text-primary:hover {
  text-decoration: underline;
}

.add-task-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.add-task-form input[type="text"] {
  flex: 1;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
}

.date-input {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  padding: 0.75rem;
  font-family: inherit;
  text-align: left;
}

.btn-add {
  background-color: var(--color-primary);
  color: white;
  border: none;
  width: 42px;
  border-radius: 8px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: var(--color-background);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: opacity 0.2s;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.btn-delete-task {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}

.task-item:hover .btn-delete-task {
  opacity: 1;
}

.btn-delete-task:hover {
  color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.task-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.task-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.checkbox-container {
  display: block;
  position: relative;
  padding-left: 24px;
  margin-bottom: 24px;
  cursor: pointer;
  font-size: 22px;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: var(--color-surface-hover);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.checkbox-container:hover input ~ .checkmark {
  background-color: var(--color-border);
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-surface-hover);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
}

.not-found {
  text-align: center;
  padding: 4rem;
  color: var(--color-text);
}

.not-found p {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.not-found button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch; /* Stretch to fill width */
    gap: 1.5rem;
  }
  
  .header-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .title-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .back-btn {
    align-self: flex-start;
    padding: 0.5rem 0; /* Easier touch target */
  }
  
  h2 {
    font-size: 1.75rem; /* Slightly smaller on mobile */
    line-height: 1.2;
  }
  
  .btn-danger {
    width: 100%;
    text-align: center;
    padding: 0.75rem;
  }

  .add-task-form {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .add-task-form input[type="text"],
  .add-task-form .date-input {
    width: 100%;
    min-height: 48px; /* Taller touch target */
  }
  .add-task-form .btn-add {
    width: 100%;
  }

  .btn-add {
    height: 48px; /* Taller touch target */
    font-size: 1.25rem;
  }

  .btn-delete-task {
    opacity: 1;
    padding: 0.75rem;
  }
  
  /* Additional padding adjustments */
  .progress-card, .smart-info, .tasks-section {
    padding: 1rem;
  }
}
</style>
