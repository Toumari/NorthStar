<script setup lang="ts">
import { useToast, type Toast } from '../composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: Toast['type']) => {
    switch (type) {
        case 'success': return '✓'
        case 'error': return '✕'
        case 'warning': return '!'
        case 'info': return 'i'
    }
}
</script>

<template>
    <Teleport to="body">
        <div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
            <TransitionGroup name="toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="toast"
                    :class="`toast--${toast.type}`"
                    role="alert"
                >
                    <span class="toast-icon">{{ getIcon(toast.type) }}</span>
                    <span class="toast-message">{{ toast.message }}</span>
                    <button
                        class="toast-close"
                        @click="remove(toast.id)"
                        aria-label="Dismiss notification"
                    >
                        &times;
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
    pointer-events: none;
}

.toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
}

.toast--success {
    border-left: 4px solid #10b981;
}

.toast--success .toast-icon {
    color: #10b981;
    background-color: rgba(16, 185, 129, 0.1);
}

.toast--error {
    border-left: 4px solid #ef4444;
}

.toast--error .toast-icon {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
}

.toast--warning {
    border-left: 4px solid #f59e0b;
}

.toast--warning .toast-icon {
    color: #f59e0b;
    background-color: rgba(245, 158, 11, 0.1);
}

.toast--info {
    border-left: 4px solid #3b82f6;
}

.toast--info .toast-icon {
    color: #3b82f6;
    background-color: rgba(59, 130, 246, 0.1);
}

.toast-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.toast-message {
    flex: 1;
    font-size: 0.9rem;
    color: var(--color-text);
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    flex-shrink: 0;
}

.toast-close:hover {
    color: var(--color-text);
}

/* Transition animations */
.toast-enter-active {
    animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
    animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes toast-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
    .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
    }
}
</style>
