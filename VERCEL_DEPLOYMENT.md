# Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **PostgreSQL Database** (accessible from internet)
   - Recommended: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
   - Get your `DATABASE_URL` connection string

2. **MongoDB Database**
   - Recommended: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your `MONGODB_URI` connection string

3. **Stripe Account**
   - Set up your products and prices at https://dashboard.stripe.com/products
   - Get your API keys from https://dashboard.stripe.com/apikeys

4. **Telegram Bot**
   - Create a bot via [@BotFather](https://t.me/BotFather)
   - Get your bot token

## Environment Variables

Configure these in your Vercel Project Settings → Environment Variables:

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price IDs (create in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_SEED_SPROUT_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SEED_SEEDLING_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SEED_SAPLING_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_FRUIT_CACAO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_FRUIT_GROVE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_FRUIT_FOREST_PRICE_ID=price_...
```

### Telegram
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_TELEGRAM_CHANNEL=chocosfera_community
```

### Application
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables
1. In Vercel project settings, go to "Environment Variables"
2. Add all variables listed above
3. Set them for "Production", "Preview", and "Development"

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-5 minutes)

### 5. Post-Deployment Configuration

#### Prisma Database
Run migrations on your production database:
```bash
npx prisma migrate deploy
```

#### Stripe Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events to listen for
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`
5. Redeploy or update environment variable

#### Telegram Webhook
After deployment, set your Telegram webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.vercel.app/api/telegram/webhook"}'
```

## Development vs Production

- **Development branch**: Uses `--turbopack` for faster local builds
  ```bash
  git checkout development
  npm run dev
  ```

- **Main branch**: Optimized for production deployment on Vercel
  ```bash
  git checkout main
  npm run build
  npm start
  ```

## Testing Production Build Locally

Before deploying, test the production build:
```bash
npm run build
npm start
```

Visit http://localhost:3000 to verify everything works.

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify `DATABASE_URL` and `MONGODB_URI` are accessible
- Review build logs in Vercel dashboard

### Prisma Errors
- Ensure `postinstall` script runs: `prisma generate`
- Check database connection string format
- Verify database is accessible from Vercel's region

### Timeout Errors
- Function execution limit: 10s (Free), 30s (Pro)
- Optimize database queries
- Consider Edge Runtime for faster responses

### Stripe Webhooks Not Working
- Verify webhook URL is correct
- Check webhook secret matches environment variable
- Review webhook logs in Stripe Dashboard

### Telegram Bot Not Responding
- Verify webhook is set correctly
- Check bot token is valid
- Review function logs in Vercel

## Monitoring

- **Vercel Analytics**: Monitor performance and errors
- **Vercel Logs**: View function execution logs
- **Stripe Dashboard**: Monitor payment events
- **Database Logs**: Check connection and query performance

## Cost Considerations

### Vercel
- Free tier: 100GB bandwidth, 6,000 build minutes/month
- Pro: $20/month for more resources and features

### Database
- Neon/Supabase: Free tier available
- MongoDB Atlas: Free tier (512MB)

### Stripe
- No monthly fees, pay per transaction
- 2.9% + $0.30 per successful charge

## Security Checklist

- [ ] All secrets are in environment variables (not hardcoded)
- [ ] `.env.local` is in `.gitignore`
- [ ] Stripe webhook signature verification enabled
- [ ] Telegram webhook secret configured
- [ ] Database uses SSL connections
- [ ] CORS configured properly for API routes

## Support

For issues:
- Vercel: https://vercel.com/support
- Next.js: https://github.com/vercel/next.js/discussions
- Prisma: https://github.com/prisma/prisma/discussions
