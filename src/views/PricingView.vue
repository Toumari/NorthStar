<template>
  <div class="pricing-view">
    <header class="page-header">
      <h1>Choose Your Plan</h1>
      <p class="subtitle">Unlock the full potential of PathMark</p>
    </header>

    <div class="pricing-grid">
      <!-- Free Plan -->
      <div class="pricing-card">
        <h3>Free</h3>
        <div class="price">
          <span class="amount">£0</span>
          <span class="period">forever</span>
        </div>
        
        <ul class="features">
          <li>✓ Up to 3 goals</li>
          <li>✓ Up to 2 habit trackers</li>
          <li>✓ 7 days of journal history</li>
          <li>✓ Basic dashboard</li>
          <li>✓ Light & Dark mode</li>
        </ul>
        
        <button class="btn-secondary" disabled>Current Plan</button>
      </div>

      <!-- Monthly Plan -->
      <div class="pricing-card">
        <h3>Monthly</h3>
        <div class="price">
          <span class="amount">£1.99</span>
          <span class="period">/month</span>
        </div>
        
        <ul class="features">
          <li>✓ <strong>Unlimited</strong> goals</li>
          <li>✓ <strong>Unlimited</strong> trackers</li>
          <li>✓ <strong>Full</strong> journal history</li>

        </ul>
        
        <button class="btn-primary" @click="handleUpgrade('monthly')">
          {{ loading === 'monthly' ? 'Loading...' : 'Get Monthly' }}
        </button>
      </div>

      <!-- Yearly Plan (Highlighted) -->
      <div class="pricing-card featured">
        <div class="best-value">Best Value</div>
        <h3>Yearly</h3>
        <div class="price">
          <span class="amount">£15</span>
          <span class="period">/year</span>
        </div>
        <div class="savings">Save 37% (£8.88)</div>
        
        <ul class="features">
          <li>✓ <strong>Unlimited</strong> goals</li>
          <li>✓ <strong>Unlimited</strong> trackers</li>
          <li>✓ <strong>Full</strong> journal history</li>

        </ul>
        
        <button class="btn-primary" @click="handleUpgrade('yearly')">
          {{ loading === 'yearly' ? 'Loading...' : 'Get Yearly' }}
        </button>
      </div>

      <!-- Lifetime Plan -->
      <div class="pricing-card">
        <h3>Lifetime</h3>
        <div class="price">
          <span class="amount">£25</span>
          <span class="period">one-time</span>
        </div>
        <div class="savings">Pay once, use forever</div>
        
        <ul class="features">
          <li>✓ <strong>Unlimited</strong> goals</li>
          <li>✓ <strong>Unlimited</strong> trackers</li>
          <li>✓ <strong>Full</strong> journal history</li>

          <li>✓ All future features</li>
        </ul>
        
        <button class="btn-primary" @click="handleUpgrade('lifetime')">
          {{ loading === 'lifetime' ? 'Loading...' : 'Get Lifetime' }}
        </button>
      </div>
    </div>

    <div class="faq">
      <h2>Frequently Asked Questions</h2>
      
      <div class="faq-item">
        <h4>Can I cancel anytime?</h4>
        <p>Yes! You can cancel your subscription at any time from the Settings page. You'll keep premium access until the end of your billing period.</p>
      </div>
      
      <div class="faq-item">
        <h4>What happens to my data if I downgrade?</h4>
        <p>Your data is never deleted. If you downgrade to free, you'll be limited to 3 goals and 2 trackers, but all your existing data remains safe.</p>
      </div>
      
      <div class="faq-item">
        <h4>Is payment secure?</h4>
        <p>Absolutely. All payments are processed securely through Stripe. We never store your payment information.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { useAuthStore } from '../stores/auth'
import { auth } from '../firebase'

const authStore = useAuthStore()

type PlanType = 'monthly' | 'yearly' | 'lifetime'

const loading = ref<PlanType | null>(null)
const error = ref('')

// Price IDs from Stripe (these will be set via environment variables)
const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || '',
  yearly: import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY || '',
  lifetime: import.meta.env.VITE_STRIPE_PRICE_ID_LIFETIME || ''
}

const handleUpgrade = async (plan: PlanType) => {
  if (!authStore.user) {
    error.value = 'You must be logged in to upgrade'
    return
  }

  loading.value = plan
  error.value = ''

  try {
    // Get auth token for authorization
    const token = await auth.currentUser?.getIdToken()
    if (!token) {
      throw new Error('Not authenticated')
    }

    // Call Netlify function to create checkout session
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        priceId: PRICE_IDS[plan],
        userId: authStore.user.uid,
        userEmail: authStore.user.email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session')
    }

    // Redirect to Stripe Checkout
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    if (stripe && data.url) {
      window.location.href = data.url
    }
  } catch (err: unknown) {
    console.error('Upgrade error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to start checkout. Please try again.'
  } finally {
    loading.value = null
  }
}
</script>

<style scoped>
.pricing-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.pricing-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border-color: var(--color-primary);
  border-width: 3px;
}

.best-value {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.pricing-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.price {
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-text);
}

.period {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin-left: 0.5rem;
}

.savings {
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  flex-grow: 1;
}

.features li {
  padding: 0.75rem 0;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.features li:last-child {
  border-bottom: none;
}

.badge {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-muted);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.faq {
  max-width: 800px;
  margin: 0 auto;
}

.faq h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.faq-item {
  margin-bottom: 2rem;
}

.faq-item h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.faq-item p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
