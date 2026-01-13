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

    <!-- Player Stats Header -->
    <div class="stats-header">
        <div class="level-circle">
            <span class="level-label">Level</span>
            <span class="level-num">{{ store.level }}</span>
        </div>
        <div class="stats-info">
            <div class="stats-row">
                <h3>Navigator</h3> <!-- Rank Title could be dynamic later -->
                <span class="xp-total">{{ Math.floor(store.xp) }} / {{ store.xpToNextLevel }} XP</span>
            </div>
            <div class="xp-progress-container">
                <div class="xp-progress-bar" :style="{ width: store.progressPercent + '%' }"></div>
            </div>
            <p class="next-level-text">
                {{ store.xpToNextLevel - Math.floor(store.xp) }} XP to Level {{ store.level + 1 }}
            </p>
        </div>
    </div>

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

.stats-header {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.level-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.level-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    opacity: 0.8;
}

.level-num {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
}

.stats-info {
    flex: 1;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.stats-row h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--color-text);
}

.xp-total {
    font-weight: 600;
    color: var(--color-text-muted);
}

.xp-progress-container {
    height: 10px;
    background-color: var(--color-surface-hover);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.xp-progress-bar {
    height: 100%;
    background-color: var(--color-warning);
    transition: width 0.5s ease-out;
}

.next-level-text {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    text-align: right;
}

@media (max-width: 480px) {
    .stats-header {
        flex-direction: column;
        text-align: center;
    }
    
    .stats-row {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .next-level-text {
        text-align: center;
    }
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
