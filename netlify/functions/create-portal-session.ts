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
        const { customerId } = JSON.parse(event.body || '{}')

        if (!customerId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing customerId' })
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
    } catch (error: any) {
        console.error('Error creating portal session:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        }
    }
}
