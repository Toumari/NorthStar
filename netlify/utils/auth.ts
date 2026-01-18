import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    })
}

export interface AuthResult {
    success: boolean
    userId?: string
    error?: string
}

export async function verifyAuthToken(authHeader: string | undefined): Promise<AuthResult> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
        const decodedToken = await getAuth().verifyIdToken(token)
        return { success: true, userId: decodedToken.uid }
    } catch (error) {
        console.error('Token verification failed:', error)
        return { success: false, error: 'Invalid or expired token' }
    }
}
