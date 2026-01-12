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
                    // Check if this is a subscription or one-time payment
                    if (session.mode === 'subscription' && session.subscription) {
                        // For subscriptions, fetch the subscription object to get the end date
                        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

                        // Determine plan type from interval
                        const interval = subscription.items.data[0]?.price.recurring?.interval
                        const planType = interval === 'month' ? 'Monthly' : interval === 'year' ? 'Yearly' : 'Subscription'

                        await db.collection('users').doc(userId).set({
                            subscriptionTier: 'premium',
                            subscriptionStatus: 'active',
                            subscriptionId: subscription.id,
                            subscriptionPlanType: planType,
                            subscriptionCustomerId: subscription.customer as string,
                            subscriptionEndDate: subscription.current_period_end * 1000 // Convert to milliseconds
                        }, { merge: true })

                        console.log(`Activated premium ${planType} for user: ${userId}, ends: ${new Date(subscription.current_period_end * 1000)}`)
                    } else {
                        // One-time payment (lifetime)
                        await db.collection('users').doc(userId).set({
                            subscriptionTier: 'premium',
                            subscriptionStatus: 'active',
                            subscriptionId: session.id,
                            subscriptionPlanType: 'Lifetime',
                            subscriptionCustomerId: session.customer as string,
                            subscriptionEndDate: null // Lifetime has no end date
                        }, { merge: true })

                        console.log(`Activated premium Lifetime for user: ${userId}`)
                    }
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = stripeEvent.data.object as any
                let userId = subscription.metadata?.userId

                // If no userId in metadata, try to find user by subscriptionCustomerId
                if (!userId) {
                    console.log(`No userId in metadata for subscription ${subscription.id}, searching by customer ID ${subscription.customer}`)
                    const usersRef = db.collection('users')
                    const snapshot = await usersRef.where('subscriptionCustomerId', '==', subscription.customer).limit(1).get()

                    if (!snapshot.empty) {
                        userId = snapshot.docs[0].id
                        console.log(`Found user ${userId} by subscriptionCustomerId`)
                    }
                }

                if (userId) {
                    // Check if subscription is canceled (either immediately or at period end)
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
                const subscription = stripeEvent.data.object as Stripe.Subscription
                let userId = subscription.metadata?.userId

                // If no userId in metadata, try to find user by subscriptionCustomerId
                if (!userId) {
                    const usersRef = db.collection('users')
                    const snapshot = await usersRef.where('subscriptionCustomerId', '==', subscription.customer).limit(1).get()

                    if (!snapshot.empty) {
                        userId = snapshot.docs[0].id
                    }
                }

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
                    console.error(`Could not find user for deleted subscription ${subscription.id}`)
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
