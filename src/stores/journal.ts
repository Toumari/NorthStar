import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'
import { db } from '../firebase'
import { useAuthStore } from './auth'
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore'

export interface JournalEntry {
    id: string
    content: string
    date: string
    createdAt: number
}

export const useJournalStore = defineStore('journal', () => {
    const entries = ref<JournalEntry[]>([])
    let unsubscribe: (() => void) | null = null

    watchEffect(() => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (user) {
            const q = query(
                collection(db, `users/${user.uid}/journal`),
                orderBy('date', 'desc')
            )

            unsubscribe = onSnapshot(q, (snapshot) => {
                entries.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as JournalEntry[]
            })
        } else {
            if (unsubscribe) unsubscribe()
            entries.value = []
        }
    })

    const addEntry = async (content: string, date: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return

        await addDoc(collection(db, `users/${user.uid}/journal`), {
            content,
            date,
            createdAt: Date.now()
        })
    }

    const deleteEntry = async (id: string) => {
        const authStore = useAuthStore()
        const user = authStore.user
        if (!user) return
        await deleteDoc(doc(db, `users/${user.uid}/journal`, id))
    }

    return {
        entries,
        addEntry,
        deleteEntry
    }
})
