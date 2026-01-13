import { defineStore } from 'pinia'
import { ref, watch } from 'vue'


export const useThemeStore = defineStore('theme', () => {
    const isDark = ref(false)
    const activeTheme = ref('ocean') // Default theme

    const AVAILABLE_THEMES = [
        { id: 'ocean', name: 'Ocean Blue', color: '#0284c7' }, // Use hex for preview if needed
        { id: 'sunset', name: 'Sunset Orange', color: '#f97316' },
        { id: 'forest', name: 'Forest Green', color: '#10b981' },
        { id: 'lavender', name: 'Lavender Purple', color: '#8b5cf6' }
    ]

    const initTheme = () => {
        // Check localStorage for Dark Mode
        const savedDarkMode = localStorage.getItem('theme_mode')
        if (savedDarkMode) {
            isDark.value = savedDarkMode === 'dark'
        } else {
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }

        // Check localStorage for Active Theme
        const savedTheme = localStorage.getItem('theme_color')
        if (savedTheme && AVAILABLE_THEMES.find(t => t.id === savedTheme)) {
            activeTheme.value = savedTheme
        }

        applyTheme()
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        applyTheme()
    }

    const setTheme = (themeId: string) => {
        if (AVAILABLE_THEMES.find(t => t.id === themeId)) {
            activeTheme.value = themeId
            applyTheme()
        }
    }

    const applyTheme = () => {
        const docEl = document.documentElement

        // Handle Dark Mode
        if (isDark.value) {
            docEl.classList.add('dark')
            localStorage.setItem('theme_mode', 'dark')
        } else {
            docEl.classList.remove('dark')
            localStorage.setItem('theme_mode', 'light')
        }

        // Handle Color Theme
        // Remove existing theme classes
        AVAILABLE_THEMES.forEach(t => docEl.classList.remove(`theme-${t.id}`))
        // Add new theme class
        docEl.classList.add(`theme-${activeTheme.value}`)
        localStorage.setItem('theme_color', activeTheme.value)
    }

    // Watch for changes
    watch([isDark, activeTheme], () => {
        applyTheme()
    })

    return {
        isDark,
        activeTheme,
        AVAILABLE_THEMES,
        initTheme,
        toggleTheme,
        setTheme
    }
})
