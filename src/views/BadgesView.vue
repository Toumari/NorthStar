<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore } from '../stores/gamification'
import { useGoalsStore } from '../stores/goals'
import { useJournalStore } from '../stores/journal'
import { useTrackersStore } from '../stores/trackers'

const store = useGamificationStore()
const goalsStore = useGoalsStore()
const journalStore = useJournalStore()
const trackersStore = useTrackersStore()

const allBadges = computed(() => Object.values(store.AVAILABLE_BADGES))
const unlockedIds = computed(() => store.unlockedBadgeIds)

const isUnlocked = (badgeId: string) => unlockedIds.value.includes(badgeId)

const getBadgeProgress = (badgeId: string) => {
    // If unlocked, it's 100%
    if (isUnlocked(badgeId)) return { current: 1, total: 1, percent: 100 }

    let current = 0
    let total = 0

    switch (badgeId) {
        case 'first_goal':
            current = goalsStore.completedGoals.length
            total = 1
            break
        case 'goal_master':
            current = goalsStore.completedGoals.length
            total = 5
            break
        case 'writer_streak':
            current = journalStore.entries.length
            total = 3
            break
        case 'journal_enthusiast':
            current = journalStore.entries.length
            total = 10
            break
        case 'tracker_pro':
            current = trackersStore.trackers.reduce((sum, t) => sum + t.data.length, 0)
            total = 10
            break
        case 'tracker_titan':
            current = trackersStore.trackers.reduce((sum, t) => sum + t.data.length, 0)
            total = 50
            break
        case 'level_5':
            current = store.level
            total = 5
            break
        default:
            return null // No progress tracking for this badge (e.g. time-based ones)
    }

    if (current > total) current = total

    return {
        current,
        total,
        percent: (current / total) * 100
    }
}
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
            
            <template v-else>
                <div class="status-tag locked-tag">Locked</div>
                
                <!-- Progress Bar for Locked Badges -->
                <div class="badge-progress" v-if="getBadgeProgress(badge.id)">
                    <div class="progress-details">
                        <span class="progress-text">{{ getBadgeProgress(badge.id)!.current }} / {{ getBadgeProgress(badge.id)!.total }}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" :style="{ width: getBadgeProgress(badge.id)!.percent + '%' }"></div>
                    </div>
                </div>
            </template>
        </div>
      </div>
    </div>

    <!-- XP Guide Section -->
    <section class="xp-guide">
        <h3>How to Earn XP</h3>
        <div class="xp-methods">
            <div class="xp-method-card">
                <span class="method-icon">🎯</span>
                <div class="method-info">
                    <h4>Reach a Goal</h4>
                    <span class="xp-value">+50 XP</span>
                </div>
            </div>
            <div class="xp-method-card">
                <span class="method-icon">✍️</span>
                <div class="method-info">
                    <h4>Journal Entry</h4>
                    <span class="xp-value">+10 XP</span>
                </div>
            </div>
            <div class="xp-method-card">
                <span class="method-icon">📊</span>
                <div class="method-info">
                    <h4>Track Data</h4>
                    <span class="xp-value">+5 XP</span>
                </div>
            </div>
        </div>
    </section>
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

.badge-progress {
    margin-top: 0.75rem;
}

.progress-details {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.25rem;
}

.progress-text {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 600;
}

.progress-bar-bg {
    height: 6px;
    background-color: var(--color-surface-hover);
    border-radius: 3px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 3px;
    transition: width 0.3s ease;
}

.xp-guide {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
}

.xp-guide h3 {
    margin-bottom: 1.5rem;
    color: var(--color-text);
}

.xp-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.xp-method-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 1rem;
    border-radius: 8px;
}

.method-icon {
    font-size: 1.5rem;
}

.method-info h4 {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text);
}

.xp-value {
    font-weight: 700;
    color: var(--color-warning);
    font-size: 0.8rem;
}
</style>
