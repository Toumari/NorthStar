import { Handler } from '@netlify/functions'
import Stripe from 'stripe'

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
        const { priceId, userId, userEmail } = JSON.parse(event.body || '{}')

        if (!priceId || !userId || !userEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
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
            }
        })

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url })
        }
    } catch (error: any) {
        console.error('Error creating checkout session:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        }
    }
}
