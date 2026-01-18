import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { verifyAuthToken } from '../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia'
})

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

        const { priceId, userId, userEmail } = JSON.parse(event.body || '{}')

        if (!priceId || !userId || !userEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            }
        }

        // Verify authenticated user matches requested userId
        if (authResult.userId !== userId) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Unauthorized' })
            }
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: priceId.includes('lifetime') ? 'payment' : 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            customer_email: userEmail,
            client_reference_id: userId,
            success_url: `${process.env.URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL}/subscription/cancel`,
            metadata: {
                userId: userId
            },
            subscription_data: {
                metadata: {
                    userId: userId
                }
            }
        })

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url })
        }
    } catch (error: unknown) {
        console.error('Error creating checkout session:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create checkout session' })
        }
    }
}
