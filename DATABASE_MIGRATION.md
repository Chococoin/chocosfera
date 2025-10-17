# Database Migration Guide: Local to Cloud

## Current Setup (Local)
- **PostgreSQL**: `localhost:5432/chocosfera`
- **MongoDB**: `localhost:27017/chocosfera`

## Cloud Database Options

### Option 1: Neon (PostgreSQL) + MongoDB Atlas (Recommended)

#### PostgreSQL with Neon (FREE)
**Why Neon**: Serverless, free tier, optimized for Vercel, very fast cold starts

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up (free tier: 3 projects, 512 MB storage per project)

2. **Create Database**
   - Click "Create Project"
   - Name: `chocosfera`
   - Region: Choose closest to Vercel (recommend: US East - Ohio)
   - Click "Create"

3. **Get Connection String**
   - Copy the connection string shown
   - Format: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/chocosfera?sslmode=require`
   - **Save this as your `DATABASE_URL` for Vercel**

#### MongoDB with Atlas (FREE)
**Why Atlas**: Official MongoDB cloud, free tier, reliable

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up (free tier: 512 MB storage)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Provider: AWS
   - Region: Choose same as Neon (US-EAST-1 if available)
   - Name: `chocosfera-cluster`
   - Click "Create"

3. **Configure Access**
   - **Network Access**:
     - Click "Network Access" → "Add IP Address"
     - Click "Allow Access from Anywhere" (0.0.0.0/0)
     - This is needed for Vercel

   - **Database User**:
     - Click "Database Access" → "Add New Database User"
     - Username: `chocosfera`
     - Password: Generate a strong password (save it!)
     - Database User Privileges: "Read and write to any database"

4. **Get Connection String**
   - Click "Database" → "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `chocosfera`
   - Format: `mongodb+srv://chocosfera:password@chocosfera-cluster.xxx.mongodb.net/chocosfera?retryWrites=true&w=majority`
   - **Save this as your `MONGODB_URI` for Vercel**

### Option 2: Supabase (PostgreSQL) + MongoDB Atlas

#### PostgreSQL with Supabase (FREE)
**Why Supabase**: Includes auth, storage, realtime features if you need them later

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier: 500 MB database, 2 GB file storage)

2. **Create Project**
   - Click "New Project"
   - Name: `chocosfera`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to Vercel
   - Click "Create new project" (takes ~2 minutes)

3. **Get Connection String**
   - Go to "Project Settings" → "Database"
   - Find "Connection string" → "URI" tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password
   - Format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
   - **Save this as your `DATABASE_URL` for Vercel**

MongoDB setup is same as Option 1.

### Option 3: Railway (Both PostgreSQL + MongoDB)

**Why Railway**: Single platform for both databases, easy to use

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up (free tier: $5 credit/month)

2. **Create PostgreSQL**
   - Click "New Project" → "Provision PostgreSQL"
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"
   - **Save this as your `DATABASE_URL` for Vercel**

3. **Create MongoDB**
   - In same project, click "New" → "Database" → "Add MongoDB"
   - Go to "Connect" tab
   - Copy "Mongo Connection URL"
   - **Save this as your `MONGODB_URI` for Vercel**

## Migrating Your Data

### Step 1: Export Local Data

#### Export PostgreSQL
```bash
# Export schema and data
pg_dump -U chocos -d chocosfera -f chocosfera_backup.sql

# Or export only data (if schema will be created by Prisma)
pg_dump -U chocos -d chocosfera --data-only -f chocosfera_data.sql
```

#### Export MongoDB
```bash
# Export all collections
mongodump --db=chocosfera --out=./mongodb_backup

# Or specific collections
mongodump --db=chocosfera --collection=characters --out=./mongodb_backup
mongodump --db=chocosfera --collection=stories --out=./mongodb_backup
```

### Step 2: Prepare Cloud Databases

#### PostgreSQL (using Prisma)
```bash
# Set your cloud DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:password@cloud-host/chocosfera"

# Push schema to cloud database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

#### MongoDB
No schema needed - MongoDB is schemaless!

### Step 3: Import Data to Cloud

#### Import to PostgreSQL (Cloud)
```bash
# Using psql with your cloud connection
psql "postgresql://user:password@cloud-host/chocosfera" -f chocosfera_data.sql

# Or using Prisma Studio
npx prisma studio
# Manually add records through the UI
```

#### Import to MongoDB Atlas
```bash
# Get your MongoDB Atlas connection string
export MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/chocosfera"

# Restore all collections
mongorestore --uri="$MONGODB_URI" ./mongodb_backup/chocosfera

# Or specific collections
mongorestore --uri="$MONGODB_URI" --nsInclude=chocosfera.characters ./mongodb_backup/chocosfera/characters.bson
```

## Vercel Environment Variables

After setting up your cloud databases, configure these in Vercel:

### Required Database Variables
```bash
# PostgreSQL (from Neon/Supabase/Railway)
DATABASE_URL="postgresql://user:password@cloud-host/chocosfera?sslmode=require"

# MongoDB (from Atlas/Railway)
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/chocosfera"

# JWT (generate a new secure secret for production!)
JWT_SECRET="generate-a-new-random-secure-string-here"
JWT_EXPIRES_IN="7d"
SESSION_COOKIE_NAME="chocosfera_session"

# App URL (your Vercel domain)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Stripe (same values from .env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# All Stripe Price IDs (copy from .env.local)
NEXT_PUBLIC_STRIPE_SEED_SPROUT_PRICE_ID="price_seed_sprout"
NEXT_PUBLIC_STRIPE_SEED_SEEDLING_PRICE_ID="price_seed_seedling"
NEXT_PUBLIC_STRIPE_SEED_SAPLING_PRICE_ID="price_seed_sapling"
NEXT_PUBLIC_STRIPE_FRUIT_CACAO_PRICE_ID="price_fruit_cacao"
NEXT_PUBLIC_STRIPE_FRUIT_GROVE_PRICE_ID="price_fruit_grove"
NEXT_PUBLIC_STRIPE_FRUIT_FOREST_PRICE_ID="price_fruit_forest"
STRIPE_PRICE_IDS='{"seed-sprout":...}'  # Copy full JSON from .env.local

# MailerSend (if you use it)
MAILERSEND_API_KEY="your-mailersend-api-key"
MAILERSEND_FROM_EMAIL="noreply@chocosfera.com"
MAILERSEND_FROM_NAME="Chocósfera"

# Telegram (optional for now)
# TELEGRAM_BOT_TOKEN="your_bot_token"
# TELEGRAM_WEBHOOK_SECRET="your_webhook_secret"
# NEXT_PUBLIC_TELEGRAM_CHANNEL="chocosfera_community"
```

## Testing Cloud Connection Locally

Before deploying, test that you can connect to cloud databases:

1. **Create `.env.production` (don't commit this!)**
```bash
# Copy .env.local to .env.production
cp .env.local .env.production

# Edit .env.production with cloud database URLs
nano .env.production
```

2. **Test connection**
```bash
# Load production env
export $(cat .env.production | xargs)

# Test Prisma connection
npx prisma db pull

# Test MongoDB connection (in Node)
node -e "const { MongoClient } = require('mongodb'); MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB connected')).catch(err => console.error('❌', err))"
```

3. **Run local build with production DBs**
```bash
npm run build
npm start
```

## Important Notes

### Security
- ✅ Never commit `.env.local` or `.env.production` to git
- ✅ Use strong passwords for database users
- ✅ Generate a NEW `JWT_SECRET` for production (don't reuse local one)
- ✅ Enable SSL/TLS for database connections
- ✅ Restrict database access to only necessary IPs (but Vercel needs 0.0.0.0/0)

### Performance
- 🚀 Choose database regions close to Vercel deployment region
- 🚀 Use connection pooling (Prisma handles this automatically)
- 🚀 Monitor query performance in production
- 🚀 Consider Prisma Accelerate for better connection management

### Costs (Free Tiers)
- **Neon**: Free forever for small projects
- **MongoDB Atlas**: Free 512MB forever
- **Supabase**: Free 500MB, 2 projects
- **Railway**: $5 credit/month (may need to upgrade)

### Data Persistence
- ⚠️ Free tier databases are NOT deleted, but:
  - Neon: May scale to zero (instant wake up)
  - Atlas: Always on
  - Railway: Need to keep credit balance positive

## Troubleshooting

### Connection Timeout
- Check firewall rules (allow 0.0.0.0/0 for Vercel)
- Verify connection string format
- Try from your local machine first

### SSL Certificate Error
- Add `?sslmode=require` to PostgreSQL connection string
- MongoDB Atlas requires `ssl=true` by default

### Prisma Generate Fails
- Ensure `postinstall` script runs in Vercel
- Check build logs for errors
- Verify DATABASE_URL is set in Vercel

### MongoDB Authentication Failed
- Verify username/password are correct
- Check user has read/write permissions
- Ensure database name in connection string is correct

## Quick Start (Recommended Path)

1. ✅ Sign up for Neon (PostgreSQL) - 5 minutes
2. ✅ Sign up for MongoDB Atlas - 10 minutes
3. ✅ Export your local data (if you have important data)
4. ✅ Run `npx prisma db push` with cloud DATABASE_URL
5. ✅ Import MongoDB data to Atlas
6. ✅ Test locally with cloud databases
7. ✅ Add all environment variables to Vercel
8. ✅ Deploy!

Need help? Check the provider docs:
- Neon: https://neon.tech/docs/get-started-with-neon/signing-up
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/getting-started/
- Vercel: https://vercel.com/docs/concepts/projects/environment-variables
