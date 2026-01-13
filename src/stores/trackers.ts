import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'
import { db } from '../firebase'
import { useAuthStore } from './auth'
import { useGamificationStore } from './gamification'
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore'

export interface TrackerValue {
    date: string // YYYY-MM-DD
    value: number
}

export interface Tracker {
    id: string
    name: string
    unit: string
    data: TrackerValue[]
}

export const useTrackersStore = defineStore('trackers', () => {
    const trackers = ref<Tracker[]>([])
    let unsubscribe: (() => void) | null = null

    watchEffect(() => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (user) {
            const q = collection(db, `users/${user.uid}/trackers`)
            unsubscribe = onSnapshot(q, (snapshot) => {
                trackers.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Tracker[]
            })
        } else {
            if (unsubscribe) unsubscribe()
            trackers.value = []
        }
    })

    const addTracker = async (name: string, unit: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return

        await addDoc(collection(db, `users/${user.uid}/trackers`), {
            name,
            unit,
            data: []
        })
    }

    const removeTracker = async (id: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return
        await deleteDoc(doc(db, `users/${user.uid}/trackers`, id))
    }

    const addDataPoint = async (trackerId: string, value: number, date: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return

        const tracker = trackers.value.find(t => t.id === trackerId)
        if (tracker && tracker.data) {
            let newData = [...tracker.data]
            const existingIndex = newData.findIndex(d => d.date === date)

            if (existingIndex !== -1) {
                const currentData = newData[existingIndex] as TrackerValue
                newData[existingIndex] = { date: currentData.date, value }
            } else {
                newData.push({ date: date, value } as TrackerValue)
                newData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            }

            await updateDoc(doc(db, `users/${user.uid}/trackers`, trackerId), {
                data: newData
            })

            // Gamification Hook
            const gamificationStore = useGamificationStore()
            gamificationStore.awardXP(5)

            // Check total data points across all trackers
            const totalPoints = trackers.value.reduce((sum, t) => {
                const count = t.id === trackerId ? newData.length : t.data.length
                return sum + count
            }, 0)

            if (totalPoints >= 10) {
                gamificationStore.unlockBadge('tracker_pro')
            }
        }
    }

    return {
        trackers,
        addTracker,
        removeTracker,
        addDataPoint
    }
})
