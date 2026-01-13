import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { useAuthStore } from './auth'
import { db } from '../firebase'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt?: number // Timestamp
}

export interface GamificationState {
    xp: number
    level: number
    coins: number
    badges: string[] // IDs of unlocked badges
    unlockedItems: string[] // IDs of unlocked shop items
}

export const useGamificationStore = defineStore('gamification', () => {
    const authStore = useAuthStore()

    // State
    const xp = ref(0)
    const level = ref(1)
    const coins = ref(0)
    const unlockedBadgeIds = ref<string[]>([])
    const unlockedItemIds = ref<string[]>([])
    const recentUnlock = ref<Badge | null>(null) // For toast/notification

    // Constants
    const XP_PER_LEVEL_BASE = 100
    // const XP_MULTIPLIER = 1.5 // (Unused in current formula, keeping for reference)

    // Shop Items
    const SHOP_ITEMS = [
        {
            id: 'theme_ocean',
            type: 'theme',
            targetId: 'ocean', // Maps to theme store ID
            name: 'Ocean Blue',
            description: 'The classic blue theme.',
            cost: 0, // Default
            icon: '🌊'
        },
        {
            id: 'theme_sunset',
            type: 'theme',
            targetId: 'sunset',
            name: 'Sunset Orange',
            description: 'Warm and energetic vibes.',
            cost: 500,
            icon: '🌅'
        },
        {
            id: 'theme_forest',
            type: 'theme',
            targetId: 'forest',
            name: 'Forest Green',
            description: 'Calm and natural.',
            cost: 750,
            icon: '🌲'
        },
        {
            id: 'theme_lavender',
            type: 'theme',
            targetId: 'lavender',
            name: 'Lavender Purple',
            description: 'Creative and peaceful.',
            cost: 1000,
            icon: '💜'
        }
    ]

    // Badge Definitions
    const AVAILABLE_BADGES: Record<string, Badge> = {
        'first_goal': {
            id: 'first_goal',
            name: 'Goal Getter',
            description: 'Completed your first goal!',
            icon: '🎯'
        },
        'goal_master': {
            id: 'goal_master',
            name: 'Goal Master',
            description: 'Completed 5 goals.',
            icon: '🏆'
        },
        'writer_streak': {
            id: 'writer_streak',
            name: 'Dedicated Writer',
            description: 'Created 3 journal entries.',
            icon: '✍️'
        },
        'journal_enthusiast': {
            id: 'journal_enthusiast',
            name: 'Journal Enthusiast',
            description: 'Created 10 journal entries.',
            icon: '📖'
        },
        'night_owl': {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Wrote a journal entry after 10 PM.',
            icon: '🦉'
        },
        'early_bird': {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'Wrote a journal entry before 8 AM.',
            icon: '🌅'
        },
        'tracker_pro': {
            id: 'tracker_pro',
            name: 'Data Scientist',
            description: 'Added 10 data points to your trackers.',
            icon: '📊'
        },
        'tracker_titan': {
            id: 'tracker_titan',
            name: 'Tracker Titan',
            description: 'Added 50 data points to your trackers.',
            icon: '📈'
        },
        'level_5': {
            id: 'level_5',
            name: 'High Flyer',
            description: 'Reached Level 5.',
            icon: '🚀'
        }
    }

    // Computed
    const unlockedBadges = computed(() => {
        return unlockedBadgeIds.value
            .map(id => AVAILABLE_BADGES[id])
            .filter(b => !!b)
    })

    const xpToNextLevel = computed(() => {
        return XP_PER_LEVEL_BASE * level.value
    })

    const progressPercent = computed(() => {
        return Math.min(100, (xp.value / xpToNextLevel.value) * 100)
    })

    // Actions
    watchEffect(async () => {
        if (authStore.user) {
            await loadGamificationData()
        } else {
            // Reset state on logout
            xp.value = 0
            level.value = 1
            coins.value = 0
            unlockedBadgeIds.value = []
            unlockedItemIds.value = []
        }
    })

    const loadGamificationData = async () => {
        if (!authStore.user) return

        try {
            const userDocRef = doc(db, 'users', authStore.user.uid)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
                const data = userDoc.data().gamification as any
                if (data) {
                    xp.value = data.xp || 0
                    level.value = data.level || 1
                    coins.value = data.coins || 0
                    unlockedBadgeIds.value = data.badges || []
                    unlockedItemIds.value = data.unlockedItems || ['theme_ocean']
                } else {
                    await initGamification(userDocRef)
                }
            }
        } catch (error) {
            console.error('Error loading gamification data:', error)
        }
    }

    const initGamification = async (docRef: any) => {
        const initialState = {
            xp: 0,
            level: 1,
            coins: 0,
            badges: [],
            unlockedItems: ['theme_ocean']
        }
        await setDoc(docRef, { gamification: initialState }, { merge: true })
        xp.value = 0
        level.value = 1
        coins.value = 0
        unlockedBadgeIds.value = []
        unlockedItemIds.value = ['theme_ocean']
    }

    const saveGamificationData = async () => {
        if (!authStore.user) return
        try {
            await updateDoc(doc(db, 'users', authStore.user.uid), {
                gamification: {
                    xp: xp.value,
                    level: level.value,
                    coins: coins.value,
                    badges: unlockedBadgeIds.value,
                    unlockedItems: unlockedItemIds.value
                }
            })
        } catch (error) {
            console.error('Error saving gamification data:', error)
        }
    }

    const awardXP = async (amount: number) => {
        xp.value += amount
        coins.value += amount

        // Check Level Up
        let leveledUp = false
        while (xp.value >= xpToNextLevel.value) {
            xp.value -= xpToNextLevel.value
            level.value++
            leveledUp = true
        }

        if (leveledUp) {
            if (level.value >= 5) {
                unlockBadge('level_5')
            }
        }

        await saveGamificationData()
    }

    const unlockBadge = async (badgeId: string) => {
        if (unlockedBadgeIds.value.includes(badgeId)) return

        if (AVAILABLE_BADGES[badgeId]) {
            unlockedBadgeIds.value.push(badgeId)
            recentUnlock.value = AVAILABLE_BADGES[badgeId]
            setTimeout(() => recentUnlock.value = null, 5000) // Clear after 5s
            await saveGamificationData()
        }
    }

    const purchaseItem = async (itemId: string) => {
        const item = SHOP_ITEMS.find(i => i.id === itemId)
        if (!item) return { success: false, message: 'Item not found' }
        if (unlockedItemIds.value.includes(itemId)) return { success: false, message: 'Already owned' }

        if (coins.value < item.cost) {
            return { success: false, message: `Need ${item.cost - coins.value} more points` }
        }

        coins.value -= item.cost
        unlockedItemIds.value.push(itemId)
        await saveGamificationData()

        return { success: true, message: `Purchased ${item.name}!` }
    }

    return {
        xp,
        level,
        coins,
        unlockedBadges,
        unlockedBadgeIds,
        unlockedItemIds,
        SHOP_ITEMS,
        xpToNextLevel,
        progressPercent,
        recentUnlock,
        loadGamificationData,
        awardXP,
        unlockBadge,
        purchaseItem,
        AVAILABLE_BADGES
    }
})
