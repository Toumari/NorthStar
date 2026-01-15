<script setup lang="ts">
import { useGoalsStore } from '../stores/goals'
import { computed } from 'vue'

const store = useGoalsStore()

const tasks = computed(() => store.todaysTasks)

const handleToggle = (goalId: string, taskId: string) => {
    store.toggleTask(goalId, taskId)
}

// Group tasks by completion status for better visualization
const pendingTasks = computed(() => tasks.value.filter(t => !t.task.completed))
const completedTasks = computed(() => tasks.value.filter(t => t.task.completed))
</script>

<template>
    <div class="today-focus-card">
        <div class="header">
            <h3>Today's Focus</h3>
            <span class="count">{{ pendingTasks.length }} pending</span>
        </div>

        <div class="tasks-list" v-if="tasks.length > 0">
            <!-- Pending Tasks -->
             <div 
                v-for="item in pendingTasks" 
                :key="item.task.id"
                class="task-item"
            >
                <label class="checkbox-container">
                    <input 
                        type="checkbox" 
                        :checked="item.task.completed" 
                        @change="handleToggle(item.goalId, item.task.id)"
                    >
                    <span class="checkmark"></span>
                </label>
                <div class="task-info">
                    <span class="task-title">{{ item.task.title }}</span>
                    <span class="task-goal-context">{{ item.goalTitle }}</span>
                </div>
            </div>

            <!-- Completed items (collapsed or styled differently) -->
             <div 
                v-for="item in completedTasks" 
                :key="item.task.id"
                class="task-item completed"
            >
                <label class="checkbox-container">
                    <input 
                        type="checkbox" 
                        :checked="item.task.completed" 
                        @change="handleToggle(item.goalId, item.task.id)"
                    >
                    <span class="checkmark"></span>
                </label>
                <div class="task-info">
                    <span class="task-title">{{ item.task.title }}</span>
                    <span class="task-goal-context">{{ item.goalTitle }}</span>
                </div>
            </div>
        </div>

        <div class="empty-state" v-else>
            <p>No tasks scheduled for today.</p>
            <router-link to="/goals" class="add-link">+ Add from Goals</router-link>
        </div>
    </div>
</template>

<style scoped>
.today-focus-card {
    background-color: var(--color-surface);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    height: 100%;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--color-text);
}

.count {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    background-color: var(--color-surface-hover);
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
}

.tasks-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    max-height: 300px;
}

.task-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.task-item:hover {
    background-color: var(--color-surface-hover);
}

.task-item.completed {
    opacity: 0.6;
}

.task-item.completed .task-title {
    text-decoration: line-through;
    color: var(--color-text-muted);
}

.task-info {
    display: flex;
    flex-direction: column;
}

.task-title {
    font-size: 0.95rem;
    color: var(--color-text);
    line-height: 1.4;
}

.task-goal-context {
    font-size: 0.75rem;
    color: var(--color-primary);
    margin-top: 2px;
}

/* Checkbox Styles */
.checkbox-container {
  display: block;
  position: relative;
  padding-left: 24px;
  cursor: pointer;
  user-select: none;
  min-height: 20px;
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
  top: 2px;
  left: 0;
  height: 18px;
  width: 18px;
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
  left: 5px;
  top: 1px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--color-text-muted);
    min-height: 100px;
}

.add-link {
    color: var(--color-primary);
    font-size: 0.9rem;
    text-decoration: none;
    margin-top: 0.5rem;
}

.add-link:hover {
    text-decoration: underline;
}
</style>
