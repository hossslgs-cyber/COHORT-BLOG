# Cohort Blog

A private social blog platform for a cohort of up to 100 members.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Supabase)
- **Auth:** Auth.js v5 (GitHub OAuth)
- **Media:** UploadThing (S3-compatible storage)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values.

3. Run the Supabase migration (`supabase/migration.sql`) in your Supabase SQL editor.

4. Add whitelist emails to the `whitelist` table in Supabase.

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Auth.js encryption secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin ops) |
| `UPLOADTHING_SECRET` | UploadThing secret key |
| `UPLOADTHING_APP_ID` | UploadThing app ID |

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy
