<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const store = useAuthStore()

const props = defineProps<{
    isOpen?: boolean
}>()

const emit = defineEmits(['link-clicked'])

const userInitial = computed(() => {
    const user = store.user
    if (!user) return 'U'
    
    // Safely access properties with optional chaining and defaults
    const name = user.displayName || user.email || ''
    return name.length > 0 ? name[0].toUpperCase() : 'U'
})

const handleLogout = async () => {
    await store.logout()
    router.push('/login')
}
</script>

<template>
  <aside class="sidebar" :class="{ 'open': isOpen }">
    <div class="logo">
      <h1>NorthStar</h1>
    </div>
    
    <nav class="nav-links" v-if="store.user">
      <RouterLink to="/" class="nav-item" active-class="active" @click="$emit('link-clicked')">
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
    </nav>

    <div class="user-profile" v-if="store.user">
      <div class="avatar">{{ userInitial }}</div>
      <div class="user-info">
        <span class="username">{{ store.user?.displayName || 'User' }}</span>
        <button class="btn-logout" @click="handleLogout">Log out</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.3s ease;
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
</style>
