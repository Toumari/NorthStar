<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found-view">
    <div class="content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      
      <div class="actions">
        <button class="btn-primary" @click="router.push('/')">Return to Dashboard</button>
        <button class="btn-text" @click="router.back()">Go Back</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: var(--color-background);
}

.content {
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  color: var(--color-text);
  margin-bottom: 1rem;
}

p {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}

.btn-text:hover {
  color: var(--color-text);
  text-decoration: underline;
}
</style>
