import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock Firebase before importing the store
const mockSignInWithEmailAndPassword = vi.fn()
const mockCreateUserWithEmailAndPassword = vi.fn()
const mockSignOut = vi.fn()
const mockUpdateProfile = vi.fn()
const mockSendPasswordResetEmail = vi.fn()

vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
    createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUserWithEmailAndPassword(...args),
    signOut: (...args: unknown[]) => mockSignOut(...args),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
    sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
    updatePassword: vi.fn(),
    reauthenticateWithCredential: vi.fn(),
    EmailAuthProvider: { credential: vi.fn() },
    deleteUser: vi.fn()
}))

vi.mock('../../firebase', () => ({
    auth: {
        currentUser: null
    },
    db: {}
}))

vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
    setDoc: vi.fn(() => Promise.resolve()),
    updateDoc: vi.fn(() => Promise.resolve())
}))

import { useAuthStore } from '../auth'

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    describe('login', () => {
        it('should call signInWithEmailAndPassword with correct credentials', async () => {
            const store = useAuthStore()
            const mockUser = { uid: 'test-uid', email: 'test@example.com' }
            mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser })

            await store.login('test@example.com', 'password123')

            expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'test@example.com',
                'password123'
            )
        })

        it('should throw error for invalid credentials', async () => {
            const store = useAuthStore()
            mockSignInWithEmailAndPassword.mockRejectedValue({
                code: 'auth/invalid-credential',
                message: 'Invalid credentials'
            })

            await expect(store.login('test@example.com', 'wrongpassword'))
                .rejects.toMatchObject({ code: 'auth/invalid-credential' })
        })
    })

    describe('register', () => {
        it('should create user and update profile', async () => {
            const store = useAuthStore()
            const mockUser = {
                uid: 'new-uid',
                email: 'new@example.com',
                reload: vi.fn().mockResolvedValue(undefined)
            }
            mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })
            mockUpdateProfile.mockResolvedValue(undefined)

            await store.register('new@example.com', 'password123', 'John Doe')

            expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'new@example.com',
                'password123'
            )
            expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
                displayName: 'John Doe'
            })
        })

        it('should throw error for existing email', async () => {
            const store = useAuthStore()
            mockCreateUserWithEmailAndPassword.mockRejectedValue({
                code: 'auth/email-already-in-use',
                message: 'Email already in use'
            })

            await expect(store.register('existing@example.com', 'password123', 'John'))
                .rejects.toMatchObject({ code: 'auth/email-already-in-use' })
        })
    })

    describe('logout', () => {
        it('should call signOut', async () => {
            const store = useAuthStore()
            mockSignOut.mockResolvedValue(undefined)

            await store.logout()

            expect(mockSignOut).toHaveBeenCalled()
        })
    })

    describe('resetPassword', () => {
        it('should send password reset email', async () => {
            const store = useAuthStore()
            mockSendPasswordResetEmail.mockResolvedValue(undefined)

            await store.resetPassword('test@example.com')

            expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
                expect.anything(),
                'test@example.com'
            )
        })
    })

    describe('user state', () => {
        it('should initialize with null user', () => {
            const store = useAuthStore()
            expect(store.user).toBeNull()
        })

        it('should have isAuthenticated computed property', () => {
            const store = useAuthStore()
            expect(store.isAuthenticated).toBe(false)
        })
    })
})
