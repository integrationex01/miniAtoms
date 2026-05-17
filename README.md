# miniAtoms

A Lovable-style AI Agent App Builder. Users describe app ideas in natural language, and the system generates structured application prototypes with live preview.

## Current Status

- [x] Project skeleton with Next.js App Router
- [x] Lovable-style homepage with gradient background
- [x] Clerk authentication (modal sign-in/sign-up)
- [x] Route protection via middleware
- [x] Homepage prompt → login → builder redirect flow
- [x] Builder page with agent steps & preview placeholders
- [x] Projects list & project detail placeholder pages
- [x] API route placeholders
- [x] **SiliconFlow API integration** (Step 4)
- [x] Agent step progress UI with status animation
- [x] Dynamic app preview rendering based on AppSpec
- [x] Fallback AppSpec when API is unavailable
- [x] Vercel-ready deployment

## Tech Stack

- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Icons**: lucide-react
- **AI**: SiliconFlow API (Chat Completions)
- **Database**: Neon PostgreSQL (next step)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in your Clerk keys and optionally SiliconFlow keys

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (required) |
| `CLERK_SECRET_KEY` | Clerk secret key (required) |
| `SILICONFLOW_API_KEY` | SiliconFlow API key (optional, fallback if missing) |
| `SILICONFLOW_BASE_URL` | SiliconFlow API base URL (default: `https://api.siliconflow.cn/v1`) |
| `SILICONFLOW_MODEL` | SiliconFlow model name (optional, e.g. `Qwen/Qwen3-8B`) |
| `DATABASE_URL` | Neon PostgreSQL connection string (next step) |

## How It Works

### `/api/generate`

1. Receives `POST { prompt: "..." }` from the Builder page
2. Calls SiliconFlow Chat Completions with a system prompt that requests structured JSON
3. Parses and normalizes the AI response into an `AppSpec`
4. Returns `{ appSpec, source: "siliconflow" }`
5. If anything fails (no API key, network error, bad response), returns a fallback AppSpec with `{ source: "fallback", warning: "..." }`

### Fallback Strategy

- Missing `SILICONFLOW_API_KEY` or `SILICONFLOW_MODEL` → fallback AppSpec
- SiliconFlow returns non-2xx → fallback AppSpec
- JSON parse failure → fallback AppSpec
- Network error or timeout (30s) → fallback AppSpec
- The page **never** goes blank

## Vercel Deployment

1. Push code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set all environment variables from `.env.example` in Vercel project settings
4. Deploy
5. In the Clerk dashboard, add your production domain to allowed origins

## Next Steps

- Connect Neon PostgreSQL for project persistence
- Save generated projects to database
- Project history list with real data
- Project detail page with stored AppSpec
- Continue iterating on saved projects
