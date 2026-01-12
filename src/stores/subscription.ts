import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export type SubscriptionTier = 'free' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'none'

export interface SubscriptionData {
    tier: SubscriptionTier
    status: SubscriptionStatus
    subscriptionId?: string
    subscriptionEndDate?: number
}

export const useSubscriptionStore = defineStore('subscription', () => {
    const authStore = useAuthStore()

    const subscriptionData = ref<SubscriptionData>({
        tier: 'free',
        status: 'none'
    })

    const isLoading = ref(false)

    // Computed
    const isPremium = computed(() => subscriptionData.value.tier === 'premium')
    const isFree = computed(() => subscriptionData.value.tier === 'free')

    // Limits
    const FREE_GOAL_LIMIT = 3
    const FREE_TRACKER_LIMIT = 2
    const FREE_JOURNAL_EDIT_DAYS = 14

    // Load subscription data from Firestore
    const loadSubscription = async () => {
        if (!authStore.user) return

        isLoading.value = true
        try {
            const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
            if (userDoc.exists()) {
                const data = userDoc.data()
                subscriptionData.value = {
                    tier: data.subscriptionTier || 'free',
                    status: data.subscriptionStatus || 'none',
                    subscriptionId: data.subscriptionId,
                    subscriptionEndDate: data.subscriptionEndDate
                }
            } else {
                // Initialize new user as free tier
                await setDoc(doc(db, 'users', authStore.user.uid), {
                    subscriptionTier: 'free',
                    subscriptionStatus: 'none'
                })
            }
        } catch (error) {
            console.error('Error loading subscription:', error)
        } finally {
            isLoading.value = false
        }
    }

    // Update subscription tier (called after successful payment)
    const updateSubscription = async (data: Partial<SubscriptionData>) => {
        if (!authStore.user) return

        try {
            await updateDoc(doc(db, 'users', authStore.user.uid), {
                subscriptionTier: data.tier,
                subscriptionStatus: data.status,
                subscriptionId: data.subscriptionId,
                subscriptionEndDate: data.subscriptionEndDate
            })

            subscriptionData.value = {
                ...subscriptionData.value,
                ...data
            }
        } catch (error) {
            console.error('Error updating subscription:', error)
            throw error
        }
    }

    // Check if user can create a goal
    const canCreateGoal = (currentGoalCount: number): boolean => {
        if (isPremium.value) return true
        return currentGoalCount < FREE_GOAL_LIMIT
    }

    // Check if user can create a tracker
    const canCreateTracker = (currentTrackerCount: number): boolean => {
        if (isPremium.value) return true
        return currentTrackerCount < FREE_TRACKER_LIMIT
    }

    // Check if user can edit a journal entry by date
    const canEditJournalEntry = (entryDate: Date): boolean => {
        if (isPremium.value) return true

        const daysDiff = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= FREE_JOURNAL_EDIT_DAYS
    }

    // Get remaining goals
    const getRemainingGoals = (currentGoalCount: number): number => {
        if (isPremium.value) return Infinity
        return Math.max(0, FREE_GOAL_LIMIT - currentGoalCount)
    }

    // Get remaining trackers
    const getRemainingTrackers = (currentTrackerCount: number): number => {
        if (isPremium.value) return Infinity
        return Math.max(0, FREE_TRACKER_LIMIT - currentTrackerCount)
    }

    return {
        subscriptionData,
        isLoading,
        isPremium,
        isFree,
        FREE_GOAL_LIMIT,
        FREE_TRACKER_LIMIT,
        FREE_JOURNAL_EDIT_DAYS,
        loadSubscription,
        updateSubscription,
        canCreateGoal,
        canCreateTracker,
        canEditJournalEntry,
        getRemainingGoals,
        getRemainingTrackers
    }
})
