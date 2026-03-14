# Vercel Deployment Instructions

## Add DATABASE_URL Environment Variable

1. Go to https://vercel.com/dashboard
2. Select the `oursky-interview` project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://neondb_owner:npg_JeoGuahRf04E@ep-dry-dawn-an8nkped-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **Environments:** Production, Preview, Development (select all)
5. Click "Save"
6. Redeploy the app (Settings → Deployments → click "..." on latest → Redeploy)

## Alternative: Use Vercel CLI

```bash
# Login first
vercel login

# Add environment variable
vercel env add DATABASE_URL

# When prompted, paste the connection string:
postgresql://neondb_owner:npg_JeoGuahRf04E@ep-dry-dawn-an8nkped-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Select all environments (Production, Preview, Development)

# Redeploy
vercel --prod
```

## Verify Database Connection

After redeploying, the 500 errors should be gone and the database should work.

The app will:
- Store todos in PostgreSQL (Neon)
- Sync across devices
- Work offline with LocalStorage fallback
