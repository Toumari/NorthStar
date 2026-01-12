# How to Find Your Stripe Price IDs

## The Error You're Seeing:
```
No such price: 'prod_TmMMydJg5IjWLE'
```

This means you're using a **Product ID** instead of a **Price ID**.

## How to Get the Correct Price IDs:

### Step 1: Go to Stripe Products
1. Visit https://dashboard.stripe.com/test/products
2. You should see your 3 products (Monthly, Yearly, Lifetime)

### Step 2: Click on Each Product
1. Click on "PathMark Premium Monthly"
2. Scroll down to the **Pricing** section
3. You'll see a price listed (£1.99)
4. Click on the price
5. Look for **API ID** - this starts with `price_` (NOT `prod_`)
6. Copy this Price ID

### Step 3: Repeat for All Products
- Monthly: `price_...`
- Yearly: `price_...`
- Lifetime: `price_...`

### Step 4: Update Netlify Environment Variables
1. Go to Netlify → Site settings → Environment variables
2. Update these variables:
   - `VITE_STRIPE_PRICE_ID_MONTHLY` = price_xxx (the one you just copied)
   - `VITE_STRIPE_PRICE_ID_YEARLY` = price_xxx
   - `VITE_STRIPE_PRICE_ID_LIFETIME` = price_xxx

### Step 5: Redeploy
After updating the environment variables, trigger a new deploy:
- Netlify → Deploys → Trigger deploy → Deploy site

---

## Quick Visual Guide:

In Stripe Dashboard:
```
Products
  └─ PathMark Premium Monthly (prod_xxx) ← This is the PRODUCT ID (wrong)
      └─ Pricing
          └─ £1.99 / month
              └─ API ID: price_xxx ← This is the PRICE ID (correct!)
```

You need the **price_xxx**, not the **prod_xxx**!
