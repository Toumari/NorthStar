<template>
  <div class="cancel-view">
    <div class="cancel-card">
      <div class="cancel-icon">✕</div>
      <h1>Payment Canceled</h1>
      <p>Your payment was canceled. No charges were made to your account.</p>
      
      <p class="info">You can upgrade to Premium anytime from the pricing page.</p>
      
      <div class="actions">
        <RouterLink to="/pricing" class="btn-primary">View Pricing</RouterLink>
        <RouterLink to="/" class="btn-secondary">Back to Dashboard</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cancel-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--color-background);
}

.cancel-card {
  background-color: var(--color-surface);
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.cancel-icon {
  width: 80px;
  height: 80px;
  background-color: var(--color-text-muted);
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
  margin-bottom: 1rem;
}

.info {
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text);
}

.btn-primary:hover,
.btn-secondary:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .cancel-card {
    padding: 2rem 1.5rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
</style>
