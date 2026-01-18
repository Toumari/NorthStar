<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['close', 'save'])

const name = ref('')
const unit = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)
const touched = reactive({
  name: false,
  unit: false
})

const save = () => {
  touched.name = true
  touched.unit = true
  if (!name.value || !unit.value) return
  emit('save', { name: name.value, unit: unit.value })
}

// Lock body scroll when modal is open using position: fixed (iOS fix)
let scrollPosition = 0

onMounted(async () => {
  scrollPosition = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollPosition}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden' // Redundant but safe

  // Focus management for accessibility
  await nextTick()
  nameInputRef.value?.focus()
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
        aria-labelledby="tracker-modal-title"
      >
        <header>
          <h2 id="tracker-modal-title">Create New Tracker</h2>
          <button class="close-btn" @click="$emit('close')" aria-label="Close dialog">&times;</button>
        </header>
  
        <div class="modal-body">
          <div class="form-group">
            <label for="tracker-name">Tracker Name <span class="required" aria-hidden="true">*</span></label>
            <input
              ref="nameInputRef"
              id="tracker-name"
              v-model.trim="name"
              type="text"
              placeholder="e.g., Weight"
              required
              aria-required="true"
              :aria-invalid="touched.name && !name"
              aria-describedby="tracker-name-error"
              @blur="touched.name = true"
              :class="{ 'input-error': touched.name && !name }"
            >
            <span v-if="touched.name && !name" id="tracker-name-error" class="error-text" role="alert">Name is required</span>
          </div>

          <div class="form-group">
            <label for="tracker-unit">Unit <span class="required" aria-hidden="true">*</span></label>
            <input
              id="tracker-unit"
              v-model.trim="unit"
              type="text"
              placeholder="e.g., kg"
              required
              aria-required="true"
              :aria-invalid="touched.unit && !unit"
              aria-describedby="tracker-unit-error"
              @blur="touched.unit = true"
              :class="{ 'input-error': touched.unit && !unit }"
            >
            <span v-if="touched.unit && !unit" id="tracker-unit-error" class="error-text" role="alert">Unit is required</span>
          </div>
        </div>
  
        <footer>
          <button class="btn-text" @click="$emit('close')">Cancel</button>
          <button class="btn-primary" @click="save" :disabled="!name.trim() || !unit.trim()">Create Tracker</button>
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
  align-items: center;
  padding: 1rem;
  padding-bottom: env(safe-area-inset-bottom, 1rem);
  z-index: 100;
  backdrop-filter: blur(4px);
  overscroll-behavior: none;
}

.modal-content {
  background-color: var(--color-surface);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
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
    align-items: flex-end;
    padding: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
  
  .modal-content {
    max-height: 85dvh;
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
  cursor: pointer;
}

.close-btn:hover {
  color: var(--color-text);
  text-decoration: none;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.form-group {
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

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
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
  cursor: pointer;
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
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
