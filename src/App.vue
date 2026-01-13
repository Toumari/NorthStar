<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SidebarNav from './components/SidebarNav.vue'
import OnboardingTour from './components/OnboardingTour.vue'
import { useThemeStore } from './stores/theme'

const isMobileMenuOpen = ref(false)
const route = useRoute()
const themeStore = useThemeStore()

// Initialize theme
themeStore.initTheme()

// Routes where sidebar should be hidden
const hideSidebar = computed(() => {
  return ['login', 'register', 'forgot-password'].includes(route.name as string)
})

// Close mobile menu on route change
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="app-layout">
    <!-- Mobile Header -->
    <header class="mobile-header" v-if="!hideSidebar">
      <button class="menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <span class="hamburger">☰</span>
      </button>
      <span class="mobile-title">PathMark</span>
    </header>

    <!-- Sidebar with overlay logic -->
    <div class="sidebar-wrapper" :class="{ 'open': isMobileMenuOpen }" v-if="!hideSidebar">
      <div class="overlay" @click="isMobileMenuOpen = false"></div>
      <SidebarNav :is-open="isMobileMenuOpen" @link-clicked="closeMobileMenu" />
    </div>

    <main class="main-content" :class="{ 'full-screen': hideSidebar }">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <OnboardingTour />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100dvh;
  width: 100vw;
  background-color: var(--color-background);
  color: var(--color-text);
  overflow: hidden;
}

.mobile-header {
  display: none;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem;
  align-items: center;
  gap: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: 60px;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.25rem;
}

.mobile-title {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-primary);
}

.sidebar-wrapper {
  display: flex;
  height: 100%;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.main-content.full-screen {
  padding: 0;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    padding-top: 60px; /* Space for mobile header */
  }

  .app-layout:has(.main-content.full-screen) {
    padding-top: 0;
  }

  .main-content {
    padding: 1rem; /* Reduce padding on mobile */
  }
  
  .main-content.full-screen {
    padding: 0;
  }

  .mobile-header {
    display: flex;
  }

  .sidebar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    z-index: 30;
    pointer-events: none;
  }

  /* Overlay that darkens the background */
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .sidebar-wrapper.open .overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar-wrapper.open {
    pointer-events: auto;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
