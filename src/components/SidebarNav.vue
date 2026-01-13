<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSubscriptionStore } from '../stores/subscription'
import { useGamificationStore } from '../stores/gamification'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const store = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const gamificationStore = useGamificationStore()
const themeStore = useThemeStore()

onMounted(() => {
  subscriptionStore.loadSubscription()
  gamificationStore.loadGamificationData()
})

const props = defineProps<{
    isOpen?: boolean
}>()

const emit = defineEmits(['link-clicked'])

const userInitial = computed(() => {
    const user = store.user
    if (!user) return 'U'
    
    // Safely access properties with optional chaining and defaults
    const name: string = (user.displayName || user.email || '')
    return name.length > 0 ? name.charAt(0).toUpperCase() : 'U'
})

const handleLogout = async () => {
    await store.logout()
    router.push('/login')
}
</script>

<template>
  <aside class="sidebar" :class="{ 'open': isOpen }">
    <div class="logo">
      <h1>PathMark</h1>
    </div>
    
    <nav class="nav-links" v-if="store.user">
      <RouterLink to="/" class="nav-item" exact-active-class="active" @click="$emit('link-clicked')">
        <span class="icon">📊</span>
        Dashboard
      </RouterLink>
      <RouterLink to="/goals" class="nav-item" active-class="active" @click="$emit('link-clicked')">
        <span class="icon">🎯</span>
        Goals
      </RouterLink>
      <RouterLink to="/journal" class="nav-item" active-class="active" @click="$emit('link-clicked')">
        <span class="icon">📔</span>
        Journal
      </RouterLink>
      <RouterLink to="/trackers" class="nav-item" active-class="active" @click="$emit('link-clicked')">
        <span class="icon">📈</span>
        Trackers
      </RouterLink>
      <RouterLink to="/badges" class="nav-item" active-class="active" @click="$emit('link-clicked')">
        <span class="icon">🏆</span>
        Badges
      </RouterLink>
      <RouterLink to="/settings" class="nav-item" active-class="active" @click="$emit('link-clicked')">
        <span class="icon">⚙️</span>
        Settings
      </RouterLink>
      
      <div class="nav-divider"></div>
      
      <button class="nav-item btn-logout-nav" @click="handleLogout">
        <span class="icon">🚪</span>
        Log Out
      </button>

      <button class="nav-item btn-theme-nav mobile-only" @click="themeStore.toggleTheme">
        <span class="icon">{{ themeStore.isDark ? '☀️' : '🌙' }}</span>
        {{ themeStore.isDark ? 'Light Mode' : 'Dark Mode' }}
      </button>
    </nav>

    <div class="user-profile" v-if="store.user">
      <!-- Profile & Level -->
      <div class="profile-header">
        <div class="avatar">{{ userInitial }}</div>
        <div class="user-info">
            <span class="username">{{ store.user?.displayName || 'User' }}</span>
            <span v-if="subscriptionStore.isPremium" class="premium-badge">✓ Premium</span>
            
            <!-- XP Info Block -->
            <div class="level-stats">
               <div class="level-info">
                   <span class="level-badge">Lvl {{ gamificationStore.level }}</span>
                   <span class="xp-text">{{ Math.floor(gamificationStore.xp) }} / {{ gamificationStore.xpToNextLevel }} XP</span>
               </div>
               <div class="xp-container-mini">
                    <div class="xp-bar" :style="{ width: gamificationStore.progressPercent + '%' }"></div>
               </div>
            </div>
        </div>
      </div>

      <button class="theme-toggle" @click.stop="themeStore.toggleTheme" :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        {{ themeStore.isDark ? '☀️' : '🌙' }}
      </button>
    </div>
  </aside>
</template>


<style scoped>
/* Only showing NEW or MODIFIED styles for brevity */


.profile-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
}

.level-stats {
    margin-top: 0.25rem;
    width: 100%;
}

.level-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
}

.level-badge {
    color: var(--color-warning);
    font-weight: 700;
}

.xp-text {
    color: var(--color-text-muted);
}

.xp-container-mini {
    width: 100%;
    height: 4px;
    background-color: var(--color-border);
    border-radius: 2px;
    overflow: hidden;
}

.xp-bar {
    height: 100%;
    background-color: var(--color-warning);
    transition: width 0.5s ease-out;
}

/* ... existing styles ... */

.sidebar {
  width: 250px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.3s ease;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 40;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }
  
  /* Parent wrapper needs .open class to slide this in */
}

/* Open state controlled by prop */
.sidebar.open {
  transform: translateX(0);
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 2rem;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2sease;
}

.nav-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.nav-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0.5rem 0;
}

.btn-logout-nav {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
}

.btn-logout-nav:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-danger);
}

.user-profile {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  margin-left: auto;
  color: var(--color-text);
  transition: all 0.2s;
}

.theme-toggle:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.premium-badge {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
}

.btn-logout {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.btn-logout:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.btn-theme-nav {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
}

.btn-theme-nav:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .mobile-only {
    display: flex;
  }
}
</style>
