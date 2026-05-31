# Fintrak

Personal finance dashboard — bank CSV import, transaction management, spending analytics by category.

## Code navigation (Serena MCP — MANDATORY)

**REQUIRED:** Always call `mcp__serena__initial_instructions` before starting any coding task.

**NEVER use Read, Grep, Glob, or Bash for code navigation.** Serena is the only allowed tool for locating and inspecting code. Violations waste tokens and ignore explicit project rules.

Use Serena for:
- `find_symbol` / `get_symbols_overview` — locate and inspect symbols instead of Glob + Read
- `find_referencing_symbols` — find usages instead of Grep
- `replace_symbol_body` / `insert_after_symbol` — targeted edits instead of full-file rewrites
- `search_for_pattern` — text search when semantic search isn't enough

Only fall back to Read/Grep/Glob/Bash when Serena physically cannot answer (e.g. config files, raw text, shell commands).

## Stack

- **Next.js 16.2.6** — App Router, Server Components, Route Handlers, Turbopack
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (style: `base-nova`, uses **Base UI** primitives — NOT Radix)
- **Supabase** — Auth + PostgreSQL
- **Prisma 7** — ORM, client generated at `src/generated/prisma`
- **TanStack Query v5** — server state / data fetching
- **Zustand** — client state (filters, UI)
- **React Hook Form + Zod v4** — forms and validation
- **Recharts** — charts
- **Papa Parse** — CSV parsing (client-side)
- **date-fns** — date utilities
- **lucide-react v1** — icons (no `dynamicIconImports` in v1 — use static imports)
- **@google/generative-ai** — Gemini API (wired up, key not set yet — categorization fallback)
- **xlsx** — Excel file parsing (import wizard)

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
    actions/         # Server Actions (auth.ts)
  components/
    ui/              # shadcn/ui components — CAN edit (Base UI SSR issues fixed here)
    layout/          # Sidebar, BottomNav, Header, nav-items.ts
    accounts/        # AccountDialog, AccountForm, AccountList
    categories/      # CategoryDialog, CategoryForm, CategoryList, CategoryIcon, IconPicker
    transactions/    # TransactionDialog, TransactionForm, TransactionList, TransactionFilters, TransactionPagination
    providers.tsx    # TanStack Query provider (added to root layout)
  lib/
    prisma.ts        # Prisma singleton + PrismaPg adapter (DATABASE_URL pooled)
    supabase/
      client.ts      # Browser client (Client Components)
      server.ts      # Server client (Server Components / Route Handlers)
    validations/     # Zod schemas per feature (auth, account, category, transaction)
  generated/
    prisma/          # Auto-generated Prisma client — never edit manually
  proxy.ts           # Auth redirect (Next.js 16 renamed middleware.ts → proxy.ts)
prisma/
  schema.prisma      # DB schema
prisma.config.ts     # Prisma 7 config — uses DIRECT_URL for migrations
```

## Key conventions

- Server Components by default — add `"use client"` only when needed
- Route Handlers in `src/app/api/` for all backend logic
- Zod schemas in `src/lib/validations/` co-located with their feature
- All DB queries go through Prisma — never raw SQL unless unavoidable
- Supabase Auth user ID = Prisma User.id (UUID, no auto-generate)
- **All code, UI text, comments, and docs must be in English**
- Git: single `main` branch, one commit per completed feature, conventional commits (`feat:`, `fix:`, `chore:`)

## Next.js 16 breaking changes

- `middleware.ts` → **`proxy.ts`** (deprecated, renamed). Export function as `proxy`, not `middleware`
- `params` and `searchParams` are **Promises** — must `await` them in pages and route handlers
- `PageProps<'/route'>` and `LayoutProps<'/route'>` are global helpers (no import needed)
- Route Handler context: `{ params }: { params: Promise<{ id: string }> }` then `await params`
- `ssr: false` with `next/dynamic` is **NOT allowed in Server Components** — must be in a Client Component

## Prisma 7

- **Requires a driver adapter** — `datasourceUrl` option removed
- Runtime: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`
- Install: `@prisma/adapter-pg` + `pg` + `@types/pg`
- Migrations use `prisma.config.ts` with `DIRECT_URL` (direct connection, bypasses pgBouncer)
- Runtime uses `DATABASE_URL` (pooled, pgBouncer port 6543)
- Generated client entry: `@/generated/prisma/client` (not `@/generated/prisma`)
- Enums importable from `@/generated/prisma/enums`

## Zod v4 syntax changes

```ts
// v4 uses `error` not `message`
z.string().min(2, { error: "At least 2 characters" })
z.email({ error: "Invalid email" })   // z.email() is a shorthand (not z.string().email())
z.enum(["A", "B", "C"])              // unchanged
```

## Base UI + SSR — CRITICAL KNOWN ISSUE

shadcn `base-nova` style uses **Base UI** for its primitive components. All Base UI ESM modules have `'use client'` directive. When Turbopack bundles for SSR, these resolve as `undefined`, causing:

> `Element type is invalid: expected a string but got: undefined`

**Fixes applied:**
1. `button.tsx` and `input.tsx` rewritten to use native `<button>` and `<input>` — no Base UI dependency
2. All Dialog components (`AccountDialog`, `CategoryDialog`, `TransactionDialog`) use `mounted` guard — Dialog tree only renders after `useEffect` fires (client-only)
3. All List components (`AccountList`, `CategoryList`, `TransactionList`) use `mounted` guard — return `null` during SSR
4. `TransactionFilters` uses `mounted` guard — it renders Base UI `Select` directly (filter bar), so it needs the guard too
5. `select.tsx` and `dialog.tsx` still use Base UI — protected by mounted guards on their consumers

**Pattern for any new component using Base UI:**
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null  // or render a skeleton
```

**Never use `ssr: false` with `next/dynamic` in a Server Component** — move it to a Client Component wrapper.

**Do NOT add `transpilePackages: ["@base-ui/react"]` to `next.config.ts`.** The `mounted` guards are the *complete* fix for the SSR crash — they stop Base UI from rendering server-side, full stop. Transpiling Base UI is redundant and was observed to break its `'use client'` namespace re-exports (`export * as Select from …`) in the **client** bundle: `SelectPrimitive`/`DialogPrimitive` resolve to `undefined`, so the same `Element type is invalid … got: undefined` error reappears the moment a `Select`/`Dialog` renders on the client (after `mounted` flips, or on dialog open). SSR looks clean (build passes, guards return `null`), which makes it deceptive. Keep `next.config.ts` free of `transpilePackages` for Base UI.

## lucide-react v1

- No `dynamicIconImports` export in v1 — use **static imports** only
- `ICON_MAP` pattern: import icons statically, map name → component
- See `src/components/categories/icon-picker.tsx` for reference

## shadcn base-nova specifics

- `Select` uses Base UI `Select.Root`, `Select.Trigger`, `Select.Popup` etc. (NOT Radix)
- `Dialog` uses Base UI `Dialog.Root`, `Dialog.Popup`, `Dialog.Backdrop` etc.
- No `asChild` prop — use `render` prop or controlled state with `cloneElement`
- `DialogTrigger` doesn't support `asChild` — use `React.cloneElement(trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>, { onClick: () => setOpen(true) })`
- `Select.onValueChange` returns `string | null` — handle null case

## Database

Prisma 7 splits config:
- `prisma.config.ts` → `DIRECT_URL` (used for migrations, bypasses pgBouncer)
- `src/lib/prisma.ts` → `DATABASE_URL` (pooled, used at runtime)

Main models: `User`, `Account`, `Transaction`, `Category`, `Budget`

DB is live in Supabase (project: `imjoiaftxviqnurazmdx`, region: eu-west-1).
Migration already applied — tables exist.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://imjoiaftxviqnurazmdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL          # pooled (pgBouncer port 6543) — runtime
DIRECT_URL            # direct (port 5432) — migrations only
GEMINI_API_KEY        # v2 feature, empty for now
```

## What's built (Phase 3 complete)

- **Auth**: `/login`, `/register`, logout — Supabase + Server Actions + React Hook Form
- **Proxy** (`src/proxy.ts`): auth redirects, `/` → `/dashboard` for authenticated users
- **App layout**: Sidebar (desktop), BottomNav (mobile), TanStack Query Providers
- **Accounts** (`/accounts`): full CRUD — list, create, edit, delete
- **Categories** (`/categories`): full CRUD — list, create, edit, delete, icon picker (20 icons), system categories (lock icon, read-only)
- **Transactions** (`/transactions`): full CRUD — list with filters (account, type, date range), create, edit, delete, color-coded amounts; **bulk checkbox select + bulk delete**; **server-side pagination** (50/page) with real total count
- **CSV Import** (`/import`): 3-step wizard — upload (CSV/XLSX), column mapping with live sample previews, preview + per-row category picker + bulk insert; Santander preset built-in; auto-categorization via keyword regex rules (Gemini fallback wired, key not set)

## API routes built

```
GET  /api/accounts               — list user accounts
POST /api/accounts               — create account
PATCH /api/accounts/[id]         — update account
DELETE /api/accounts/[id]        — delete account

GET  /api/categories             — list user + system categories
POST /api/categories             — create category
PATCH /api/categories/[id]       — update category
DELETE /api/categories/[id]      — delete category (user-owned only)

GET    /api/transactions           — list with filters + pagination (50/page)
POST   /api/transactions           — create transaction
PATCH  /api/transactions/[id]      — update transaction
DELETE /api/transactions/[id]      — delete single transaction
DELETE /api/transactions           — bulk delete (body: { ids: string[] })

POST   /api/categorize             — Gemini auto-categorize (stub, requires GEMINI_API_KEY)
```

## What's next

- **Phase 4**: Dashboard — summary cards (balance, income, expenses, net) + Recharts charts (spending by category, balance over time)
- **Phase 5**: Budgets + polish + PWA + tests

## Model and effort defaults

- **Model**: Sonnet 4.6 for all regular feature work
- Switch to **Opus 4.8** only for complex architectural decisions (e.g., designing a new phase's data pipeline or schema)
- **Effort**: `medium` by default — sufficient for feature implementation
- Use `high` for debugging tricky issues or running `/code-review` on a full phase
- Use `low` for quick fixes and small edits
- Never default to `high` for routine feature work — it burns tokens without proportional gain

## Phase completion checklist (MANDATORY)

When a phase is fully implemented, always run these steps in order before committing:

1. **`/verify`** — run the app and confirm the golden path works in the browser; spot-check existing features for regressions
2. **`/code-review`** at `medium` effort — review the phase diff for obvious bugs before committing
3. **`/security-review`** — only for phases that add file upload, bulk write, or auth changes (Phase 3 import API, any future auth work)
4. **Commit** — one conventional commit per phase: `feat: phase N <short description>`
5. **Push** — `git push` immediately after committing. Never leave commits local-only.
6. **Update CLAUDE.md** — move the phase from "What's next" to "What's built", update "What's next" for the next phase

Do not skip step 1–2 even if the feature looks complete. Always do step 5 after committing.

## CSV Import (Phase 3 notes)

- Papa Parse runs client-side — raw file never sent to server
- XLSX also supported via the `xlsx` package
- Santander preset built-in (`src/components/import/presets.ts`)
- `rawDescription` stores original bank text; `description` is user-editable
- Auto-categorization: `src/components/import/categorize.ts` — keyword regex rules run client-side first; Gemini pass is wired in `ImportWizard.tsx` but commented out (enable when `GEMINI_API_KEY` is set)
- `POST /api/categorize` — Gemini batch endpoint; accepts `{ rows, categories }`, returns `{ suggestions }`
- Category picker in StepPreview — each row shows a filtered `<select>` (BOTH + matching type); categoryId sent with bulk insert
- SelectValue in `select.tsx` accepts `children` prop to display custom text when Base UI's internal value display is insufficient
