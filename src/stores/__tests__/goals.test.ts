import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock dependencies
vi.mock('../auth', () => ({
    useAuthStore: vi.fn(() => ({
        user: { uid: 'test-user-id' }
    }))
}))

vi.mock('../gamification', () => ({
    useGamificationStore: vi.fn(() => ({
        awardXP: vi.fn(),
        unlockBadge: vi.fn()
    }))
}))

vi.mock('../../firebase', () => ({
    db: {}
}))

vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}))

const mockAddDoc = vi.fn()
const mockUpdateDoc = vi.fn()
const mockDeleteDoc = vi.fn()

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: (...args: unknown[]) => mockAddDoc(...args),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
    onSnapshot: vi.fn((_, callback) => {
        callback({ docs: [] })
        return vi.fn()
    }),
    query: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn()
}))

import { useGoalsStore, type Goal } from '../goals'

describe('Goals Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    describe('initialization', () => {
        it('should initialize with empty goals', () => {
            const store = useGoalsStore()
            expect(store.goals).toEqual([])
        })

        it('should have isLoading property', () => {
            const store = useGoalsStore()
            expect(typeof store.isLoading).toBe('boolean')
        })
    })

    describe('addGoal', () => {
        it('should call addDoc with correct data', async () => {
            const store = useGoalsStore()
            mockAddDoc.mockResolvedValue({ id: 'new-goal-id' })

            const goalData = {
                title: 'New Goal',
                description: 'Test description',
                category: 'Health',
                smart: {
                    specific: 'Be specific',
                    measurable: 'Measurable',
                    achievable: 'Achievable',
                    relevant: 'Relevant',
                    timeBound: 'Time bound'
                },
                dueDate: '2024-12-31'
            }

            await store.addGoal(goalData)

            expect(mockAddDoc).toHaveBeenCalled()
        })
    })

    describe('Goal type', () => {
        it('should have correct structure', () => {
            const goal: Goal = {
                id: '1',
                title: 'Test Goal',
                description: 'Test description',
                category: 'General',
                smart: {
                    specific: 'Specific',
                    measurable: 'Measurable',
                    achievable: 'Achievable',
                    relevant: 'Relevant',
                    timeBound: 'Time bound'
                },
                dueDate: '2024-12-31',
                completed: false,
                progress: 0,
                tasks: [],
                createdAt: Date.now()
            }

            expect(goal.id).toBe('1')
            expect(goal.title).toBe('Test Goal')
            expect(goal.smart.specific).toBe('Specific')
        })
    })
})
