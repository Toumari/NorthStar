import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: number
    message: string
    type: ToastType
    duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

const addToast = (message: string, type: ToastType, duration = 4000) => {
    const id = nextId++
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    return id
}

const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
        toasts.value.splice(index, 1)
    }
}

export function useToast() {
    return {
        toasts: readonly(toasts),
        success: (message: string, duration?: number) => addToast(message, 'success', duration),
        error: (message: string, duration?: number) => addToast(message, 'error', duration),
        warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
        info: (message: string, duration?: number) => addToast(message, 'info', duration),
        remove: removeToast
    }
}
