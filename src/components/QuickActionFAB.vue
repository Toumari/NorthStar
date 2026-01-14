<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['create-goal', 'create-tracker', 'navigate-journal'])

const isOpen = ref(false)

const toggleMenu = () => {
    isOpen.value = !isOpen.value
}

const closeMenu = () => {
    isOpen.value = false
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (isOpen.value && !target.closest('.fab-container')) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const handleAction = (action: 'goal' | 'tracker' | 'journal') => {
    closeMenu()
    if (action === 'goal') emit('create-goal')
    if (action === 'tracker') emit('create-tracker')
    if (action === 'journal') emit('navigate-journal')
}
</script>

<template>
  <div class="fab-container">
    <div class="actions" :class="{ open: isOpen }">
        <button class="fab-action" @click="handleAction('journal')">
            <span class="label">Journal Entry</span>
            <span class="icon">📖</span>
        </button>
        <button class="fab-action" @click="handleAction('tracker')">
            <span class="label">New Tracker</span>
            <span class="icon">📊</span>
        </button>
        <button class="fab-action" @click="handleAction('goal')">
            <span class="label">New Goal</span>
            <span class="icon">🎯</span>
        </button>
    </div>
    
    <button class="fab-main" @click="toggleMenu" :class="{ 'is-active': isOpen }">
      <span class="plus-icon">+</span>
    </button>
  </div>
</template>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

/* Compensate for mobile tab bar if needed, though standard is bottom-right */
@media (max-width: 768px) {
    .fab-container {
        bottom: 5rem; /* Lift above potential mobile nav or safe area */
        right: 1.5rem;
    }
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  border: none;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s;
  position: relative;
  z-index: 2;
}

.fab-main:hover {
    transform: scale(1.05);
}

.fab-main.is-active {
    background-color: var(--color-text);
    transform: rotate(45deg);
}

.plus-icon {
    line-height: 1;
    margin-top: -4px; /* Optical adjustment */
}

.actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
    position: absolute;
    bottom: 70px;
    right: 0;
    pointer-events: none;
    opacity: 0;
    transform: translateY(20px) scale(0.9);
    transition: all 0.2s ease-in-out;
}

.actions.open {
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0) scale(1);
}

.fab-action {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    padding: 0;
}

.fab-action .icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.fab-action:hover .icon {
    transform: scale(1.1);
    border-color: var(--color-primary);
}

.fab-action .label {
    background-color: var(--color-surface);
    color: var(--color-text);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border: 1px solid var(--color-border);
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.2s;
}

.actions.open .fab-action .label {
    opacity: 1;
    transform: translateX(0);
}
</style>
