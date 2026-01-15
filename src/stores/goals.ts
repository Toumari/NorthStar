import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'
import { db } from '../firebase'
import { useAuthStore } from './auth'
import { useGamificationStore } from './gamification'
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    query,
    where
} from 'firebase/firestore'
import confetti from 'canvas-confetti'

export interface Task {
    id: string
    title: string
    completed: boolean
    dueDate?: string
}

export interface Goal {
    id: string
    title: string
    description: string
    category: string
    smart: {
        specific: string
        measurable: string
        achievable: string
        relevant: string
        timeBound: string
    }
    dueDate: string
    completed: boolean
    progress: number
    tasks: Task[]
    createdAt: number
    relatedTrackerId?: string
}

export const useGoalsStore = defineStore('goals', () => {
    const goals = ref<Goal[]>([])
    const isLoading = ref(true)

    // Real-time listener management
    let unsubscribe: (() => void) | null = null

    // Watch for auth state changes to subscribe/unsubscribe
    watchEffect(() => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (user) {
            // Subscribe to user's goals
            const q = query(collection(db, `users/${user.uid}/goals`))
            unsubscribe = onSnapshot(q, (snapshot) => {
                goals.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Goal[]
                isLoading.value = false
            }, (error) => {
                console.error("Error fetching goals:", error)
                isLoading.value = false
            })
        } else {
            // Cleanup
            if (unsubscribe) unsubscribe()
            goals.value = []
        }
    })

    // Getters
    const activeGoals = computed(() => goals.value.filter(g => !g.completed))
    const completedGoals = computed(() => goals.value.filter(g => g.completed))

    const activeGoalsCount = computed(() => activeGoals.value.length)
    const todaysTasksCount = computed(() => {
        let count = 0
        const d = new Date()
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        activeGoals.value.forEach(goal => {
            goal.tasks.forEach(task => {
                if (!task.completed && task.dueDate && task.dueDate.startsWith(today)) {
                    count++
                }
            })
        })
        return count
    })

    const todaysTasks = computed(() => {
        const tasks: { task: Task, goalId: string, goalTitle: string, goalCategory: string }[] = []
        const d = new Date()
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        activeGoals.value.forEach(goal => {
            goal.tasks.forEach(task => {
                if (!task.completed && task.dueDate && task.dueDate.startsWith(today)) {
                    tasks.push({
                        task,
                        goalId: goal.id,
                        goalTitle: goal.title,
                        goalCategory: goal.category
                    })
                }
            })
        })
        return tasks
    })

    // Actions
    const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'completed' | 'tasks'>) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return null

        const newGoal = {
            ...goal,
            completed: false,
            progress: 0,
            tasks: [],
            createdAt: Date.now()
        }

        try {
            const docRef = await addDoc(collection(db, `users/${user.uid}/goals`), newGoal)
            return docRef.id
        } catch (error) {
            console.error("Error adding goal:", error)
            throw error
        }
    }

    const ensureInboxGoal = async () => {
        // Check for 'Inbox' or legacy 'General'
        const inbox = goals.value.find(g => (g.category === 'Inbox' && g.title === 'Inbox') || (g.category === 'General' && g.title === 'General'))
        if (inbox) return inbox.id

        // Create if not exists
        const id = await addGoal({
            title: 'Inbox',
            description: 'Capture everything here',
            category: 'Inbox',
            smart: {
                specific: '',
                measurable: '',
                achievable: '',
                relevant: '',
                timeBound: ''
            },
            dueDate: ''
        })
        return id
    }

    const removeGoal = async (id: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return
        await deleteDoc(doc(db, `users/${user.uid}/goals`, id))
    }

    const updateGoal = async (id: string, updates: Partial<Goal>) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return
        await updateDoc(doc(db, `users/${user.uid}/goals`, id), updates)
    }

    // Helper to calculate progress and update Firestore
    const updateGoalProgress = async (goalId: string, currentTasks: Task[]) => {
        let progress = 0
        let completed = false

        if (currentTasks.length > 0) {
            const completedCount = currentTasks.filter(t => t.completed).length
            progress = Math.round((completedCount / currentTasks.length) * 100)
            completed = progress === 100
        }

        const wasCompleted = goals.value.find(g => g.id === goalId)?.completed || false

        await updateGoal(goalId, {
            tasks: currentTasks,
            progress,
            completed
        })

        // Gamification Hook
        if (completed && !wasCompleted) {
            // Trigger Confetti!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })

            const gamificationStore = useGamificationStore()
            gamificationStore.awardXP(50)
            gamificationStore.unlockBadge('first_goal')

            // Check for Goal Master (5 goals)
            const completedCount = completedGoals.value.length
            if (completedCount >= 5) {
                gamificationStore.unlockBadge('goal_master')
            }
        }
    }

    const addTask = async (goalId: string, taskTitle: string, dueDate?: string) => {
        const goal = goals.value.find(g => g.id === goalId)
        if (!goal) return

        const newTasks = [...goal.tasks, {
            id: crypto.randomUUID(),
            title: taskTitle,
            completed: false,
            dueDate
        }]

        await updateGoalProgress(goalId, newTasks)
    }

    const toggleTask = async (goalId: string, taskId: string) => {
        const goal = goals.value.find(g => g.id === goalId)
        if (!goal) return

        const newTasks = goal.tasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        )

        await updateGoalProgress(goalId, newTasks)
    }

    const removeTask = async (goalId: string, taskId: string) => {
        const goal = goals.value.find(g => g.id === goalId)
        if (!goal) return

        const newTasks = goal.tasks.filter(t => t.id !== taskId)

        await updateGoalProgress(goalId, newTasks)
    }

    return {
        goals,
        activeGoals,
        completedGoals,
        activeGoalsCount,
        todaysTasksCount,
        todaysTasks, // [NEW]
        addGoal,
        ensureInboxGoal,
        removeGoal,
        updateGoal,
        addTask,
        removeTask,
        toggleTask,
        isLoading
    }
})
