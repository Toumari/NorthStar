import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(false)

    const initTheme = () => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            isDark.value = savedTheme === 'dark'
        } else {
            // Check system preference
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyTheme()
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        applyTheme()
    }

    const applyTheme = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    // Watch for changes (optional redundancy, but good for reactivity)
    watch(isDark, () => {
        applyTheme()
    })

    return {
        isDark,
        initTheme,
        toggleTheme
    }
})
