<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="upgrade-modal">
        <button class="close-btn" @click="$emit('close')">×</button>
        
        <div class="icon">🚀</div>
        
        <h2>Upgrade to Premium</h2>
        
        <p class="message">{{ message }}</p>
        
        <div class="benefits">
          <h3>Premium Benefits:</h3>
          <ul>
            <li>✓ Unlimited goals</li>
            <li>✓ Unlimited habit trackers</li>
            <li>✓ Full journal history</li>
            <li>✓ Advanced analytics (coming soon)</li>
            <li>✓ Data export (coming soon)</li>
          </ul>
        </div>
        
        <div class="pricing">
          <div class="price-option">
            <span class="price">£1.99</span>
            <span class="period">/month</span>
          </div>
          <div class="price-option highlight">
            <span class="badge">Best Value</span>
            <span class="price">£15</span>
            <span class="period">/year</span>
            <span class="savings">Save 37%</span>
          </div>
          <div class="price-option">
            <span class="price">£25</span>
            <span class="period">lifetime</span>
          </div>
        </div>
        
        <RouterLink to="/pricing" class="btn-upgrade" @click="$emit('close')">
          View Pricing Plans
        </RouterLink>
        
        <button class="btn-text" @click="$emit('close')">Maybe Later</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  /* Make overlay the scroll container */
  /* Scroll handling */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: 100%; /* Delegate height constraint to content if needed, key is overlay scroll */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.upgrade-modal {
  background-color: var(--color-surface);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  /* Magic centering that is safe for overflow */
  margin: auto;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text);
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h2 {
  margin: 0 0 1rem 0;
  color: var(--color-text);
}

.message {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.benefits {
  background-color: var(--color-background);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.benefits h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--color-text);
}

.benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits li {
  padding: 0.5rem 0;
  color: var(--color-text);
  font-size: 0.95rem;
}

.pricing {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.price-option {
  flex: 1;
  min-width: 120px;
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.price-option.highlight {
  border-color: var(--color-primary);
  background-color: var(--color-primary-soft);
}

.badge {
  position: absolute;
  top: -10px;
  background-color: var(--color-primary);
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.period {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.savings {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 0.25rem;
}

.btn-upgrade {
  display: inline-block;
  width: 100%;
  background-color: var(--color-primary);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 1rem;
  transition: opacity 0.2s;
}

.btn-upgrade:hover {
  opacity: 0.9;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-text:hover {
  color: var(--color-text);
}

@media (max-width: 600px) {
  .pricing {
    flex-direction: column;
  }
  
  .price-option {
    min-width: 100%;
  }
}
</style>
