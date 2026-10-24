# Narration Script — IBM AI Specialist Capstone Video
# Chapter & Co. eCommerce Bookstore
# Duration: ~180 seconds | Words: ~390

---

## SCENE 1 — Introduction (0:00–0:20) | ~40 words

"This is Chapter & Co. — a fully responsive eCommerce bookstore I built as part of the IBM AI Specialist Front End and Mobile Capstone.

The application was designed and implemented from scratch using IBM Bob as my Agentic IDE, with a stack of Next.js 15, React, TypeScript, PostgreSQL and Tailwind CSS."

---

## SCENE 2 — AI-Assisted Development (0:20–0:55) | ~110 words

"Everything you see here began with a single master prompt inside IBM Bob.

I asked Bob to act as a Senior Full-Stack Engineer, propose the architecture, define the data model and deliver the project in seven incremental phases — not generate everything at once.

Bob proposed the Next.js App Router structure, designed the PostgreSQL schema with thirteen models, suggested the Zustand cart store and outlined all nine REST API endpoints.

From that architecture, Bob generated the Prisma schema, the Auth.js authentication module with bcrypt password hashing, the Zustand cart store, the server-side checkout handler with authoritative pricing — meaning the server always recalculates prices from the database and ignores any client-submitted values — and the full set of reusable UI components based on Tailwind CSS.

Each phase ended with a validation step: I reviewed the code, identified issues and refined the output before continuing."

---

## SCENE 3 — Frontend Application (0:55–1:35) | ~95 words

"The homepage loads with a hero banner, featured books pulled directly from the database, a browse-by-category section and a bestsellers row — all rendered as React Server Components with zero client-side data fetching on initial load.

The catalogue page supports full-text search across titles, authors and descriptions, category filtering, price range filtering and five sort modes — all implemented server-side with Prisma queries.

Each book detail page displays the cover from Open Library, the author, categories, a delivery estimate, related books from the same category, and a client-side Add to Cart button backed by the Zustand store with localStorage persistence."

---

## SCENE 4 — Checkout and Purchase Flow (1:35–2:05) | ~75 words

"At checkout, the user selects a delivery address or adds a new one. Payment is clearly labelled as a demonstration — no real card data is ever stored.

The system also supports gift points: five hundred welcome points were seeded for the demo account, worth five pounds in discounts.

Placing the order triggers a Prisma database transaction that confirms pricing, deducts stock, records the payment and awards new points — all atomically. The confirmation page shows a unique order reference."

---

## SCENE 5 — Code, Testing and Refinement (2:05–2:35) | ~70 words

"Bob generated thirty unit tests covering the cart store, utility functions and all Zod validation schemas — and all thirty pass.

Looking at the checkout API, you can see server-side ownership checks, stock validation and the 48-hour cancellation window — enforced on the server, not the client.

I reviewed every generated file, fixed four TypeScript errors surfaced by strict mode, corrected a Prisma query typing issue and updated the Next.js config to the v15 API."

---

## SCENE 6 — GitHub and Conclusion (2:35–3:00) | ~55 words

"The project is committed to a feature branch — feature/chapter-and-co-bookstore — with the full source, Prisma migrations, seed data, OpenAPI specification and architecture documentation.

IBM Bob accelerated this build significantly: architecture, database schema, components, API handlers and tests — all generated from structured prompts, reviewed by a developer and refined iteratively.

The result is a production-ready bookstore that demonstrates what Agentic AI development looks like in practice."

---

## WORD COUNT SUMMARY
- Scene 1:  ~40 words
- Scene 2: ~110 words
- Scene 3:  ~95 words
- Scene 4:  ~75 words
- Scene 5:  ~70 words
- Scene 6:  ~55 words
- **TOTAL:  ~445 words** (spoken at ~140 wpm = ~3:00 min)
