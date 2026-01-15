<script setup lang="ts">
import { useGoalsStore } from '../stores/goals'
import { useJournalStore } from '../stores/journal'
import { useTrackersStore } from '../stores/trackers'
import { useSubscriptionStore } from '../stores/subscription'
import { useGamificationStore } from '../stores/gamification'
import GoalCard from '../components/GoalCard.vue'
import TrackerSummaryCard from '../components/TrackerSummaryCard.vue'
import { RouterLink } from 'vue-router'

import CreateGoalModal from '../components/CreateGoalModal.vue'
import CreateTrackerModal from '../components/CreateTrackerModal.vue'
import UpgradePrompt from '../components/UpgradePrompt.vue'
import JournalCalendar from '../components/JournalCalendar.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import { ref, computed } from 'vue'

const store = useGoalsStore()
const journalStore = useJournalStore()
const trackersStore = useTrackersStore()
const subscriptionStore = useSubscriptionStore()
const gamificationStore = useGamificationStore()

const isLoading = computed(() => store.isLoading || trackersStore.isLoading || gamificationStore.isLoaded === false) // Note: gamification.isLoaded is boolean, false usually means loading initially

const showGoalModal = ref(false)
const showTrackerModal = ref(false)
const showUpgradePrompt = ref(false)
const upgradeMessage = ref('')

const handleCreateGoalClick = () => {
    if (subscriptionStore.canCreateGoal(store.goals.length)) {
        showGoalModal.value = true
    } else {
        upgradeMessage.value = `You've reached the free plan limit of ${subscriptionStore.FREE_GOAL_LIMIT} goals. Upgrade to Premium for unlimited goals!`
        showUpgradePrompt.value = true
    }
}

const handleCreateTrackerClick = () => {
    if (subscriptionStore.canCreateTracker(trackersStore.trackers.length)) {
        showTrackerModal.value = true
    } else {
        upgradeMessage.value = `You've reached the free plan limit of ${subscriptionStore.FREE_TRACKER_LIMIT} trackers. Upgrade to Premium for unlimited trackers!`
        showUpgradePrompt.value = true
    }
}

const handleCreateGoal = (goalData: any) => {
  store.addGoal(goalData)
  showGoalModal.value = false
}

const handleCreateTracker = (trackerData: any) => {
  trackersStore.addTracker(trackerData.name, trackerData.unit)
  showTrackerModal.value = false
}
</script>

<template>
  <div class="dashboard-view">
    <header class="page-header">
      <h2>Dashboard</h2>
      <p class="subtitle">Welcome back to your PathMark.</p>
    </header>

    <div class="stats-grid" v-if="isLoading">
       <div class="stat-card" v-for="i in 3" :key="i">
           <SkeletonLoader width="60%" height="20px" marginBottom="10px" />
           <SkeletonLoader width="40%" height="32px" />
       </div>
    </div>

    <div class="stats-grid" v-else>
      <RouterLink to="/goals?filter=completed" class="stat-card highlight">
        <h3>Completed Goals</h3>
        <p class="stat-value">{{ store.completedGoals.length }}</p>
      </RouterLink>
      <RouterLink to="/goals?filter=active" class="stat-card">
        <h3>Active Goals</h3>
        <p class="stat-value">{{ store.activeGoalsCount }}</p>
      </RouterLink>
      <RouterLink to="/goals?filter=today" class="stat-card">
        <h3>Tasks for Today</h3>
        <p class="stat-value">{{ store.todaysTasksCount }}</p>
      </RouterLink>
    </div>
    
    
    <!-- Recent Achievements & Next Steps -->
    <section class="achievements-section" v-if="gamificationStore.unlockedBadges.length > 0">
        <header class="section-header">
            <h3>Recent Unlocks</h3>
            <RouterLink to="/badges" class="view-all">View All Badges</RouterLink>
        </header>
        <div class="badges-row">
            <!-- Show only the most recent badge (last one added) -->
            <div 
                v-if="gamificationStore.recentUnlock || gamificationStore.unlockedBadges.length > 0" 
                class="badge-card recent-badge"
            >
                <div class="badge-content">
                     <span class="badge-icon">{{ (gamificationStore.recentUnlock || gamificationStore.unlockedBadges[gamificationStore.unlockedBadges.length - 1]).icon }}</span>
                     <div class="badge-info">
                        <span class="label">Just Unlocked!</span>
                        <h4>{{ (gamificationStore.recentUnlock || gamificationStore.unlockedBadges[gamificationStore.unlockedBadges.length - 1]).name }}</h4>
                    </div>
                </div>
            </div>

            <!-- Simple 'Next Step' Suggestion (Hardcoded logic for MVP demo) -->
            <div class="badge-card next-step-badge" v-if="!gamificationStore.unlockedBadgeIds.includes('writer_streak')">
                 <div class="badge-content">
                     <span class="badge-icon locked">🔒</span>
                     <div class="badge-info">
                        <span class="label">Next Goal</span>
                        <h4>Dedicated Writer</h4>
                        <p class="progress-text">Write 3 journal entries</p>
                    </div>
                </div>
            </div>
             <div class="badge-card next-step-badge" v-else-if="!gamificationStore.unlockedBadgeIds.includes('tracker_pro')">
                 <div class="badge-content">
                     <span class="badge-icon locked">🔒</span>
                     <div class="badge-info">
                        <span class="label">Next Goal</span>
                        <h4>Tracker Pro</h4>
                        <p class="progress-text">Add 10 tracker points</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="recent-goals">
      <header class="section-header">
        <h3>Recent Goals</h3>
        <div class="actions" v-if="store.activeGoals.length > 0">
           <button class="btn-text-action" @click="handleCreateGoalClick">+ Add Goal</button>
           <RouterLink to="/goals" class="view-all">View All</RouterLink>
        </div>
      </header>
      <div class="goals-grid" v-if="isLoading">
          <div class="card" v-for="i in 3" :key="i" style="height: 200px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                  <SkeletonLoader width="50%" height="24px" marginBottom="1rem" />
                  <SkeletonLoader width="90%" height="16px" marginBottom="0.5rem" />
                  <SkeletonLoader width="70%" height="16px" />
              </div>
               <SkeletonLoader width="100%" height="8px" borderRadius="4px" />
          </div>
      </div>
      <div class="goals-grid" v-else>
        <template v-if="store.activeGoals.length > 0">
          <GoalCard 
            v-for="goal in store.activeGoals.slice(0, 3)" 
            :key="goal.id" 
            :goal="goal"
          />
        </template>
        <div class="empty-goal-card card" v-else @click="handleCreateGoalClick">
           <div class="empty-content">
             <span class="icon-large">+</span>
             <p>Create a goal</p>
             <span class="sub-text">Set your PathMark</span>
           </div>
        </div>
      </div>
    </section>

    <div class="dashboard-grid">
      <!-- Journal Section -->
      <section class="dashboard-section journal-section">
        <header class="section-header">
          <h3>My Journal</h3>
          <RouterLink to="/journal" class="view-all">Open Journal</RouterLink>
        </header>
        
        <JournalCalendar />
      </section>

      <!-- Trackers Section -->
      <section class="dashboard-section trackers-section">
        <header class="section-header">
          <h3>Trackers</h3>
          <div class="actions">
             <button class="btn-text-action" @click="handleCreateTrackerClick">+ Add Tracker</button>
             <RouterLink to="/trackers" class="view-all">View All</RouterLink>
          </div>
        </header>

        <div class="trackers-grid" v-if="isLoading">
             <div class="card" v-for="i in 4" :key="i" style="height: 150px;">
                 <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                     <SkeletonLoader width="40%" height="20px" />
                     <SkeletonLoader width="15%" height="16px" />
                 </div>
                 <SkeletonLoader width="60%" height="32px" marginBottom="10px" />
                 <SkeletonLoader width="30%" height="16px" />
             </div>
        </div>
        <div class="trackers-grid" v-else-if="trackersStore.trackers.length > 0">
          <TrackerSummaryCard 
            v-for="tracker in trackersStore.trackers.slice(0, 4)" 
            :key="tracker.id" 
            :tracker="tracker"
          />
        </div>
        <div class="empty-state card" v-else>
          <p>No trackers active.</p>
          <button @click="handleCreateTrackerClick" class="btn-small">Add Tracker</button>
        </div>
      </section>
    </div>

    <CreateGoalModal 
      v-if="showGoalModal" 
      @close="showGoalModal = false"
      @save="handleCreateGoal"
    />

    <CreateTrackerModal 
      v-if="showTrackerModal" 
      @close="showTrackerModal = false"
      @save="handleCreateTracker"
    />

    <UpgradePrompt
      v-if="showUpgradePrompt"
      :message="upgradeMessage"
      @close="showUpgradePrompt = false"
    />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.recent-goals {
  margin-bottom: 2rem;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background-color: var(--color-surface);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-soft);
  border: 1px solid transparent;
  text-decoration: none; /* Remove underline from RouterLink */
  display: block; /* Ensure block layout for link */
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.stat-card * {
    cursor: pointer; /* Force text elements to show hand */
}

:root.dark .stat-card {
    border-color: var(--color-border);
    box-shadow: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stat-card.highlight {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  border: none;
}

.stat-card.highlight h3, 
.stat-card.highlight .stat-value {
  color: white;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.section-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.view-all {
  font-size: 0.875rem;
  color: var(--color-primary);
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-text-action {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-text-action:hover {
  text-decoration: underline;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background-color: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid transparent; /* default no border in light mode if we have shadow */
}

:root.dark .card {
    border-color: var(--color-border);
    box-shadow: none; /* Dark mode often prefers borders over shadows */
}

.journal-date {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.journal-content {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
}

.tracker-mini-card {
  margin-bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tracker-mini-card h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--color-text);
}

.mini-chart {
  flex: 1;
  min-height: 200px;
  width: 100%;
}

.btn-small {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.trackers-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  align-content: start;
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  flex: 1; /* Make it fill the available space in the flex container */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-goal-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Approximate height of a goal card */
  border: 2px dashed var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-surface-hover); /* Slight contrast */
}

.empty-goal-card:hover {
  border-color: var(--color-primary);
  background-color: var(--color-surface);
}

.empty-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.icon-large {
  font-size: 2rem;
  color: var(--color-primary);
  font-weight: 300;
}

.empty-content p {
  margin: 0;
  font-weight: 600;
  color: var(--color-text);
}

.sub-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}


.achievements-section {
    margin-bottom: 2rem;
}


.achievements-section {
    margin-bottom: 2rem;
}

.badges-row {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.badge-card {
    flex: 1;
    min-width: 250px;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1rem;
    transition: transform 0.2s;
}

.badge-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.recent-badge {
    border-color: var(--color-warning);
    background: linear-gradient(to right, var(--color-surface), rgba(251, 191, 36, 0.05));
}

.badge-icon {
    font-size: 2rem;
    background-color: var(--color-surface-hover);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
}

.badge-icon.locked {
    background-color: var(--color-border);
    font-size: 1.5rem;
    filter: grayscale(1);
}

.badge-info h4 {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-text);
}

.badge-info .label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
    font-weight: 700;
    margin-bottom: 0.2rem;
}

.progress-text {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-text-muted);
}
</style>
