import { vi } from 'vitest'

// Mock Firebase
vi.mock('./src/firebase', () => ({
    auth: {
        currentUser: null,
        onAuthStateChanged: vi.fn((callback) => {
            callback(null)
            return vi.fn() // unsubscribe
        }),
        signInWithEmailAndPassword: vi.fn(),
        createUserWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        signInWithPopup: vi.fn()
    },
    db: {
        collection: vi.fn(),
        doc: vi.fn()
    }
}))

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn((_, callback) => {
        callback({ docs: [] })
        return vi.fn() // unsubscribe
    }),
    query: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn()
}))

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    updateProfile: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updatePassword: vi.fn(),
    reauthenticateWithCredential: vi.fn(),
    EmailAuthProvider: {
        credential: vi.fn()
    },
    deleteUser: vi.fn()
}))

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}))

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})
