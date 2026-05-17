# miniAtoms

A Lovable-style AI Agent App Builder. Users describe app ideas in natural language, and the system generates structured application prototypes with live, interactive preview.

## Current Status

- [x] Project skeleton with Next.js App Router
- [x] Lovable-style homepage with gradient background
- [x] Clerk authentication (modal sign-in/sign-up)
- [x] Route protection via middleware
- [x] Homepage prompt → login → builder redirect flow
- [x] SiliconFlow API integration
- [x] Agent step progress UI with status animation
- [x] Dynamic, interactive app preview (tabs, forms, records, stats)
- [x] Fallback AppSpec when API is unavailable
- [x] **Neon PostgreSQL integration** (Step 5)
- [x] Save projects to database
- [x] Project list page with real data
- [x] Project detail page with interactive preview
- [x] Delete projects
- [x] User data isolation (Clerk userId)
- [x] Auto table creation on first request
- [x] Vercel-ready deployment

## Tech Stack

- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Icons**: lucide-react
- **AI**: SiliconFlow API (Chat Completions)
- **Database**: Neon PostgreSQL (@neondatabase/serverless)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in required keys in .env.local:
#    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    - CLERK_SECRET_KEY
#    - DATABASE_URL (Neon connection string)
#    - SILICONFLOW_API_KEY + SILICONFLOW_MODEL (optional, fallback if missing)

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The database table is created automatically on first API request. No manual SQL needed.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `SILICONFLOW_API_KEY` | No | SiliconFlow API key (fallback if missing) |
| `SILICONFLOW_BASE_URL` | No | SiliconFlow API base URL (default: `https://api.siliconflow.cn/v1`) |
| `SILICONFLOW_MODEL` | No | SiliconFlow model name (e.g. `Qwen/Qwen3-8B`) |

## Database

Table `projects`:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  app_spec JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

- All queries are scoped by `user_id` (Clerk userId)
- Created automatically on first API call via `ensureProjectsTable()`

## How It Works

### `/api/generate`
Calls SiliconFlow to generate an AppSpec with interactive preview config. Falls back gracefully if unavailable.

### `/api/projects`
- `GET` — list current user's projects (newest first)
- `POST` — save a new project with title, prompt, and AppSpec

### `/api/projects/[id]`
- `GET` — get a single project (scoped to current user)
- `DELETE` — delete a project (scoped to current user)

## Vercel Deployment

1. Push code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set all environment variables in Vercel project settings:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   SILICONFLOW_API_KEY=
   SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
   SILICONFLOW_MODEL=
   DATABASE_URL=
   ```
4. `DATABASE_URL` must be the Neon connection string
5. Deploy
6. In the Clerk dashboard, add your production domain to allowed origins
7. First visit to `/projects` or first save will auto-create the database table

## Current Limitations

- Project update (PUT) is not yet implemented
- No version history for projects
- No continue-iteration on saved projects
