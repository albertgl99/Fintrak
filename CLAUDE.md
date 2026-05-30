# Fintrak

Personal finance dashboard — bank CSV import, transaction management, spending analytics by category.

## Stack

- **Next.js 15** — App Router, Server Components, Route Handlers
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix, Slate theme)
- **Supabase** — Auth + PostgreSQL
- **Prisma 7** — ORM, client generated at `src/generated/prisma`
- **TanStack Query v5** — server state / data fetching
- **Zustand** — client state (filters, UI)
- **React Hook Form + Zod** — forms and validation
- **Recharts** — charts
- **Papa Parse** — CSV parsing (client-side)
- **date-fns** — date utilities

## Commands

```bash
npm run dev        # dev server (Turbopack)
npm run build      # production build
npm run lint       # ESLint
npx prisma migrate dev --name <name>   # new DB migration
npx prisma generate                    # regenerate Prisma client
npx prisma studio                      # DB GUI
```

## Project structure

```
src/
  app/
    (auth)/          # login, register — no sidebar
    (app)/           # protected routes — sidebar + bottomnav layout
      dashboard/
      transactions/
      accounts/
      categories/
      budgets/
      import/
      settings/
    api/             # Route Handlers
  components/
    ui/              # shadcn/ui components (auto-generated, don't edit)
    layout/          # Sidebar, BottomNav, Header
    dashboard/       # Dashboard-specific components
    transactions/
    categories/
    budgets/
    import/
  lib/
    prisma.ts        # Prisma singleton (uses DATABASE_URL pooled connection)
    supabase/
      client.ts      # Browser client (Client Components)
      server.ts      # Server client (Server Components / Route Handlers)
  generated/
    prisma/          # Auto-generated Prisma client — never edit manually
  middleware.ts      # Auth redirect + session refresh
prisma/
  schema.prisma      # DB schema
prisma.config.ts     # Prisma 7 config — uses DIRECT_URL for migrations
```

## Key conventions

- Server Components by default — add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Route Handlers in `src/app/api/` for all backend logic
- Zod schemas in `src/lib/validations/` co-located with their feature
- All DB queries go through Prisma — never raw SQL unless unavoidable
- Supabase Auth user ID = Prisma User.id (UUID, no auto-generate)

## Database

Prisma 7 splits config:
- `prisma.config.ts` → `DIRECT_URL` (used for migrations, bypasses pgBouncer)
- `src/lib/prisma.ts` → `DATABASE_URL` (pooled, used at runtime)

Main models: `User`, `Account`, `Transaction`, `Category`, `Budget`

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL          # pooled (pgBouncer port 6543) — runtime
DIRECT_URL            # direct (port 5432) — migrations only
GEMINI_API_KEY        # v2 feature, empty for now
```

## CSV Import

Supports Spanish bank CSV formats. Santander preset built-in.
Parser: Papa Parse (client-side — raw file never sent to server).
Categorization: regex rules first → Gemini fallback (v2).
`rawDescription` stores the original bank text; `description` is user-editable.
