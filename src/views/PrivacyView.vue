<template>
  <div class="privacy-view">
    <div class="privacy-container">
      <h1>Privacy Policy</h1>
      <p class="last-updated">Last Updated: January 12, 2026</p>

      <section>
        <h2>Introduction</h2>
        <p>
          Welcome to PathMark. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our application.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <h3>Account Information</h3>
        <p>When you create an account, we collect:</p>
        <ul>
          <li><strong>Email address</strong> - Used for authentication and account recovery</li>
          <li><strong>Display name</strong> - Used to personalize your experience</li>
          <li><strong>Profile picture</strong> (if using Google Sign-In) - Provided by Google</li>
        </ul>

        <h3>Application Data</h3>
        <p>When you use PathMark, we store:</p>
        <ul>
          <li><strong>Goals</strong> - Your personal goals and progress</li>
          <li><strong>Journal entries</strong> - Your daily reflections and notes</li>
          <li><strong>Tracker data</strong> - Habit tracking information you choose to record</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and maintain the PathMark service</li>
          <li>Authenticate your identity and secure your account</li>
          <li>Store and sync your personal data across devices</li>
          <li>Improve and personalize your experience</li>
        </ul>
      </section>

      <section>
        <h2>Data Storage and Security</h2>
        <p>
          Your data is stored securely using <strong>Google Firebase</strong>, a cloud platform with industry-standard security measures. All data is:
        </p>
        <ul>
          <li>Encrypted in transit using HTTPS/TLS</li>
          <li>Stored in secure data centers</li>
          <li>Protected by Firebase security rules that ensure only you can access your data</li>
        </ul>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Firebase Authentication</strong> - For secure user authentication</li>
          <li><strong>Firebase Firestore</strong> - For secure data storage</li>
          <li><strong>Google Sign-In</strong> - Optional authentication method</li>
        </ul>
        <p>
          When you use Google Sign-In, Google's privacy policy also applies. You can review it at 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">https://policies.google.com/privacy</a>.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access your data</strong> - All your data is visible within the app</li>
          <li><strong>Update your data</strong> - You can edit your information at any time</li>
          <li><strong>Delete your data</strong> - You can delete your account and all associated data from the Settings page</li>
          <li><strong>Export your data</strong> - Contact us to request a copy of your data</li>
        </ul>
      </section>

      <section>
        <h2>Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. When you delete your account, all your personal data is permanently deleted from our systems.
        </p>
      </section>

      <section>
        <h2>Children's Privacy</h2>
        <p>
          PathMark is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or your data, please contact us through the app's Settings page.
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
.privacy-view {
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 2rem 1rem;
}

.privacy-container {
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
  .privacy-container {
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
