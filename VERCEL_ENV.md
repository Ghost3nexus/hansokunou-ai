# Vercel Deployment Environment Variables

The following environment variables must be configured in your Vercel project settings for proper deployment:

## Authentication

```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-string-for-jwt-encryption

# SMTP Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@your-domain.com
```

## Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Stripe

```
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID=your-stripe-standard-price-id
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=your-stripe-premium-price-id
```

## Important Notes

1. Ensure your Vercel domain is correctly set in `NEXTAUTH_URL`
2. Configure a Stripe webhook endpoint in your Stripe dashboard pointing to `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
3. For local development, create a `.env.local` file with these variables
