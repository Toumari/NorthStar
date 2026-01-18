import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSubscriptionStore } from '../subscription'

// Mock auth store
vi.mock('../auth', () => ({
    useAuthStore: vi.fn(() => ({
        user: { uid: 'test-user-id' }
    }))
}))

// Mock firebase
vi.mock('../../firebase', () => ({
    db: {}
}))

// Mock firestore functions
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
    setDoc: vi.fn(() => Promise.resolve()),
    updateDoc: vi.fn(() => Promise.resolve())
}))

describe('Subscription Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('isPremium', () => {
        it('should return false for free tier', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            expect(store.isPremium).toBe(false)
        })

        it('should return true for active premium tier', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'premium', status: 'active' }

            expect(store.isPremium).toBe(true)
        })

        it('should return true for canceled premium with future end date', () => {
            const store = useSubscriptionStore()
            const futureDate = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days from now
            store.subscriptionData = {
                tier: 'premium',
                status: 'canceled',
                subscriptionEndDate: futureDate
            }

            expect(store.isPremium).toBe(true)
        })

        it('should return false for canceled premium with past end date', () => {
            const store = useSubscriptionStore()
            const pastDate = Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
            store.subscriptionData = {
                tier: 'premium',
                status: 'canceled',
                subscriptionEndDate: pastDate
            }

            expect(store.isPremium).toBe(false)
        })
    })

    describe('canCreateGoal', () => {
        it('should allow unlimited goals for premium users', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'premium', status: 'active' }

            expect(store.canCreateGoal(0)).toBe(true)
            expect(store.canCreateGoal(10)).toBe(true)
            expect(store.canCreateGoal(100)).toBe(true)
        })

        it('should limit free users to 3 goals', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            expect(store.canCreateGoal(0)).toBe(true)
            expect(store.canCreateGoal(1)).toBe(true)
            expect(store.canCreateGoal(2)).toBe(true)
            expect(store.canCreateGoal(3)).toBe(false)
            expect(store.canCreateGoal(4)).toBe(false)
        })
    })

    describe('canCreateTracker', () => {
        it('should allow unlimited trackers for premium users', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'premium', status: 'active' }

            expect(store.canCreateTracker(0)).toBe(true)
            expect(store.canCreateTracker(10)).toBe(true)
        })

        it('should limit free users to 2 trackers', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            expect(store.canCreateTracker(0)).toBe(true)
            expect(store.canCreateTracker(1)).toBe(true)
            expect(store.canCreateTracker(2)).toBe(false)
            expect(store.canCreateTracker(3)).toBe(false)
        })
    })

    describe('canEditJournalEntry', () => {
        it('should allow premium users to edit any entry', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'premium', status: 'active' }

            const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) // 1 year ago
            expect(store.canEditJournalEntry(oldDate)).toBe(true)
        })

        it('should allow free users to edit entries within 14 days', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            const recentDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
            expect(store.canEditJournalEntry(recentDate)).toBe(true)
        })

        it('should prevent free users from editing entries older than 14 days', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20) // 20 days ago
            expect(store.canEditJournalEntry(oldDate)).toBe(false)
        })
    })

    describe('getRemainingGoals', () => {
        it('should return Infinity for premium users', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'premium', status: 'active' }

            expect(store.getRemainingGoals(0)).toBe(Infinity)
            expect(store.getRemainingGoals(10)).toBe(Infinity)
        })

        it('should return correct remaining count for free users', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            expect(store.getRemainingGoals(0)).toBe(3)
            expect(store.getRemainingGoals(1)).toBe(2)
            expect(store.getRemainingGoals(2)).toBe(1)
            expect(store.getRemainingGoals(3)).toBe(0)
            expect(store.getRemainingGoals(4)).toBe(0)
        })
    })

    describe('getRemainingTrackers', () => {
        it('should return Infinity for premium users', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'premium', status: 'active' }

            expect(store.getRemainingTrackers(0)).toBe(Infinity)
        })

        it('should return correct remaining count for free users', () => {
            const store = useSubscriptionStore()
            store.subscriptionData = { tier: 'free', status: 'none' }

            expect(store.getRemainingTrackers(0)).toBe(2)
            expect(store.getRemainingTrackers(1)).toBe(1)
            expect(store.getRemainingTrackers(2)).toBe(0)
        })
    })
})
