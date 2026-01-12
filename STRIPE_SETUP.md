# Stripe Setup Instructions

## 1. Create Stripe Account
1. Go to https://stripe.com and create an account
2. Complete business verification (can skip for test mode)

## 2. Get API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

## 3. Create Products & Prices
1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"

### Monthly Product
- Name: "PathMark Premium Monthly"
- Description: "Monthly subscription to PathMark Premium"
- Pricing: £1.99 GBP, Recurring monthly
- Copy the **Price ID** (starts with `price_`)

### Yearly Product
- Name: "PathMark Premium Yearly"
- Description: "Yearly subscription to PathMark Premium"
- Pricing: £15 GBP, Recurring yearly
- Copy the **Price ID**

### Lifetime Product
- Name: "PathMark Premium Lifetime"
- Description: "Lifetime access to PathMark Premium"
- Pricing: £25 GBP, One-time payment
- Copy the **Price ID**

## 4. Add to .env File
Create a `.env` file in the project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ID_MONTHLY=price_...
VITE_STRIPE_PRICE_ID_YEARLY=price_...
VITE_STRIPE_PRICE_ID_LIFETIME=price_...
```

## 5. Add to Netlify Environment Variables
When deploying, add these to Netlify:
1. Go to Site settings → Environment variables
2. Add:
   - `STRIPE_SECRET_KEY` = sk_test_...
   - `STRIPE_WEBHOOK_SECRET` = whsec_... (get after setting up webhook)
   - `FIREBASE_PROJECT_ID` = your-project-id
   - `FIREBASE_CLIENT_EMAIL` = firebase-adminsdk@...
   - `FIREBASE_PRIVATE_KEY` = -----BEGIN PRIVATE KEY-----...

## 6. Set Up Webhook
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://pathmark.co.uk/.netlify/functions/stripe-webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Netlify as `STRIPE_WEBHOOK_SECRET`

## 7. Test with Test Cards
Use these test cards in Stripe Checkout:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0027 6000 3184`

Use any future expiry date and any 3-digit CVC.

## 8. Switch to Live Mode
When ready for production:
1. Get live API keys from https://dashboard.stripe.com/apikeys
2. Create live products with same prices
3. Update environment variables with live keys
4. Set up live webhook endpoint
