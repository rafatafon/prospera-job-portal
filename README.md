# Prospera Job Portal

Multi-company job portal for Honduras — companies post jobs, candidates browse and apply.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database & Auth:** Supabase (Postgres + Auth + RLS)
- **i18n:** next-intl (Spanish + English)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema migrations applied (see `docs/db.md`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Supabase URL and anon key in .env.local

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
prospera-job-portal/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── [locale]/           # Locale-prefixed routes (/es, /en)
│   │   │   ├── (public)/       # Public pages (jobs, companies)
│   │   │   ├── (dashboard)/    # Authenticated company dashboard
│   │   │   ├── login/          # Auth pages
│   │   │   └── auth/           # Auth callbacks (confirm, signout)
│   │   └── globals.css
│   ├── components/             # Shared components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # Header, Footer, Sidebar, TopBar
│   │   ├── auth/               # LoginForm
│   │   └── jobs/               # JobCard, JobForm, JobFilters, etc.
│   ├── i18n/                   # next-intl config (routing, navigation)
│   ├── lib/supabase/           # Supabase client factories (server, client, middleware)
│   ├── messages/               # Translation files (es.json, en.json)
│   └── types/                  # Generated Supabase types
├── docs/                       # Schema, RLS, and testing docs
├── proxy.ts                    # Next.js 16 proxy (auth + i18n middleware)
└── CLAUDE.md                   # AI assistant rules
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Routes

| Route | Description |
|-------|-------------|
| `/[locale]` | Landing page |
| `/[locale]/jobs` | Public job listing with search and filters |
| `/[locale]/jobs/[id]` | Job detail with apply button |
| `/[locale]/companies/[slug]` | Company profile with published jobs |
| `/[locale]/login` | Login / Sign up |
| `/[locale]/dashboard` | Company dashboard (protected) |
| `/[locale]/dashboard/jobs` | Manage company jobs |
| `/[locale]/dashboard/jobs/new` | Create new job |

## Database

Three main tables with Row Level Security:

- **profiles** — extends Supabase auth.users (role, company_id)
- **companies** — company profiles (name, slug, logo, website)
- **jobs** — job postings (title, description, location, type, status)

Roles: `user`, `company`, `admin`. See `docs/db.md` and `docs/rls.md` for details.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
