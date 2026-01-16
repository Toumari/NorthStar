<script setup lang="ts">
import { computed } from 'vue'
import type { Goal } from '@/stores/goals'

const props = defineProps<{
  goal: Goal
}>()

const progressColor = computed(() => {
  if (props.goal.progress === 100) return 'var(--color-success)'
  if (props.goal.progress > 50) return 'var(--color-primary)'
  return 'var(--color-warning)'
})

const daysLeft = computed(() => {
  if (!props.goal.dueDate) return 0
  const diff = new Date(props.goal.dueDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

import { useRouter } from 'vue-router'
const router = useRouter()

const isInbox = computed(() => props.goal.category === 'System Created' || props.goal.category === 'Inbox' || props.goal.category === 'General')
</script>

<template>
  <div class="goal-card" @click="router.push(`/goals/${goal.id}`)">
    <div class="card-header">
      <span class="category-tag" :class="{ 'inbox-tag': isInbox }">
          {{ isInbox ? 'System Created' : 'User Created' }}
      </span>
      <span class="due-date" :class="{ overdue: daysLeft < 0 }" v-if="!isInbox">
        {{ daysLeft > 0 ? `${daysLeft}d left` : 'Overdue' }}
      </span>
    </div>
    
    <h3 class="goal-title">{{ goal.title }}</h3>
    
    <div class="progress-section">
      <div class="progress-bar-bg">
        <div 
          class="progress-bar-fill"
          :style="{ width: `${goal.progress}%`, backgroundColor: progressColor }"
        ></div>
      </div>
      <span class="progress-text">{{ goal.progress }}%</span>
    </div>

    <div class="card-footer">
      <span class="task-count">{{ goal.tasks.filter(t => t.completed).length }}/{{ goal.tasks.length }} tasks</span>
    </div>
  </div>
</template>

<style scoped>
.goal-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.goal-card * {
    cursor: pointer;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: var(--color-primary-dark);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-tag {
  background-color: var(--color-surface-hover);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.inbox-tag {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
}

.due-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.due-date.overdue {
  color: var(--color-danger);
}

.goal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  line-height: 1.4;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background-color: var(--color-surface-hover);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out, background-color 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  min-width: 3ch;
  text-align: right;
}

.card-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.task-count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
