# CLAUDE.md — Prospera Job Portal (Claude Code Rules)

This repo is a **multi-company job portal**:
- Public users browse/search/filter jobs from all companies.
- Companies log in to create/manage their own job posts.
- Admins moderate companies/jobs and manage taxonomy.

**Design reference (visual context):**
- https://www.prospera.co/es (also https://www.prospera.co/en)

---

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Vercel

---

## Repo Map (project structure)
> This project uses a `src/` layout. The `public/` folder must stay at the repo root.

prospera-job-portal/
├─ public/                      # static assets (must stay at repo root)
├─ src/
│  ├─ app/                      # Next.js App Router (routes)
│  │  ├─ (public)/              # org-only group (not in URL)
│  │  │  ├─ page.tsx            # /
│  │  │  ├─ jobs/
│  │  │  │  ├─ page.tsx         # /jobs
│  │  │  │  └─ [id]/page.tsx    # /jobs/:id
│  │  │  └─ companies/
│  │  │     └─ [slug]/page.tsx  # /companies/:slug
│  │  ├─ (dashboard)/
│  │  │  └─ dashboard/
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx         # /dashboard
│  │  │     └─ jobs/
│  │  │        ├─ page.tsx      # /dashboard/jobs
│  │  │        └─ new/page.tsx  # /dashboard/jobs/new
│  │  ├─ (admin)/
│  │  │  └─ admin/
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx         # /admin
│  │  │     ├─ companies/page.tsx
│  │  │     └─ jobs/page.tsx
│  │  ├─ layout.tsx             # root layout
│  │  └─ globals.css
│  ├─ components/               # shared components (ui/, jobs/, dashboard/, admin/)
│  ├─ lib/                      # helpers (supabase/, auth/, utils/)
│  └─ types/                    # shared TS types (and/or generated DB types)
├─ docs/                        # deeper docs (ui.md, db.md, rls.md, testing.md)
├─ next.config.ts
├─ tsconfig.json
├─ package.json
└─ README.md

Repo structure rules:
- Routes live in `src/app/` (App Router).
- `public/` must remain at the repo root (do not move into `src/`).
- If `app/` exists at repo root, `src/app` is ignored—keep routing only in `src/app/`.

(These match Next.js conventions for `src/` projects, including the `public/` rule and the “root app overrides src/app” rule.) :contentReference[oaicite:2]{index=2}

---

## Commands (use package.json scripts; do not guess)
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Tests/typecheck: use scripts defined in `package.json` (if present)

---

## Always do first (every task)
1) Restate the request in 2–5 bullets (goal, constraints, definition of done).
2) Propose a small plan (2–6 steps) and list expected files to touch.
3) Implement in small, reviewable diffs (avoid wide refactors unless requested).
4) Verify via repo scripts (lint/typecheck/tests; Playwright for key flows).
5) Summarize what changed + how it was verified + follow-ups.

---

## Subagents (recommended for this repo)
Use specialized subagents to avoid context bloat and reduce cross-file mistakes. Create/manage them via `/agents` and store project agents under `.claude/agents/`. :contentReference[oaicite:3]{index=3}

Delegation guide:
- **frontend-developer** → UI/layout/components/Tailwind work.
- **backend-engineer** → Next.js server work (route handlers, server actions, validation, API/data-flow).
- **supabase-rls-engineer** → DB schema, migrations, indexes, and especially RLS/multi-tenancy enforcement.
- **qa-playwright** → E2E browser verification for critical flows.
- **deployment-engineer** → Vercel deployment, env vars, preview/prod workflows.
- **test-specialist** → unit/integration tests (non-Playwright).

---

## Skills / Plugins (invoke when relevant)
> You can invoke a skill directly with `/skill-name`. Claude may also load skills automatically when relevant.

### Frontend / UI
- Before writing any frontend/UI code: invoke `/frontend-design`.

### Supabase (DB/Auth/RLS)
- Use for schema/migrations/indexes and RLS policies (multi-tenancy).

### Playwright (browser verification / E2E)
- Use for real-browser verification and end-to-end flows.

Scope rule:
- Don’t invoke UI tools for backend-only work.
- Don’t run Playwright for non-UI tasks.

---

## Hard security rules (non-negotiable)
- Never open/print/paste secrets: `.env*`, API keys, Supabase service role key, OAuth secrets, private keys (`*.pem`), `~/.ssh`, session tokens.
- Never log cookies/headers that contain auth tokens.
- Never ask for the Supabase **service role key**.
- If config is missing, use placeholders and document what should be set.

---

## Product guardrails (MVP)
- Manual job posting by authenticated companies (no scraping for MVP).
- Default apply method: external apply URL (internal ATS/applications can be V2).
- Job lifecycle: `draft → published → archived/expired`.
- Prefer vertical slices: “Create job → appears publicly” before adding advanced features.

---

## Progressive disclosure (keep CLAUDE.md short)
Detailed rules belong in:
- `docs/ui.md` — design system, tokens, accessibility checklist
- `docs/db.md` — schema, enums, indexes, migrations
- `docs/rls.md` — roles & RLS policies table-by-table
- `docs/testing.md` — testing strategy: unit/integration + Playwright E2E