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

// Helper to find user by any means necessary
const findUserForSubscription = async (subscription: Stripe.Subscription): Promise<string | null> => {
    // 1. Try metadata
    if (subscription.metadata?.userId) {
        return subscription.metadata.userId
    }

    const usersRef = db.collection('users')

    // 2. Try by subscription ID
    // subscription.id is always a string
    const subSnapshot = await usersRef.where('subscriptionId', '==', subscription.id).limit(1).get()
    if (!subSnapshot.empty) {
        console.log(`Found user ${subSnapshot.docs[0].id} by subscriptionId`)
        return subSnapshot.docs[0].id
    }

    // 3. Try by customer ID
    // subscription.customer can be string or object
    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
    if (customerId) {
        const custSnapshot = await usersRef.where('subscriptionCustomerId', '==', customerId).limit(1).get()
        if (!custSnapshot.empty) {
            console.log(`Found user ${custSnapshot.docs[0].id} by subscriptionCustomerId`)
            return custSnapshot.docs[0].id
        }
    }

    return null
}

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
                    // Check if this is a subscription or one-time payment
                    if (session.mode === 'subscription' && session.subscription) {
                        // For subscriptions, fetch the subscription object to get the end date
                        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

                        // Determine plan type from interval
                        const interval = subscription.items.data[0]?.price.recurring?.interval
                        const planType = interval === 'month' ? 'Monthly' : interval === 'year' ? 'Yearly' : 'Subscription'

                        // Extract customer ID safely
                        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

                        await db.collection('users').doc(userId).set({
                            subscriptionTier: 'premium',
                            subscriptionStatus: 'active',
                            subscriptionId: subscription.id,
                            subscriptionPlanType: planType,
                            subscriptionCustomerId: customerId,
                            subscriptionEndDate: subscription.current_period_end * 1000 // Convert to milliseconds
                        }, { merge: true })

                        console.log(`Activated premium ${planType} for user: ${userId}, ends: ${new Date(subscription.current_period_end * 1000)}`)
                    } else {
                        // One-time payment (lifetime)
                        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

                        await db.collection('users').doc(userId).set({
                            subscriptionTier: 'premium',
                            subscriptionStatus: 'active',
                            subscriptionId: session.id,
                            subscriptionPlanType: 'Lifetime',
                            subscriptionCustomerId: customerId,
                            subscriptionEndDate: null // Lifetime has no end date
                        }, { merge: true })

                        console.log(`Activated premium Lifetime for user: ${userId}`)
                    }
                }
                break
            }

            case 'customer.subscription.updated': {
                const eventSubscription = stripeEvent.data.object as Stripe.Subscription

                // Fetch fresh subscription data from Stripe to ensure we have the latest status
                // This is critical for catching cancel_at_period_end updates correctly
                const subscription = await stripe.subscriptions.retrieve(eventSubscription.id)

                const userId = await findUserForSubscription(subscription)

                if (userId) {
                    // Check if subscription is canceled (either immediately or at period end)
                    // We trust the fresh subscription object from Stripe
                    const isCanceled = subscription.cancel_at_period_end || subscription.status === 'canceled'
                    const status = isCanceled ? 'canceled' : subscription.status === 'active' ? 'active' : 'expired'

                    await db.collection('users').doc(userId).set({
                        subscriptionStatus: status,
                        subscriptionEndDate: subscription.current_period_end * 1000
                    }, { merge: true })

                    console.log(`Updated subscription for user: ${userId}, status: ${status}, cancel_at_period_end: ${subscription.cancel_at_period_end}`)
                } else {
                    console.error(`Could not find user for subscription ${subscription.id}`)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const eventSubscription = stripeEvent.data.object as Stripe.Subscription
                const userId = await findUserForSubscription(eventSubscription)

                if (userId) {
                    // Downgrade to free
                    await db.collection('users').doc(userId).set({
                        subscriptionTier: 'free',
                        subscriptionStatus: 'expired',
                        subscriptionId: null,
                        subscriptionEndDate: null
                    }, { merge: true })

                    console.log(`Downgraded user to free: ${userId}`)
                } else {
                    console.error(`Could not find user for deleted subscription ${eventSubscription.id}`)
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
