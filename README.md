# miniAtoms

A Lovable-style AI Agent App Builder. Users describe app ideas in natural language, and the system generates structured application prototypes with live, interactive preview. Saved projects can be iteratively improved with AI.

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
- [x] Neon PostgreSQL integration
- [x] Save projects to database
- [x] Project list page with real data
- [x] Project detail page with interactive preview
- [x] Delete projects
- [x] User data isolation (Clerk userId)
- [x] Auto table creation on first request
- [x] **AI continue iteration** (Step 6)
- [x] `/api/iterate` for AI-powered project modification
- [x] `PUT /api/projects/[id]` for saving iterated changes
- [x] Quick action buttons for common modifications
- [x] Unsaved changes indicator + Save Changes
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

## How It Works

### `/api/generate`
Calls SiliconFlow to generate an initial AppSpec. Falls back gracefully if unavailable.

### `/api/iterate`
Calls SiliconFlow with the original prompt, current AppSpec, and a modification instruction. Returns an updated AppSpec. Falls back with visible changes if API is unavailable.

### `/api/projects`
- `GET` — list current user's projects (newest first)
- `POST` — save a new project

### `/api/projects/[id]`
- `GET` — get a single project (scoped to current user)
- `PUT` — update project title and AppSpec (scoped to current user)
- `DELETE` — delete a project (scoped to current user)

## Vercel Deployment

1. Push code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set all environment variables in Vercel project settings
4. `DATABASE_URL` must be the Neon connection string
5. Deploy
6. In the Clerk dashboard, add your production domain to allowed origins
7. First visit to `/projects` or first save will auto-create the database table

## Current Limitations

- No version history or rollback for iterations
- Each iteration overwrites the previous AppSpec
- No branching or comparison between versions
