<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGoalsStore } from '../stores/goals'
import { useTrackersStore } from '../stores/trackers'
import { useJournalStore } from '../stores/journal'
import confetti from 'canvas-confetti'

const emit = defineEmits(['close'])

const goalsStore = useGoalsStore()
const trackersStore = useTrackersStore()
const journalStore = useJournalStore()

const step = ref(1)
const steps = [
    { id: 1, title: 'Welcome', icon: '👋' },
    { id: 2, title: 'Set a Goal', icon: '🎯' },
    { id: 3, title: 'Track a Habit', icon: '📊' },
    { id: 4, title: 'First Entry', icon: '✍️' }
]

// Step 2: Goal Data
const goalTitle = ref('')
const goalCategory = ref('General')

// Step 3: Tracker Data
const trackerName = ref('')
const trackerUnit = ref('')
const trackerPresets = [
    { name: 'Drink Water', unit: 'cups' },
    { name: 'Read Pages', unit: 'pages' },
    { name: 'Exercise', unit: 'mins' },
    { name: 'Sleep', unit: 'hours' }
]

// Step 4: Journal Data
const journalEntry = ref('')

const nextStep = () => {
    if (step.value < 4) {
        step.value++
    } else {
        finish()
    }
}

const selectPreset = (preset: { name: string, unit: string }) => {
    trackerName.value = preset.name
    trackerUnit.value = preset.unit
}

const finish = async () => {
    try {
        // 1. Create Goal if entered
        if (goalTitle.value) {
            try {
                // Determine if addGoal is async or not - assuming it might be, awaiting it is safe
                // Using optimistic updates in store usually doesn't require await but we want to catch errors
                await goalsStore.addGoal({
                    title: goalTitle.value,
                    category: goalCategory.value,
                    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week out
                    tasks: []
                })
            } catch (e) {
                console.error("Failed to create onboarding goal", e)
            }
        }

        // 2. Create Tracker if entered
        if (trackerName.value && trackerUnit.value) {
             try {
                await trackersStore.addTracker(trackerName.value, trackerUnit.value)
             } catch (e) {
                console.error("Failed to create onboarding tracker", e)
             }
        }

        // 3. Create Journal Entry if entered
        if (journalEntry.value) {
             try {
                await journalStore.addEntry({
                    content: journalEntry.value,
                    date: new Date().toISOString().split('T')[0],
                    tags: ['First Entry']
                })
             } catch (e) {
                console.error("Failed to create onboarding journal entry", e)
             }
        }

        // FIRE CONFETTI
        try {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })
        } catch (e) {
            // Ignore confetti errors
        }

    } catch (e) {
        console.error("Critical onboarding error", e)
    } finally {
        // Mark as done and close regardless of partial failures
        localStorage.setItem('onboarding_complete', 'true')
        emit('close')
    }
}

const skip = () => {
    if (confirm('Skip the welcome wizard? You can manually add these later.')) {
        localStorage.setItem('onboarding_complete', 'true')
        emit('close')
    }
}
</script>

<template>
  <div class="wizard-overlay">
    <div class="wizard-card">
        <!-- Progress Header -->
        <div class="wizard-header">
            <div 
                v-for="s in steps" 
                :key="s.id" 
                class="step-indicator"
                :class="{ 'active': step === s.id, 'completed': step > s.id }"
            >
                <div class="step-dot">{{ step > s.id ? '✓' : s.id }}</div>
            </div>
        </div>

        <div class="wizard-content">
            <!-- STEP 1: WELCOME -->
            <div v-if="step === 1" class="step-view text-center">
                <span class="giant-icon">✨</span>
                <h2>Welcome to PathMark</h2>
                <p>Let's get you set up for success in less than 60 seconds.</p>
                <div class="wizard-actions centered">
                    <button class="btn-primary" @click="nextStep">Let's Go</button>
                    <button class="btn-text" @click="skip">Skip setup</button>
                </div>
            </div>

            <!-- STEP 2: GOAL -->
            <div v-if="step === 2" class="step-view">
                <div class="step-header">
                    <span class="step-icon">🎯</span>
                    <h3>Set your North Star</h3>
                </div>
                <p class="step-desc">What is one main thing you want to accomplish this week?</p>
                
                <input 
                    v-model="goalTitle" 
                    placeholder="e.g. Finish Project Alpha, Run 5k..." 
                    class="wizard-input" 
                    autofocus
                    @keyup.enter="nextStep"
                />

                <div class="wizard-actions">
                    <button class="btn-text" @click="nextStep">Skip this step</button>
                    <button class="btn-primary" @click="nextStep" :disabled="!goalTitle">Next</button>
                </div>
            </div>

            <!-- STEP 3: TRACKER -->
            <div v-if="step === 3" class="step-view">
                <div class="step-header">
                     <span class="step-icon">📊</span>
                    <h3>Track a Habit</h3>
                </div>
                <p class="step-desc">Pick something to measure daily.</p>

                <div class="presets">
                    <button 
                        v-for="p in trackerPresets" 
                        :key="p.name"
                        class="preset-chip"
                        :class="{ selected: trackerName === p.name }"
                        @click="selectPreset(p)"
                    >
                        {{ p.name }}
                    </button>
                </div>

                <div class="custom-tracker-inputs">
                    <input v-model="trackerName" placeholder="Habit Name" class="wizard-input small" />
                    <input v-model="trackerUnit" placeholder="Unit (e.g. mins)" class="wizard-input small" />
                </div>

                <div class="wizard-actions">
                    <button class="btn-text" @click="nextStep">Skip this step</button>
                    <button class="btn-primary" @click="nextStep" :disabled="!trackerName || !trackerUnit">Next</button>
                </div>
            </div>

            <!-- STEP 4: JOURNAL -->
            <div v-if="step === 4" class="step-view">
                <div class="step-header">
                    <span class="step-icon">✍️</span>
                    <h3>First Reflection</h3>
                </div>
                <p class="step-desc">How are you feeling right now? Capture the moment.</p>

                <textarea 
                    v-model="journalEntry" 
                    placeholder="Today I'm feeling excited to start..." 
                    class="wizard-textarea"
                ></textarea>

                <div class="wizard-actions">
                     <button class="btn-text" @click="finish">Skip this step</button>
                    <button class="btn-primary" @click="finish">Finish & Launch 🚀</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.9); /* Dark backdrop */
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.wizard-card {
    background: var(--color-surface);
    width: 100%;
    max-width: 500px;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    border: 1px solid var(--color-border);
}

.wizard-header {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.step-indicator {
    position: relative;
}

.step-indicator::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    width: 1rem;
    height: 2px;
    background: var(--color-border);
    transform: translateY(-50%);
}

.step-indicator:last-child::after {
    display: none;
}

.step-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--color-surface-hover);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.8rem;
    position: relative;
    z-index: 1;
    border: 2px solid var(--color-border);
}

.step-indicator.active .step-dot {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px var(--color-primary-light);
}

.step-indicator.completed .step-dot {
    background: var(--color-success);
    color: white;
    border-color: var(--color-success);
}

.wizard-content {
    min-height: 300px;
    display: flex;
    flex-direction: column;
}

.step-view {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.text-center {
    text-align: center;
    align-items: center;
}

.giant-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    display: block;
}

h2 {
    color: var(--color-text);
    margin: 0 0 0.5rem 0;
}

h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--color-text);
}

p {
    color: var(--color-text-muted);
    margin: 0 0 2rem 0;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.step-icon {
    font-size: 2rem;
}

.step-desc {
    margin-bottom: 1.5rem;
}

.wizard-input {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid var(--color-border);
    background: var(--color-background);
    color: var(--color-text);
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    transition: border-color 0.2s;
}

.wizard-input:focus {
    border-color: var(--color-primary);
    outline: none;
}

.wizard-textarea {
    width: 100%;
    flex: 1;
    min-height: 120px;
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid var(--color-border);
    background: var(--color-background);
    color: var(--color-text);
    font-size: 1rem;
    margin-bottom: 1.5rem;
    resize: none;
}

.wizard-textarea:focus {
    border-color: var(--color-primary);
    outline: none;
}

.presets {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

.preset-chip {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--color-text);
    transition: all 0.2s;
}

.preset-chip:hover {
    border-color: var(--color-primary);
}

.preset-chip.selected {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.custom-tracker-inputs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.wizard-actions {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    align-items: center;
}

.wizard-actions.centered {
    justify-content: center;
    width: 100%;
}

.btn-primary {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-primary-light);
}

.btn-text {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-weight: 500;
}

.btn-text:hover {
    color: var(--color-text);
}
</style>
