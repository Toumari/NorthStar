import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    type User
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isAuthenticated = ref(false)
    const isAuthReady = ref(false)

    const initAuth = () => {
        return new Promise<void>((resolve) => {
            onAuthStateChanged(auth, (currentUser) => {
                user.value = currentUser
                isAuthenticated.value = !!currentUser
                isAuthReady.value = true
                resolve()
            })
        })
    }

    const register = async (email: string, pass: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass)
        await updateProfile(userCredential.user, { displayName: name })
        await userCredential.user.reload()
        if (auth.currentUser) {
            // Force reactivity by re-assigning user. 
            // Since user is a ref, this triggers dependent components.
            user.value = { ...auth.currentUser } as User
        }
    }

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass)
    }

    const logout = async () => {
        await signOut(auth)
        user.value = null
        isAuthenticated.value = false
    }

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email)
    }

    return {
        user,
        isAuthenticated,
        isAuthReady,
        initAuth,
        register,
        login,
        logout,
        resetPassword
    }
})
