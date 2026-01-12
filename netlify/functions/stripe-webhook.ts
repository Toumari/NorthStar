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

    const sig = event.headers['stripe-signature']

    if (!sig) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No signature' })
        }
    }

    try {
        // Verify webhook signature
        const stripeEvent = stripe.webhooks.constructEvent(
            event.body!,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

        // Handle different event types
        switch (stripeEvent.type) {
            case 'checkout.session.completed': {
                const session = stripeEvent.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId || session.client_reference_id

                if (userId) {
                    // Activate premium subscription
                    await db.collection('users').doc(userId).set({
                        subscriptionTier: 'premium',
                        subscriptionStatus: 'active',
                        subscriptionId: session.subscription || session.id,
                        subscriptionEndDate: null // For lifetime, no end date
                    }, { merge: true })

                    console.log(`Activated premium for user: ${userId}`)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = stripeEvent.data.object as Stripe.Subscription
                const userId = subscription.metadata?.userId

                if (userId) {
                    await db.collection('users').doc(userId).set({
                        subscriptionStatus: subscription.status === 'active' ? 'active' : 'canceled',
                        subscriptionEndDate: subscription.cancel_at ? subscription.cancel_at * 1000 : null
                    }, { merge: true })

                    console.log(`Updated subscription for user: ${userId}`)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = stripeEvent.data.object as Stripe.Subscription
                const userId = subscription.metadata?.userId

                if (userId) {
                    // Downgrade to free
                    await db.collection('users').doc(userId).set({
                        subscriptionTier: 'free',
                        subscriptionStatus: 'expired',
                        subscriptionId: null,
                        subscriptionEndDate: null
                    }, { merge: true })

                    console.log(`Downgraded user to free: ${userId}`)
                }
                break
            }

            case 'invoice.payment_failed': {
                const invoice = stripeEvent.data.object as Stripe.Invoice
                console.log(`Payment failed for invoice: ${invoice.id}`)
                // Could send email notification here
                break
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        }
    } catch (error: any) {
        console.error('Webhook error:', error.message)
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        }
    }
}
