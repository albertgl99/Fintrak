# Fintrak

Personal finance dashboard — import bank CSVs, manage transactions, track spending by category.

## Features

- **Auth** — Sign up / sign in via Supabase
- **Accounts** — Multiple bank accounts with currency and color
- **Categories** — Custom categories with icons, colors, and type (income / expense / both)
- **Transactions** — Manual entry with filtering by account, type, and date range
- **CSV Import** — Import transactions from Spanish bank CSVs (Santander preset) *(in progress)*
- **Dashboard** — Spending overview with charts *(planned)*

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) |
| Auth + DB | Supabase (Auth + PostgreSQL) |
| ORM | Prisma 7 |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod v4 |
| Charts | Recharts |
| CSV parsing | Papa Parse |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=postgresql://...?pgbouncer=true   # pooled (port 6543)
DIRECT_URL=postgresql://...                     # direct (port 5432)
```

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── (auth)/          # /login, /register
│   ├── (app)/           # Protected routes with sidebar
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── import/
│   │   └── settings/
│   ├── api/             # Route Handlers
│   └── actions/         # Server Actions
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── layout/          # Sidebar, BottomNav
│   ├── accounts/
│   ├── categories/
│   └── transactions/
└── lib/
    ├── prisma.ts
    ├── supabase/
    └── validations/
```

## Database schema

`User` → `Account` → `Transaction` → `Category`
`User` → `Budget` → `Category`

Run `npx prisma studio` to browse the database.
