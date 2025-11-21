# DevPilot Deployment Guide

This guide will walk you through deploying DevPilot to production.

## 🚀 Vercel Deployment

### 1. Prepare Your Repository

1. Push your code to GitHub
2. Ensure all environment variables are documented in `.env.example`
3. Verify the build works locally: `npm run build`

### 2. Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=https://dev-pilot-topaz.vercel.app
```

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be available at `https://your-project.vercel.app`

## 🗄️ Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details and region
5. Set a strong database password

### 2. Run Database Schema

1. Go to SQL Editor in Supabase
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the schema

### 3. Configure Authentication

1. Go to Authentication > Settings
2. Enable email authentication
3. Set "Site URL" to: `https://dev-pilot-topaz.vercel.app`
4. Add to "Redirect URLs":
   - `https://dev-pilot-topaz.vercel.app/auth/callback`
   - `https://dev-pilot-topaz.vercel.app/**`

### 4. Create Storage Bucket

1. Go to Storage
2. Create a new bucket called `invoices`
3. Set it to public
4. Configure CORS if needed

## 💳 Stripe Setup

### 1. Create Stripe Account

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account verification
3. Get your API keys from Developers > API keys

### 2. Configure Webhooks

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Set URL to: `https://dev-pilot-topaz.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret

### 3. Test Payments

1. Use Stripe test mode for development
2. Test with Stripe test cards
3. Switch to live mode for production

## 🤖 OpenRouter Setup

### 1. Get API Key

1. Go to [OpenRouter](https://openrouter.ai)
2. Create an account or sign in
3. Go to Keys
4. Create a new API key
5. Copy the key (you won't see it again)

### 2. Set Usage Limits

1. Go to Settings > Usage limits
2. Set appropriate limits for your usage
3. Add payment method if needed

## 🔧 Post-Deployment

### 1. Seed Production Data

```bash
# Set production environment variables
export NEXT_PUBLIC_SUPABASE_URL=your_prod_url
export SUPABASE_SERVICE_ROLE_KEY=your_prod_key

# Run seed script
npm run seed
```

### 2. Test All Features

- [ ] User registration and login
- [ ] Create clients and projects
- [ ] Use AI project planner
- [ ] Create and manage tasks
- [ ] Generate invoices and PDFs
- [ ] Test Stripe payments
- [ ] Update company settings

### 3. Monitor Performance

1. Check Vercel Analytics
2. Monitor Supabase usage
3. Watch Stripe webhook logs
4. Set up error tracking (Sentry, etc.)

## 🔒 Security Checklist

- [ ] All API keys are in environment variables
- [ ] RLS policies are enabled on all tables
- [ ] Stripe webhooks are properly configured
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Database backups are enabled

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure tables exist

3. **Stripe Webhook Issues**
   - Verify webhook URL is correct
   - Check webhook secret
   - Test with Stripe CLI

4. **PDF Generation Issues**
   - Check file permissions
   - Verify storage bucket exists
   - Test with sample data

### Getting Help

1. Check the logs in Vercel dashboard
2. Review Supabase logs
3. Check Stripe webhook logs
4. Open an issue in the repository

## 📈 Scaling

### Performance Optimization

1. Enable Vercel Edge Functions
2. Use Supabase Edge Functions for heavy operations
3. Implement caching strategies
4. Optimize database queries

### Monitoring

1. Set up Vercel Analytics
2. Monitor Supabase metrics
3. Track Stripe transaction volumes
4. Set up error alerting

---

Your DevPilot application should now be live and ready for production use! 🎉
