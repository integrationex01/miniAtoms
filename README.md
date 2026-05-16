# miniAtoms

A Lovable-style AI Agent App Builder. Users describe app ideas in natural language, and the system generates structured application prototypes with live preview.

## Current Status (Step 2)

- [x] Project skeleton with Next.js App Router
- [x] Lovable-style homepage with gradient background
- [x] Clerk authentication (modal sign-in/sign-up)
- [x] Route protection via middleware
- [x] Homepage prompt → login → builder redirect flow
- [x] Builder page with agent steps & preview placeholders
- [x] Projects list & project detail placeholder pages
- [x] API route placeholders
- [x] Vercel-ready deployment

## Tech Stack

- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Icons**: lucide-react
- **Database**: Neon PostgreSQL (next step)
- **AI**: SiliconFlow API (next step)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in your Clerk keys

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `DATABASE_URL` | Neon PostgreSQL connection string (next step) |
| `SILICONFLOW_API_KEY` | SiliconFlow API key (next step) |
| `SILICONFLOW_BASE_URL` | SiliconFlow API base URL |
| `SILICONFLOW_MODEL` | SiliconFlow model name |

## Vercel Deployment

1. Push code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set all environment variables from `.env.example` in Vercel project settings
4. Deploy
5. In the Clerk dashboard, add your production domain to allowed origins

## Next Steps

- Integrate SiliconFlow API for AI-powered app generation
- Connect Neon PostgreSQL for project persistence
- Implement real agent step streaming
- Build app preview rendering (iframe sandbox)
- Project history, detail, and iteration
