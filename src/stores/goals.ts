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

export type CreateGoalData = Omit<Goal, 'id' | 'createdAt' | 'progress' | 'completed' | 'tasks'>

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
    const systemGoal = computed(() => {
        return goals.value.find(g =>
            g.category === 'System Created' ||
            (g.category === 'Inbox' && g.title === 'Inbox') ||
            (g.category === 'General' && g.title === 'General')
        )
    })

    const activeGoals = computed(() => {
        // Exclude system goal from main list
        return goals.value.filter(g =>
            !g.completed &&
            g.category !== 'System Created' &&
            !(g.category === 'Inbox' && g.title === 'Inbox') &&
            !(g.category === 'General' && g.title === 'General')
        ).sort((a, b) => {
            // Helper to check if a goal is a "System/Inbox" goal
            const isSystem = (g: Goal) =>
                g.category === 'System Created' ||
                (g.category === 'Inbox' && g.title === 'Inbox') ||
                (g.category === 'General' && g.title === 'General')

            const aIsSystem = isSystem(a)
            const bIsSystem = isSystem(b)

            if (aIsSystem && !bIsSystem) return -1
            if (!aIsSystem && bIsSystem) return 1
            return 0 // Keep original order for others
        })
    })

    const completedGoals = computed(() => goals.value.filter(g => g.completed &&
        g.category !== 'System Created' &&
        !(g.category === 'Inbox' && g.title === 'Inbox') &&
        !(g.category === 'General' && g.title === 'General')
    ))

    const activeGoalsCount = computed(() => activeGoals.value.length)
    const todaysTasksCount = computed(() => {
        let count = 0
        const d = new Date()
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        // Check user goals
        activeGoals.value.forEach(goal => {
            goal.tasks.forEach(task => {
                if (!task.completed && task.dueDate && task.dueDate.startsWith(today)) {
                    count++
                }
            })
        })

        // Check system goal
        if (systemGoal.value) {
            systemGoal.value.tasks.forEach(task => {
                if (!task.completed && task.dueDate && task.dueDate.startsWith(today)) {
                    count++
                }
            })
        }
        return count
    })

    const todaysTasks = computed(() => {
        const tasks: { task: Task, goalId: string, goalTitle: string, goalCategory: string }[] = []
        const d = new Date()
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        // From user goals
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

        // From system goal
        if (systemGoal.value) {
            systemGoal.value.tasks.forEach(task => {
                if (!task.completed && task.dueDate && task.dueDate.startsWith(today)) {
                    tasks.push({
                        task,
                        goalId: systemGoal.value!.id,
                        goalTitle: 'Daily Scratchpad', // Nicer name for display
                        goalCategory: 'Daily'
                    })
                }
            })
        }
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
        // Check for 'System Created', 'Inbox' or legacy 'General'
        const inbox = goals.value.find(g =>
            g.category === 'System Created' ||
            (g.category === 'Inbox' && g.title === 'Inbox') ||
            (g.category === 'General' && g.title === 'General')
        )
        if (inbox) return inbox.id

        // Create if not exists
        const id = await addGoal({
            title: 'One Off Tasks', // Clearer purpose
            description: 'Capture everything here',
            category: 'System Created',
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


    const removeTask = async (goalId: string, taskId: string) => {
        const goal = goals.value.find(g => g.id === goalId)
        if (!goal) return

        const newTasks = goal.tasks.filter(t => t.id !== taskId)

        await updateGoalProgress(goalId, newTasks)
    }

    const toggleTask = async (goalId: string, taskId: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return

        const goal = goals.value.find(g => g.id === goalId)
        if (!goal) return

        const task = goal.tasks.find(t => t.id === taskId)
        if (!task) return

        const newCompleted = !task.completed
        const updatedTasks = goal.tasks.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t)

        // Calculate legacy progress just in case, though we primarily use task count now
        const totalTasks = updatedTasks.length
        const completedTasks = updatedTasks.filter(t => t.completed).length
        const newProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

        // Optimistic update
        goal.tasks = updatedTasks
        goal.progress = newProgress

        try {
            await updateDoc(doc(db, `users/${user.uid}/goals`, goalId), {
                tasks: updatedTasks,
                progress: newProgress
            })

            // Gamification for task completion
            if (newCompleted) {
                const gamificationStore = useGamificationStore()
                gamificationStore.awardXP(5)
                if (newProgress === 100) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    })
                }
            }
        } catch (error) {
            console.error("Error toggling task:", error)
        }
    }

    const checkDailyReset = async () => {
        // Runs on load to wipe old system tasks
        // We need to wait for systemGoal to be available. 
        // The watcher handles the timing, this function just needs to do the logic.
        if (!systemGoal.value) return

        const d = new Date()
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        // Keep ONLY tasks that are created/due for TODAY
        const tasksToKeep = systemGoal.value.tasks.filter(t => t.dueDate === today)

        // If we have tasks to remove (length mismatch)
        if (tasksToKeep.length !== systemGoal.value.tasks.length) {
            const authStore = useAuthStore()
            if (!authStore.user) return

            try {
                // Update firestore directly
                await updateDoc(doc(db, `users/${authStore.user.uid}/goals`, systemGoal.value.id), {
                    tasks: tasksToKeep,
                    progress: tasksToKeep.length === 0 ? 0 : Math.round((tasksToKeep.filter(t => t.completed).length / tasksToKeep.length) * 100)
                })
                console.log("Daily Scratchpad reset: Old tasks wiped.")
            } catch (e) {
                console.error("Failed to reset scratchpad", e)
            }
        }
    }

    // Watch for system goal availability to run cleanup
    watchEffect(() => {
        if (!isLoading.value && systemGoal.value) {
            checkDailyReset()
        }
    })

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
