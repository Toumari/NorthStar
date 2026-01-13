<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const store = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const emailError = ref('')
const passwordError = ref('')
const loading = ref(false)

const isValid = computed(() => {
  return email.value.trim() !== '' && password.value !== ''
})

const validate = () => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''
  error.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validate()) return
  
  loading.value = true
  
  try {
    await store.login(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-login-credentials') {
      error.value = 'Incorrect email or password'
    } else if (e.code === 'auth/too-many-requests') {
      error.value = 'Too many attempts. Please try again later.'
    } else {
      error.value = 'An error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await store.loginWithGoogle()
    router.push('/')
  } catch (e: any) {
    if (e.code === 'auth/popup-closed-by-user') {
      // User closed popup, no error needed usually
    } else {
      error.value = 'Failed to sign in with Google'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="auth-container">
      <!-- Feature Showcase Section -->
      <section class="features-panel">
        <div class="features-content">
          <div class="brand">
            <h1>PathMark</h1>
            <p class="tagline">Navigate your life with purpose.</p>
          </div>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              </div>
              <div>
                <h3>Goal Tracking</h3>
                <p>Set clear objectives and break them down into actionable steps.</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div>
                <h3>Daily Journal</h3>
                <p>Reflect on your progress and capture your daily thoughts.</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <div>
                <h3>Habit Trackers</h3>
                <p>Monitor your improved habits and vital metrics over time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Login Form Section -->
      <section class="login-panel">
        <div class="auth-card">
          <header>
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </header>
          
          <form @submit.prevent="handleLogin" novalidate>
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model.trim="email" 
                :class="{ 'input-error': emailError }"
                placeholder="you@example.com"
                required
              >
              <span class="error-text" v-if="emailError">{{ emailError }}</span>
            </div>
            
            <div class="form-group">
              <label>Password</label>
              <input 
                type="password" 
                v-model="password" 
                :class="{ 'input-error': passwordError }"
                placeholder="••••••••"
                required
              >
              <span class="error-text" v-if="passwordError">{{ passwordError }}</span>
              <div class="forgot-link">
                <RouterLink to="/forgot-password">Forgot password?</RouterLink>
              </div>
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <button type="submit" class="btn-primary" :disabled="loading || !isValid">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>

            <div class="separator">
              <span>or</span>
            </div>

            <button type="button" class="btn-google" @click="handleGoogleLogin" :disabled="loading">
              <svg class="google-icon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.749 C -12.984 43.749 -11.404 44.369 -10.154 45.569 L -6.744 42.159 C -8.804 40.239 -11.514 39.009 -14.754 39.009 C -19.444 39.009 -23.494 41.709 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.749 -14.754 43.749 Z" />
                </g>
              </svg>
              Sign in with Google
            </button>
          </form>

          <div class="footer">
            <p>Don't have an account? <RouterLink to="/register">Sign up</RouterLink></p>
            <p class="privacy-link"><RouterLink to="/privacy">Privacy Policy</RouterLink></p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  padding: 1rem;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background-color: var(--color-surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border);
  min-height: 600px;
}

/* Features Panel */
.features-panel {
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.features-panel::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.features-panel::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.features-content {
  position: relative;
  z-index: 1;
}

.brand {
  margin-bottom: 3rem;
}

.brand h1 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
}

.tagline {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.icon-box {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-item h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: white;
}

.feature-item p {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* Login Panel */
.login-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--color-surface);
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h2 {
  font-size: 1.75rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

header p {
  color: var(--color-text-muted);
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
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

.btn-primary {
  width: 100%;
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 1rem;
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.separator span {
  padding: 0 1rem;
}

.btn-google {
  width: 100%;
  background-color: white;
  color: #3c4043;
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  font-family: inherit;
  font-size: 0.9rem;
}

.btn-google:hover {
  background-color: #f8f9fa;
  border-color: #dadce0;
}

.btn-google:active {
  background-color: #f1f3f4;
}

.btn-google:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.forgot-link {
  text-align: right;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.forgot-link a {
  color: var(--color-text-muted);
  text-decoration: none;
}

.forgot-link a:hover {
  color: var(--color-primary);
}

.error-msg {
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
}

.footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.footer a:hover {
  text-decoration: underline;
}

.privacy-link {
  margin-top: 0.5rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    min-height: auto;
  }

  .features-panel {
    padding: 2rem;
  }

  .brand {
    margin-bottom: 2rem;
    text-align: center;
  }

  .features-list {
    display: none; /* Hide detailed features on mobile to save space, or keep them if preferred */
  }

  /* Optional: Show summarized version on mobile */
  .features-panel {
    align-items: center;
    text-align: center;
  }
}
</style>
