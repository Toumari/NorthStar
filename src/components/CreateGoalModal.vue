<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'

import { useGoalsStore, type Goal } from '../stores/goals'
import { useTrackersStore } from '../stores/trackers'
import { useToast } from '../composables/useToast'

const props = defineProps<{
  initialGoal?: Goal
}>()

const emit = defineEmits(['close', 'save'])
const store = useGoalsStore()
const trackersStore = useTrackersStore()
const toast = useToast()
const isSaving = ref(false)
const titleInputRef = ref<HTMLInputElement | null>(null)

const getDefaultDate = (): string => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0] ?? ''
}

const form = reactive<{
  title: string
  category: string
  dueDate: string
  relatedTrackerId: string
  specific: string
  measurable: string
  achievable: string
  relevant: string
  timeBound: string
}>({
  title: '',
  category: 'General',
  dueDate: getDefaultDate(),
  relatedTrackerId: '',
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: ''
})

const touched = reactive({
  title: false
})

const categories = ['General', 'Health', 'Career', 'Finance', 'Education', 'Lifestyle']

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const save = async () => {
  if (!form.title) {
    touched.title = true
    return
  }
  
  isSaving.value = true
  try {
    const goalData = {
      title: form.title,
      description: '',
      category: form.category,
      dueDate: form.dueDate,
      relatedTrackerId: form.relatedTrackerId,
      smart: {
        specific: form.specific,
        measurable: form.measurable,
        achievable: form.achievable,
        relevant: form.relevant,
        timeBound: form.timeBound
      }
    }

    if (props.initialGoal) {
      emit('save', goalData) // Keep emit for edit (GoalDetailView uses this)
    } else {
      await store.addGoal(goalData)
      emit('close')
    }
  } catch (e) {
    console.error(e)
    toast.error("Failed to create goal. Please try again.")
  } finally {
    isSaving.value = false
  }
}

// Lock body scroll when modal is open using position: fixed (iOS fix)
let scrollPosition = 0

onMounted(async () => {
  scrollPosition = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollPosition}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden' // Redundant but safe

  if (props.initialGoal) {
    form.title = props.initialGoal.title
    form.category = props.initialGoal.category
    form.dueDate = props.initialGoal.dueDate
    form.relatedTrackerId = props.initialGoal.relatedTrackerId || ''

    if (props.initialGoal.smart) {
      form.specific = props.initialGoal.smart.specific || ''
      form.measurable = props.initialGoal.smart.measurable || ''
      form.achievable = props.initialGoal.smart.achievable || ''
      form.relevant = props.initialGoal.smart.relevant || ''
      form.timeBound = props.initialGoal.smart.timeBound || ''
    }
  }

  // Focus management for accessibility
  await nextTick()
  titleInputRef.value?.focus()
})

onUnmounted(() => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  window.scrollTo(0, scrollPosition)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="modal-overlay"
      @click.self="$emit('close')"
      @touchmove.self.prevent
      @keydown.esc="$emit('close')"
    >
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
      >
        <header>
          <h2 id="goal-modal-title">{{ initialGoal ? 'Edit Goal' : 'Create New Goal' }}</h2>
          <button class="close-btn" @click="$emit('close')" aria-label="Close dialog">&times;</button>
        </header>
  
        <div class="modal-body">
          <div class="form-group">
            <label for="goal-title">Goal Title <span class="required" aria-hidden="true">*</span></label>
            <input
              ref="titleInputRef"
              id="goal-title"
              v-model.trim="form.title"
              type="text"
              placeholder="e.g., Run a Marathon"
              required
              aria-required="true"
              :aria-invalid="touched.title && !form.title"
              aria-describedby="goal-title-error"
              @blur="touched.title = true"
              :class="{ 'input-error': touched.title && !form.title }"
            >
            <span v-if="touched.title && !form.title" id="goal-title-error" class="error-text" role="alert">Title is required</span>
          </div>
  
          <div class="row">
            <div class="form-group half">
              <label for="goal-category">Category</label>
              <select id="goal-category" v-model="form.category">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-group half">
              <label for="goal-due-date">Due Date</label>
              <input id="goal-due-date" v-model="form.dueDate" type="date" :min="minDate">
            </div>
          </div>

          <div class="form-group">
            <label for="goal-tracker">Link a Tracker (Optional)</label>
            <select id="goal-tracker" v-model="form.relatedTrackerId" aria-describedby="tracker-help">
                <option value="">No linked tracker</option>
                <option v-for="tracker in trackersStore.trackers" :key="tracker.id" :value="tracker.id">
                    {{ tracker.name }} ({{ tracker.unit }})
                </option>
            </select>
            <p id="tracker-help" class="help-text">Visualize your progress with data.</p>
          </div>
  
          <div class="smart-section">
            <h3>S.M.A.R.T. Framework</h3>
            <p class="description">Make your goal crystal clear.</p>
            
            <div class="smart-grid">
              <div class="form-group">
                <label for="smart-specific">Specific</label>
                <textarea id="smart-specific" v-model="form.specific" placeholder="What exactly do you want to accomplish?"></textarea>
              </div>
              <div class="form-group">
                <label for="smart-measurable">Measurable</label>
                <textarea id="smart-measurable" v-model="form.measurable" placeholder="How will you track progress?"></textarea>
              </div>
              <div class="form-group">
                <label for="smart-achievable">Achievable</label>
                <textarea id="smart-achievable" v-model="form.achievable" placeholder="How can you make this goal realistic?"></textarea>
              </div>
              <div class="form-group">
                <label for="smart-relevant">Relevant</label>
                <textarea id="smart-relevant" v-model="form.relevant" placeholder="Why does this goal matter to you?"></textarea>
              </div>
              <div class="form-group">
                <label for="smart-timebound">Time-bound</label>
                <textarea id="smart-timebound" v-model="form.timeBound" placeholder="When exactly do you want to accomplish this?"></textarea>
              </div>
            </div>
          </div>
        </div>
  
        <footer>
          <button class="btn-text" @click="$emit('close')">Cancel</button>
          <button class="btn-primary" @click="save" :disabled="!form.title.trim() || isSaving">
            {{ isSaving ? 'Saving...' : (initialGoal ? 'Save Changes' : 'Create Goal') }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center; /* Center by default */
  padding: 1rem;
  padding-bottom: env(safe-area-inset-bottom, 1rem); /* Safe area */
  z-index: 100;
  backdrop-filter: blur(4px);
  overscroll-behavior: none; /* Prevent bounce */
}

.modal-content {
  background-color: var(--color-surface);
  width: 100%;
  max-width: 600px;
  max-height: 90vh; /* Default desktop max */
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* Mobile specific overrides */
@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-end; /* Bottom sheet style safer for inputs */
    padding: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  
  .modal-content {
    max-height: 85dvh; /* Ensure header is never cut off */
  }
}

header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 2rem;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  color: var(--color-text);
  text-decoration: none;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1; /* Allow body to take remaining space */
  -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
  overscroll-behavior: contain; /* Prevent scroll chaining */
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

textarea {
  min-height: 80px;
  resize: vertical;
}

.row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

.smart-section {
  margin-top: 2rem;
  /* Removed background and padding for cleaner look */
}

.smart-section h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.required {
  color: var(--color-danger);
  margin-left: 0.25rem;
}

.error-text {
  color: var(--color-danger);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.input-error {
  border-color: var(--color-danger);
}

.smart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-weight: 500;
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.btn-primary:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
    gap: 1rem;
  }

  .smart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
