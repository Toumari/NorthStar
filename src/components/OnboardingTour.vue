<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGamificationStore } from '../stores/gamification'

const store = useGamificationStore()
const currentStep = ref(0)
const isVisible = ref(false)

const steps = [
  {
    title: 'Welcome to PathMark',
    message: 'Your personal companion for goals, journaling, and tracking.',
    position: 'center'
  },
  {
    title: 'Navigate Your Path',
    message: 'Use the sidebar to access your Goals, Journal, and Data Trackers.',
    position: 'sidebar-top'
  },
  {
    title: 'Level Up',
    message: 'Earn XP and Badges by completing goals and staying consistent. Check your progress here!',
    position: 'sidebar-bottom'
  },
  {
    title: 'Start Your Journey',
    message: 'Create your first goal or journal entry today to unlock your first badge!',
    position: 'center'
  }
]

onMounted(async () => {
    // Wait for store to load
    // Simple check: if user is logged in and hasn't seen tour
    setTimeout(() => {
        if (!store.hasSeenTour) {
            isVisible.value = true
        }
    }, 1000)
})

const nextStep = async () => {
    if (currentStep.value < steps.length - 1) {
        currentStep.value++
    } else {
        await finishTour()
    }
}

const finishTour = async () => {
    isVisible.value = false
    await store.completeTour()
}

const step = computed(() => steps[currentStep.value])

const positionClass = computed(() => {
    return `pos-${step.value.position}`
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="tour-overlay">
        <div class="tour-mask" :class="positionClass"></div>
        
        <div class="tour-card" :class="positionClass">
            <div class="tour-header">
                <h3>{{ step.title }}</h3>
                <button class="close-btn" @click="finishTour">×</button>
            </div>
            <p>{{ step.message }}</p>
            <div class="tour-footer">
                <div class="dots">
                    <span 
                        v-for="(s, index) in steps" 
                        :key="index" 
                        class="dot"
                        :class="{ active: index === currentStep }"
                    ></span>
                </div>
                <button class="next-btn" @click="nextStep">
                    {{ currentStep === steps.length - 1 ? 'Finish' : 'Next' }}
                </button>
            </div>
        </div>
    </div>
  </Transition>
</template>

<style scoped>
.tour-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    z-index: 1000;
    pointer-events: auto;
}

/* Dim everything */
.tour-overlay::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
}

.tour-card {
    position: absolute;
    background: var(--color-surface);
    color: var(--color-text);
    padding: 1.5rem;
    border-radius: 12px;
    width: 320px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    border: 1px solid var(--color-primary);
    transition: all 0.3s ease;
}

/* Positioning Strategy */
.tour-card.pos-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.tour-card.pos-sidebar-top {
    top: 80px;
    left: 270px; /* Sidebar width + gap */
}

.tour-card.pos-sidebar-bottom {
    bottom: 100px;
    left: 270px;
}

@media (max-width: 768px) {
    .tour-card.pos-sidebar-top,
    .tour-card.pos-sidebar-bottom {
        top: auto;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
    }
}

.tour-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.tour-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--color-primary);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-muted);
}

.tour-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
}

.dots {
    display: flex;
    gap: 0.5rem;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--color-border);
    transition: background-color 0.2s;
}

.dot.active {
    background-color: var(--color-primary);
}

.next-btn {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
