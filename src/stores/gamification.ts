import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
    badges: string[] // IDs of unlocked badges
}

export const useGamificationStore = defineStore('gamification', () => {
    const authStore = useAuthStore()

    // State
    const xp = ref(0)
    const level = ref(1)
    const unlockedBadgeIds = ref<string[]>([])
    const recentUnlock = ref<Badge | null>(null) // For toast/notification

    // Constants
    const XP_PER_LEVEL_BASE = 100
    const XP_MULTIPLIER = 1.5 // Each level needs 1.5x more XP than the last

    // Badge Definitions
    const AVAILABLE_BADGES: Record<string, Badge> = {
        'first_goal': {
            id: 'first_goal',
            name: 'Goal Getter',
            description: 'Completed your first goal!',
            icon: '🎯'
        },
        'writer_streak': {
            id: 'writer_streak',
            name: 'Dedicated Writer',
            description: 'Created 3 journal entries.',
            icon: '✍️'
        },
        'tracker_pro': {
            id: 'tracker_pro',
            name: 'Data Scientist',
            description: 'Added 10 data points to your trackers.',
            icon: '📊'
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
        // Simple formula: Level 1 needs 100, Level 2 needs 150, etc.
        return XP_PER_LEVEL_BASE * level.value
    })

    const progressPercent = computed(() => {
        return Math.min(100, (xp.value / xpToNextLevel.value) * 100)
    })

    // Actions
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
                    unlockedBadgeIds.value = data.badges || []
                } else {
                    // Initialize if missing
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
            badges: []
        }
        await setDoc(docRef, { gamification: initialState }, { merge: true })
        xp.value = 0
        level.value = 1
        unlockedBadgeIds.value = []
    }

    const saveGamificationData = async () => {
        if (!authStore.user) return
        try {
            await updateDoc(doc(db, 'users', authStore.user.uid), {
                gamification: {
                    xp: xp.value,
                    level: level.value,
                    badges: unlockedBadgeIds.value
                }
            })
        } catch (error) {
            console.error('Error saving gamification data:', error)
        }
    }

    const awardXP = async (amount: number) => {
        xp.value += amount

        // Check Level Up
        // While loop in case massive XP gain levels up multiple times
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
            // Could set a "LevelUp" flag for UI celebration
        }

        await saveGamificationData()
    }

    const unlockBadge = async (badgeId: string) => {
        if (unlockedBadgeIds.value.includes(badgeId)) return // Already unlocked

        if (AVAILABLE_BADGES[badgeId]) {
            unlockedBadgeIds.value.push(badgeId)
            recentUnlock.value = AVAILABLE_BADGES[badgeId]
            setTimeout(() => recentUnlock.value = null, 5000) // Clear after 5s
            await saveGamificationData()
        }
    }

    return {
        xp,
        level,
        unlockedBadges,
        unlockedBadgeIds,
        xpToNextLevel,
        progressPercent,
        recentUnlock,
        loadGamificationData,
        awardXP,
        unlockBadge,
        AVAILABLE_BADGES
    }
})
