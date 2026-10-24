# Architecture Documentation — Chapter & Co.

## System overview

Chapter & Co. is a full-stack eCommerce bookstore built with Next.js 15 App Router, TypeScript, and PostgreSQL. It follows a layered architecture with clear separation between presentation, business logic and data access.

## Technology decisions

### Next.js App Router
Server Components handle data fetching directly from the database without an additional API layer for page rendering. This eliminates waterfall requests and improves performance. Client Components are used only where interactivity is required (cart, filters, forms).

### Prisma ORM + PostgreSQL
Prisma provides type-safe database access with auto-generated client types. Migrations are version-controlled. The schema enforces data integrity at the database level via constraints and foreign keys.

### Auth.js (NextAuth v5)
Credentials provider for email/password authentication with JWT sessions. The middleware protects server-side routes. The Prisma adapter persists sessions and accounts.

### Zustand for cart state
Cart state is persisted in `localStorage` via `zustand/middleware/persist`. This allows the cart to survive page refreshes without requiring authentication.

### Zod validation
Validation schemas are shared between the frontend (react-hook-form) and API route handlers. All API inputs are validated server-side regardless of frontend validation.

## Data flow

```
Browser → Server Component → Prisma → PostgreSQL
       → Client Component → /api/ Route → Prisma → PostgreSQL
       → Zustand (cart, localStorage)
```

## Authentication flow

```
Login form → POST /api/auth/callback/credentials
          → auth() validates credentials
          → JWT session created
          → middleware checks session on protected routes
```

## Order flow

```
Cart (Zustand) → Checkout page → POST /api/checkout
              → Server validates:
                  - Address ownership
                  - Book existence and stock
                  - Server-side pricing (ignores client)
                  - Gift point balance
              → Creates Order, OrderItems, Payment in transaction
              → Deducts stock
              → Awards gift points
              → Redirect to /account/orders/[id]?confirmed=true
```

## Cancellation flow

```
PATCH /api/orders/[id] { action: 'cancel' }
→ Verify order belongs to user
→ Check status is not already CANCELLED
→ Check createdAt + 48 hours > now()
→ Update status to CANCELLED
→ Restore stock
→ Refund gift points if redeemed
```

## Folder structure

```
chapter-and-co/
├── prisma/
│   ├── schema.prisma      Full data model with all relations
│   └── seed.ts            30 realistic books, seed data
├── src/
│   ├── app/               Next.js App Router
│   │   ├── (pages)        Server components → direct DB access
│   │   └── api/           Route Handlers → REST API
│   ├── components/        Reusable UI + feature components
│   ├── hooks/             use-toast
│   ├── lib/               auth, prisma singleton, utils, validations
│   ├── middleware.ts       Route protection
│   ├── store/             Zustand cart store
│   └── tests/             Unit tests (Vitest) + E2E (Playwright)
├── docs/
│   ├── openapi.yaml       OpenAPI 3 spec
│   └── architecture.md    This file
├── .env.example
└── README.md
```

## Security considerations

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcrypt, cost factor 12 |
| Payment data | No real card data stored; demo only |
| Server-side pricing | All prices recalculated from DB on checkout |
| IDOR prevention | All user-scoped queries filter by `userId` |
| Input validation | Zod on all API inputs |
| Auth on protected routes | middleware + `auth()` in route handlers |
| Secrets | Environment variables only |
