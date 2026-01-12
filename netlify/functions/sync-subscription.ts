import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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
        const { userId } = JSON.parse(event.body || '{}')

        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing userId' })
            }
        }

        // Get user from Firestore
        const userDoc = await db.collection('users').doc(userId).get()
        if (!userDoc.exists) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' })
            }
        }

        const userData = userDoc.data()
        const subscriptionId = userData?.subscriptionId

        if (!subscriptionId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No subscription ID found for user' })
            }
        }

        // Fetch user's subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Determine correct status
        const isCanceled = subscription.cancel_at_period_end || subscription.status === 'canceled'
        const status = isCanceled ? 'canceled' : subscription.status === 'active' ? 'active' : 'expired'
        const endDate = subscription.current_period_end * 1000

        // Update Firestore
        await db.collection('users').doc(userId).set({
            subscriptionStatus: status,
            subscriptionEndDate: endDate
        }, { merge: true })

        console.log(`Synced subscription for user ${userId}: ${status}`)

        return {
            statusCode: 200,
            body: JSON.stringify({
                synced: true,
                status: status,
                endDate: endDate
            })
        }

    } catch (error: any) {
        console.error('Sync error:', error.message)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        }
    }
}
