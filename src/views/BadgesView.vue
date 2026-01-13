<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamification'

const store = useGamificationStore()

const allBadges = computed(() => Object.values(store.AVAILABLE_BADGES))
const unlockedIds = computed(() => store.unlockedBadgeIds)

const isUnlocked = (badgeId: string) => unlockedIds.value.includes(badgeId)
</script>

<template>
  <div class="badges-view">
    <header class="page-header">
      <h2>Achievements</h2>
      <p class="subtitle">Complete challenges to unlock badges and earn XP.</p>
    </header>

    <div class="badges-grid">
      <div 
        v-for="badge in allBadges" 
        :key="badge.id" 
        class="badge-card"
        :class="{ 'locked': !isUnlocked(badge.id), 'unlocked': isUnlocked(badge.id) }"
      >
        <div class="badge-icon-wrapper">
             <span v-if="isUnlocked(badge.id)" class="badge-icon">{{ badge.icon }}</span>
             <span v-else class="badge-icon locked-icon">🔒</span>
        </div>
        <div class="badge-info">
            <h4>{{ badge.name }}</h4>
            <p>{{ badge.description }}</p>
            <div class="status-tag" v-if="isUnlocked(badge.id)">Unlocked</div>
            <div class="status-tag locked-tag" v-else>Locked</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.badge-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.2s;
}

.badge-card.unlocked {
    border-color: var(--color-warning);
    background: linear-gradient(to right, var(--color-surface), rgba(251, 191, 36, 0.05));
}

.badge-card.locked {
    opacity: 0.7;
    background-color: var(--color-background);
}

.badge-icon-wrapper {
    flex-shrink: 0;
}

.badge-icon {
    font-size: 2.5rem;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface-hover);
    border-radius: 50%;
}

.badge-icon.locked-icon {
    font-size: 1.5rem;
    background-color: var(--color-border);
    color: var(--color-text-muted);
}

.badge-info {
    flex: 1;
}

.badge-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    color: var(--color-text);
}

.badge-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: var(--color-text-muted);
}

.status-tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    background-color: rgba(34, 197, 94, 0.1); /* Green tint */
    color: var(--color-success);
}

.status-tag.locked-tag {
    background-color: var(--color-surface-hover);
    color: var(--color-text-muted);
}
</style>
