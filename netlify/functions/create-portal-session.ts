import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { verifyAuthToken } from '../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia'
})

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

const db = getFirestore()

export const handler: Handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        }
    }

    try {
        // Verify authentication
        const authResult = await verifyAuthToken(event.headers.authorization)
        if (!authResult.success) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            }
        }

        const { customerId } = JSON.parse(event.body || '{}')

        if (!customerId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing customerId' })
            }
        }

        // Verify customerId ownership via Firestore lookup
        const userDoc = await db.collection('users').doc(authResult.userId!).get()
        if (!userDoc.exists) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Unauthorized' })
            }
        }

        const userData = userDoc.data()
        if (userData?.subscriptionCustomerId !== customerId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Unauthorized' })
            }
        }

        // Create Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.URL}/settings`
        })

        return {
            statusCode: 200,
            body: JSON.stringify({ url: portalSession.url })
        }
    } catch (error: unknown) {
        console.error('Error creating portal session:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create portal session' })
        }
    }
}
