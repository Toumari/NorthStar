<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSubscriptionStore } from '../stores/subscription'
import { useTrackersStore } from '../stores/trackers'
import { RouterLink } from 'vue-router'

import HabitHeatmap from '../components/HabitHeatmap.vue'
import LifeBalanceRadar from '../components/LifeBalanceRadar.vue'
import TrendChart from '../components/TrendChart.vue'

const subscriptionStore = useSubscriptionStore()
const trackersStore = useTrackersStore()

onMounted(() => {
    subscriptionStore.loadSubscription()
})

const isPremium = computed(() => subscriptionStore.isPremium)

// Select up to 2 trackers for trend analysis
const trendTrackers = computed(() => {
    return trackersStore.trackers.slice(0, 2)
})
</script>

<template>
  <div class="analytics-view">
    <header class="page-header">
      <h2>Analytics & Insights</h2>
      <p class="subtitle">Deep dive into your progress and habits.</p>
    </header>

    <div class="analytics-content" :class="{ 'blurred': !isPremium }">
        <!-- Row 1: Heatmap (Full Width) -->
        <section class="card analytics-card full-width">
            <div class="card-header">
                <h3>Consistency Heatmap</h3>
                <p>Your daily activity overview for the past year.</p>
            </div>
            <div class="chart-wrapper heatmap-wrapper">
                <HabitHeatmap />
            </div>
        </section>

        <!-- Row 2: Radar & Trends -->
        <div class="grid-row">
            <section class="card analytics-card">
                <div class="card-header">
                    <h3>Life Balance</h3>
                    <p>Goal distribution by category.</p>
                </div>
                <div class="chart-wrapper">
                    <LifeBalanceRadar />
                </div>
            </section>

            <section class="card analytics-card">
                 <div class="card-header">
                    <h3>Trend Projections</h3>
                    <p>AI-driven forecast for your top trackers.</p>
                </div>
                <div class="chart-wrapper trend-wrapper">
                    <div v-if="trendTrackers.length === 0" class="empty-trends">
                        <p>No trackers active.</p>
                        <RouterLink to="/trackers">Create Tracker</RouterLink>
                    </div>
                    <div v-else class="trend-grid">
                        <div v-for="tracker in trendTrackers" :key="tracker.id" class="mini-trend">
                            <h4>{{ tracker.name }}</h4>
                            <div class="mini-chart-box">
                                <TrendChart :tracker="tracker" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- Premium Lock Overlay -->
    <div v-if="!isPremium" class="premium-overlay">
        <div class="lock-content">
            <span class="lock-icon">🔒</span>
            <h3>Unlock Premium Analytics</h3>
            <p>Get access to deep insights, trend forecasting, and habit heatmaps.</p>
            <RouterLink to="/pricing" class="btn-primary">Upgrade to Premium</RouterLink>
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

.analytics-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    transition: filter 0.3s;
}

.blurred {
    filter: blur(8px);
    pointer-events: none;
    user-select: none;
}

.card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1.5rem;
}

.card-header {
    margin-bottom: 1.5rem;
}

.card-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
}

.card-header p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.grid-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
}

.chart-wrapper {
    width: 100%;
    min-height: 300px;
}

.heatmap-wrapper {
    min-height: auto;
    padding-bottom: 0.5rem;
}

.trend-wrapper {
    display: flex;
    flex-direction: column;
}

.trend-grid {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    height: 100%;
}

.mini-trend h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
}

.mini-chart-box {
    height: 150px;
    width: 100%;
}

.empty-trends {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
}

/* Premium Overlay */
.premium-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    /* Center content */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.lock-content {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    max-width: 400px;
}

.lock-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
}

.lock-content h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
}

.lock-content p {
    color: var(--color-text-muted);
    margin-bottom: 2rem;
    line-height: 1.6;
}

.btn-primary {
    background-color: var(--color-primary);
    color: white;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    display: inline-block;
    transition: transform 0.2s;
}

.btn-primary:hover {
    transform: translateY(-2px);
}
</style>
