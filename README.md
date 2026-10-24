# Chapter & Co. — eCommerce Bookstore

A complete, responsive eCommerce bookstore built as a capstone project demonstrating **Agentic AI-assisted development** with IBM Bob.

## Live stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers (REST) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Auth.js (NextAuth v5, Credentials) |
| State | Zustand (cart persistence) |
| Validation | Zod |
| Testing | Vitest, React Testing Library, Playwright |

---

## Getting started

### 1. Prerequisites
- Node.js ≥ 20
- PostgreSQL instance running locally (or via Docker)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
```

### 4. Set up the database
```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed 30 books, 10 categories, 15 authors + demo user
```

### 5. Start the dev server
```bash
npm run dev
# → http://localhost:3000
```

### Demo credentials
| Field | Value |
|-------|-------|
| Email | `demo@chapterandco.com` |
| Password | `Demo1234!` |

---

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:seed` | Re-seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## Application screens

### 01 — Homepage (`/`)
Hero banner · Featured books · Browse by category · Bestsellers · CTA

### 02 — Catalogue (`/catalogue`)
Grid listing · Category/sort filters (sidebar) · Search · Pagination

### 03 — Book detail (`/books/[slug]`)
Cover · Author · Categories · Description · Price · Delivery estimate · Related books · Add to cart

### 04 — Cart (`/cart`)
Item list · Quantity controls · Subtotal · Free delivery threshold · Proceed to checkout

### 05 — Checkout (`/checkout`) ⚠ Auth required
Address selection · Add address · Demo payment · Gift points redemption · Order summary

### 06 — Order confirmation (`/account/orders/[id]?confirmed=true`)
Confirmation banner · Items · Payment summary · Delivery address

### 07 — Order history (`/account/orders`)
All orders list with status badges

### 08 — Order detail (`/account/orders/[id]`)
Full order details · Buy again · Cancel within 48 hrs

### 09 — Account (`/account`)
Profile stats · Recent orders · Gift point balance

### 10 — Auth (`/auth/login`, `/auth/register`)
Sign in · Register with validation

---

## Architecture

```
src/
├── app/                   # Next.js App Router pages
│   ├── api/               # REST route handlers
│   │   ├── auth/          # Register + NextAuth
│   │   ├── addresses/     # CRUD addresses
│   │   ├── books/         # Book catalogue API
│   │   ├── checkout/      # Order placement
│   │   ├── orders/        # Order management + cancellation
│   │   ├── gift-points/   # Points balance
│   │   └── recommendations/
│   ├── account/           # Protected account pages
│   ├── auth/              # Login + Register
│   ├── books/[slug]/      # Book detail
│   ├── cart/              # Shopping cart
│   ├── catalogue/         # Book listing
│   ├── checkout/          # Checkout flow
│   └── search/            # Search page
├── components/
│   ├── books/             # BookCard, AddToCartButton
│   ├── catalogue/         # CatalogueFilters, PaginationControls
│   ├── layout/            # Header, Footer
│   └── ui/                # Button, Card, Input, Label, Badge, Toast, etc.
├── hooks/                 # use-toast
├── lib/                   # auth, prisma, utils, validations
├── middleware.ts           # Route protection
├── store/                 # Zustand cart store
└── tests/                 # Unit + E2E tests
prisma/
├── schema.prisma          # Data model
└── seed.ts                # 30 books, 10 categories, 15 authors
```

---

## Data model overview

```
User ──< Order ──< OrderItem >── Book ──< BookCategory >── Category
 │                                │
 ├──< Address                     └── Author
 ├──< CartItem
 └──< GiftPointsTransaction
Order ── Payment
```

See `prisma/schema.prisma` for the full schema with indexes and constraints.

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books` | — | List books with filters |
| GET | `/api/recommendations` | Optional | Personalized recommendations |
| GET | `/api/addresses` | ✓ | List user addresses |
| POST | `/api/addresses` | ✓ | Create address |
| GET | `/api/gift-points` | ✓ | Get gift points balance |
| POST | `/api/checkout` | ✓ | Place order |
| GET | `/api/orders` | ✓ | Order history |
| GET | `/api/orders/[id]` | ✓ | Order detail |
| PATCH | `/api/orders/[id]` | ✓ | Cancel order |
| POST | `/api/auth/register` | — | Register user |
| * | `/api/auth/[...nextauth]` | — | NextAuth handlers |

All protected endpoints return 401 if unauthenticated. Inputs are validated with Zod.

---

## Recommendations algorithm

A simple, explainable algorithm — no ML service required:

1. Fetch all categories and authors from the user's previous (non-cancelled) orders
2. Query books matching those categories or authors, excluding already-purchased books
3. Sort by bestseller status
4. Fall back to featured books for unauthenticated or new users

---

## Security notes

- No real payment processing. All card flows are clearly labeled **DEMO**.
- Passwords hashed with bcrypt (cost 12).
- Server-side pricing enforced on all orders — client prices are ignored.
- Cancellation eligibility checked server-side (48-hour window).
- No secrets hardcoded — all via environment variables.

---

## AI Development Log

### Prompt 1 — Architecture & scaffold
**Prompt:** "You are a Senior Full-Stack Engineer… Build Chapter & Co. … Begin with architecture proposal."
**Result:** IBM Bob proposed the App Router folder structure, data model, API contracts and 7-phase delivery plan.
**Human review:** Approved data model, confirmed PostgreSQL/Prisma, simplified recommendation algorithm.

### Prompt 2 — Design system & globals
**Prompt:** "Create a Tailwind config and global CSS with a premium editorial aesthetic using warm neutrals."
**Result:** `tailwind.config.ts`, `globals.css` with CSS custom properties and brand tokens.
**Refinement:** Adjusted colour values to match a warmer bookstore palette.

### Prompt 3 — Homepage & BookCard component
**Prompt:** "Build the homepage with hero, featured books, categories, bestsellers using server components."
**Result:** `app/page.tsx`, `BookCard.tsx`, `AddToCartButton.tsx`.
**Refinement:** Made hero responsive, ensured `Image` alt text for accessibility.

### Prompt 4 — Catalogue with filters
**Prompt:** "Build the catalogue page with server-side filtering, sorting, pagination."
**Result:** `catalogue/page.tsx`, `CatalogueFilters.tsx`, `PaginationControls.tsx`.

### Prompt 5 — Authentication
**Prompt:** "Implement login, register with Auth.js Credentials, bcrypt, Zod validation."
**Result:** `lib/auth.ts`, login/register pages, `/api/auth/register` route.

### Prompt 6 — Cart & Checkout
**Prompt:** "Implement cart with Zustand persistence, checkout with gift points and demo payment."
**Result:** `store/cart.ts`, cart and checkout pages, `/api/checkout` with server-side pricing.

### Prompt 7 — Orders & cancellation
**Prompt:** "Add order history, buy again, and server-enforced 48-hour cancellation."
**Result:** Order list/detail pages, `/api/orders/[id]` PATCH with eligibility check.

### Prompt 8 — Tests
**Prompt:** "Generate unit tests for cart, utils, validations and Playwright E2E tests."
**Result:** `cart.test.ts`, `utils.test.ts`, `validations.test.ts`, `e2e.spec.ts`.
