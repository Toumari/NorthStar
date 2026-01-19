<template>
  <div class="terms-view">
    <div class="terms-container">
      <h1>Terms of Service</h1>
      <p class="last-updated">Last Updated: January 18, 2026</p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Welcome to PathMark. By accessing or using our website and application, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section>
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily access the materials (information or software) on PathMark's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>Modify or copy the materials;</li>
          <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
          <li>Attempt to decompile or reverse engineer any software contained on PathMark's website;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
        <p>
           This license shall automatically terminate if you violate any of these restrictions and may be terminated by PathMark at any time.
        </p>
      </section>

      <section>
        <h2>3. Accounts and Subscriptions</h2>
        <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
        </p>
        <h3>Subscriptions</h3>
        <p>
            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
        </p>
        <p>
            You may cancel your Subscription renewal either through your online account management page or by contacting PathMark customer support team. Your subscription will remain active until the end of the current billing cycle.
        </p>
      </section>

      <section>
        <h2>4. Disclaimer</h2>
        <p>
          The materials on PathMark's website are provided on an 'as is' basis. PathMark makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
      </section>

      <section>
        <h2>5. Limitations</h2>
        <p>
          In no event shall PathMark or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PathMark's website, even if PathMark or a PathMark authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>
      </section>

      <section>
        <h2>6. Accuracy of Materials</h2>
        <p>
          The materials appearing on PathMark's website could include technical, typographical, or photographic errors. PathMark does not warrant that any of the materials on its website are accurate, complete or current. PathMark may make changes to the materials contained on its website at any time without notice. However PathMark does not make any commitment to update the materials.
        </p>
      </section>

      <section>
        <h2>7. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
        </p>
      </section>

      <section>
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us through the app's Settings page.
        </p>
      </section>

      <div class="back-link">
        <RouterLink to="/" v-if="isAuthenticated">← Back to Dashboard</RouterLink>
        <RouterLink to="/login" v-else>← Back to Login</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.terms-view {
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 2rem 1rem;
}

.terms-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--color-surface);
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.last-updated {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.5rem;
  color: var(--color-text);
  margin-bottom: 1rem;
  margin-top: 2rem;
}

h3 {
  font-size: 1.125rem;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
}

p {
  color: var(--color-text);
  line-height: 1.6;
  margin-bottom: 1rem;
}

ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

li {
  color: var(--color-text);
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.back-link {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.back-link a {
  color: var(--color-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .terms-container {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}
</style>
