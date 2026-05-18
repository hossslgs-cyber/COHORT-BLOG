 Cohort Blog

 What it does

Cohort Blog is a simple full-stack blog application where users can create posts and view them in a list. Each post includes an author, content, and timestamp. Posts are stored in a Postgres database and persist across refreshes.

 Stack
- Next.js (App Router)
- Supabase (Postgres)
- Tailwind CSS

How to run locally

1. Clone the repository:
   git clone https://github.com/hossslgs-cyber/COHORT-BLOG.git

2. Navigate into the project:
   cd COHORT-BLOG

3. Install dependencies:
   npm install

4. Create a `.env.local` file in the root and add:
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

5. Run the development server:
   npm run dev

6. Open in browser:
   http://localhost:3000


AI mistake I fixed

The AI-generated code initially had incorrect environment variable handling, which caused Supabase to fail connecting. I fixed this by properly setting up `.env.local` and ensuring the variables were correctly accessed in the code.






 Environment Variables

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



