import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    updatePassword,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    reauthenticateWithPopup,
    type User
} from 'firebase/auth'
import { collection, doc, deleteDoc, getDocs } from 'firebase/firestore'

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

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    const logout = async () => {
        await signOut(auth)
        user.value = null
        isAuthenticated.value = false
    }

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email)
    }

    const reauthenticate = async (password: string) => {
        if (!auth.currentUser || !auth.currentUser.email) throw new Error('No user to reauthenticate')

        const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
        await reauthenticateWithCredential(auth.currentUser, credential)
    }

    const reauthenticateWithGoogle = async () => {
        if (!auth.currentUser) throw new Error('No user to reauthenticate')
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(auth.currentUser, provider)
    }

    const updateDisplayName = async (name: string) => {
        if (!auth.currentUser) return
        await updateProfile(auth.currentUser, { displayName: name })
        if (auth.currentUser) {
            user.value = { ...auth.currentUser } as User
        }
    }

    const updateUserPassword = async (password: string) => {
        if (!auth.currentUser) return
        await updatePassword(auth.currentUser, password)
    }

    const deleteAccount = async () => {
        if (!auth.currentUser) return

        const userId = auth.currentUser.uid

        // Delete all user data from Firestore
        const collections = ['goals', 'journal', 'trackers']

        for (const collectionName of collections) {
            const userCollectionRef = collection(db, 'users', userId, collectionName)
            const snapshot = await getDocs(userCollectionRef)

            // Delete each document in the collection
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
            await Promise.all(deletePromises)
        }

        // Delete the Firebase Auth account
        await deleteUser(auth.currentUser)
        user.value = null
        isAuthenticated.value = false
    }

    return {
        user,
        isAuthenticated,
        isAuthReady,
        initAuth,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        reauthenticate,
        reauthenticateWithGoogle,
        updateDisplayName,
        updateUserPassword,
        deleteAccount
    }
})
