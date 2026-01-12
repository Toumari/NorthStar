import { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia'
})

export const handler: Handler = async (event) => {
    const id = event.queryStringParameters?.id

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing id parameter' })
        }
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(id)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription, null, 2)
        }
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        }
    }
}
