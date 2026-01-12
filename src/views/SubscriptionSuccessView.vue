<template>
  <div class="success-view">
    <div class="success-card">
      <div class="success-icon">✓</div>
      <h1>Welcome to Premium!</h1>
      <p>Your payment was successful. You now have access to all premium features.</p>
      
      <div class="features">
        <h3>What's unlocked:</h3>
        <ul>
          <li>✓ Unlimited goals</li>
          <li>✓ Unlimited habit trackers</li>
          <li>✓ Full journal history editing</li>
          <li>✓ All future premium features</li>
        </ul>
      </div>
      
      <p class="redirect-message">Redirecting to dashboard in {{ countdown }} seconds...</p>
      
      <RouterLink to="/" class="btn-primary">Go to Dashboard Now</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscription'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()
const countdown = ref(5)

onMounted(async () => {
  // Reload subscription status
  await subscriptionStore.loadSubscription()
  
  // Countdown and redirect
  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      router.push('/')
    }
  }, 1000)
})
</script>

<style scoped>
.success-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-background) 100%);
}

.success-card {
  background-color: var(--color-surface);
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 2rem;
  font-weight: bold;
}

h1 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
}

p {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

.features {
  background-color: var(--color-background);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.features h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--color-text);
}

.features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  padding: 0.5rem 0;
  color: var(--color-text);
}

.redirect-message {
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn-primary {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .success-card {
    padding: 2rem 1.5rem;
  }
}
</style>
