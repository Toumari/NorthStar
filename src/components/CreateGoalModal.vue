<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['close', 'save'])

const form = reactive({
  title: '',
  category: 'General',
  dueDate: '',
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: ''
})

const categories = ['General', 'Health', 'Career', 'Finance', 'Education', 'Lifestyle']

const save = () => {
  if (!form.title) return
  
  emit('save', {
    title: form.title,
    category: form.category,
    dueDate: form.dueDate,
    smart: {
      specific: form.specific,
      measurable: form.measurable,
      achievable: form.achievable,
      relevant: form.relevant,
      timeBound: form.timeBound
    }
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header>
        <h2>Create New Goal</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </header>

      <div class="modal-body">
        <div class="form-group">
          <label>Goal Title</label>
          <input v-model="form.title" type="text" placeholder="e.g., Run a Marathon" autofocus>
        </div>

        <div class="row">
          <div class="form-group half">
            <label>Category</label>
            <select v-model="form.category">
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="form-group half">
            <label>Due Date</label>
            <input v-model="form.dueDate" type="date">
          </div>
        </div>

        <div class="smart-section">
          <h3>S.M.A.R.T. Framework</h3>
          <p class="description">Make your goal crystal clear.</p>
          
          <div class="smart-grid">
            <div class="form-group">
              <label>Specific</label>
              <textarea v-model="form.specific" placeholder="What exactly do you want to accomplish?"></textarea>
            </div>
            <div class="form-group">
              <label>Measurable</label>
              <textarea v-model="form.measurable" placeholder="How will you track progress?"></textarea>
            </div>
            <div class="form-group">
              <label>Achievable</label>
              <textarea v-model="form.achievable" placeholder="How can you make this goal realistic?"></textarea>
            </div>
            <div class="form-group">
              <label>Relevant</label>
              <textarea v-model="form.relevant" placeholder="Why does this goal matter to you?"></textarea>
            </div>
            <div class="form-group">
              <label>Time-bound</label>
              <textarea v-model="form.timeBound" placeholder="When exactly do you want to accomplish this?"></textarea>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <button class="btn-text" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="save">Create Goal</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--color-surface);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border);
}

header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
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
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: 8px;
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

.smart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
