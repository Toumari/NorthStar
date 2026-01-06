<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const store = useAuthStore()

const email = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

const handleReset = async () => {
    if (!email.value) return

    loading.value = true
    error.value = ''
    message.value = ''

    try {
        await store.resetPassword(email.value)
        message.value = 'Check your email for password reset instructions.'
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth-view">
        <div class="auth-card">
            <header>
                <h1>NorthStar</h1>
                <p>Reset your password</p>
            </header>

            <form @submit.prevent="handleReset" v-if="!message">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="email" required placeholder="you@example.com">
                </div>

                <div v-if="error" class="error-msg">{{ error }}</div>

                <button type="submit" class="btn-primary" :disabled="loading">
                    {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>
            </form>

            <div v-else class="success-state">
                <div class="success-icon">✉️</div>
                <p>{{ message }}</p>
            </div>

            <div class="footer">
                <p>Remembered it? <RouterLink to="/login">Sign in</RouterLink></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-view {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background);
}

.auth-card {
    width: 100%;
    max-width: 400px;
    background-color: var(--color-surface);
    padding: 2.5rem;
    border-radius: 16px;
    border: 1px solid var(--color-border);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

header {
    text-align: center;
    margin-bottom: 2rem;
}

h1 {
    font-size: 2rem;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
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

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.error-msg {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    text-align: center;
}

.success-state {
    text-align: center;
    margin-bottom: 2rem;
}

.success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.875rem;
}

.footer a {
    color: var(--color-primary);
    text-decoration: none;
}

.footer a:hover {
    text-decoration: underline;
}
</style>
