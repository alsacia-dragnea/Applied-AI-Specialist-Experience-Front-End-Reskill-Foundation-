# Screen Recording Guide — Chapter & Co. Capstone Video
# Sequence of recordings required, in order

---

## BEFORE YOU START

- Application running at: http://localhost:3001
- Demo login: demo@chapterandco.com / Demo1234!
- Browser: Chrome, 1920×1080, zoom 100%, no extensions visible
- Terminal: clean, dark theme, font size 14pt
- IBM Bob: conversation open on the master prompt exchange
- OBS or QuickTime: set to 1920×1080, 30fps
- Mic: clean, quiet room

---

## RECORDING 1 — Homepage (Scene 1 + Scene 3)
**Duration:** ~20s
**URL:** http://localhost:3001/

**Actions:**
1. Start recording
2. Slow scroll from top of page down through:
   - Hero banner ("Stories That Stay With You")
   - Trust signals bar (Truck · Star · Shield · Gift)
   - Featured Books grid (8 books with covers)
   - Browse by Category grid (10 categories)
   - Bestsellers row (4 books)
   - CTA banner ("Your next great read is waiting")
3. Stop recording

**Caption cue:** "The homepage loads with a hero banner, featured books..."

---

## RECORDING 2 — IBM Bob Interface (Scene 2)
**Duration:** ~35s
**Tool:** IBM Bob chat UI

**Actions:**
1. Open IBM Bob
2. Scroll to show the master prompt that was sent:
   - Show the opening "You are a Senior Full-Stack Engineer..." text
   - Show the architecture proposal response from Bob
3. Show the generated file tree / folder structure Bob proposed
4. Switch to VS Code — show src/ directory tree expanded
5. Open src/lib/auth.ts — pause 2s on the Auth.js code
6. Open src/app/api/checkout/route.ts — pause 2s on the server-side pricing section (line ~60: "// Fetch books server-side for authoritative pricing")
7. Open src/store/cart.ts — pause 2s on the persist() middleware

**Caption cue:** "Bob proposed the architecture, designed the schema..."

---

## RECORDING 3 — Catalogue and Filters (Scene 3)
**Duration:** ~20s
**URL:** http://localhost:3001/catalogue

**Actions:**
1. Show the full catalogue grid (30 books shown, 6 pages)
2. Click "Fiction" in the left sidebar filter
3. Show filtered results (21 Fiction books)
4. Click "Price: Low to High" sort
5. Show prices re-ordered
6. Click "Bestsellers first" sort
7. Type "sapiens" in the search box → navigate to /catalogue?search=sapiens
8. Show single result: "Sapiens: A Brief History of Humankind"

**Caption cue:** "The catalogue page supports full-text search..."

---

## RECORDING 4 — Book Detail Page (Scene 3)
**Duration:** ~15s
**URL:** http://localhost:3001/books/one-hundred-years-of-solitude

**Actions:**
1. Show full book detail:
   - Cover image (left column)
   - Title, author, category badges
   - Price with compare-at strikethrough
   - "In stock" indicator
   - Add to Cart button
   - Delivery estimate ("Estimated delivery: [date range]")
   - Book metadata (publisher, published date, pages, language)
2. Scroll down to "You might also like" related books section
3. Click "Add to Cart" — show toast notification ("Added to cart, 'One Hundred Years...' is in your bag")

**Caption cue:** "Each book detail page displays the cover..."

---

## RECORDING 5 — Shopping Cart (Scene 3/4)
**Duration:** ~15s
**URL:** http://localhost:3001/cart

**Actions:**
1. Navigate to /cart
2. Show cart with the added book
3. Click "+" to increase quantity to 2 — observe subtotal update
4. Show "Free delivery" threshold message (if under £25)
5. Show Order Summary panel: Subtotal · Delivery · Total
6. Click "Proceed to Checkout" button

**Caption cue:** "The cart shows quantity controls, subtotal..."

---

## RECORDING 6 — Checkout Flow (Scene 4)
**Duration:** ~30s
**URL:** http://localhost:3001/checkout

**Prerequisites:** Log in as demo@chapterandco.com / Demo1234!

**Actions:**
1. Sign in with demo credentials at /auth/login
2. Navigate back to /cart (cart should repopulate from localStorage)
3. Click "Proceed to Checkout"
4. Show checkout page:
   - Delivery address pre-selected ("Demo User, 123 Bookshelf Lane, Reading...")
   - Payment method: "Demo Card Payment" selected (show DEMO badge)
   - Enter demo card last 4 digits: "4242"
5. Show Order Summary (right panel): items · subtotal · delivery · total
6. Scroll down to show Gift Points section (shows "You have 500 points...")
7. Click "Place order · £XX.XX"
8. Show order confirmation page with:
   - Green "Order placed successfully!" banner
   - Order reference number
   - Items summary
   - Payment summary

**Caption cue:** "Payment is clearly labelled as a demonstration..."

---

## RECORDING 7 — Order History and Cancellation (Scene 4)
**Duration:** ~20s
**URL:** http://localhost:3001/account/orders

**Actions:**
1. Navigate to /account/orders
2. Show list of orders with status badges ("Confirmed")
3. Click the order just placed
4. Show full order detail:
   - Order reference
   - Items with covers
   - Payment summary
   - Delivery address
   - "Buy again" button
   - "Cancel order" button (visible within 48 hrs)
5. Click "Buy again" — show toast ("All items have been added to your cart")

**Caption cue:** "The confirmation page shows a unique order reference..."

---

## RECORDING 8 — Vitest Test Run (Scene 5)
**Duration:** ~20s
**Tool:** Terminal (dark theme)

**Actions:**
1. cd chapter-and-co
2. Run: npm test -- --reporter=verbose
3. Pause when output shows:
   - ✓ Cart store > adds an item to the cart
   - ✓ Cart store > caps quantity at 10
   - ✓ formatPrice > formats a number as GBP
   - ✓ registerSchema > rejects mismatched passwords
   - Final line: "Tests  30 passed (30)"
4. Zoom in on the "30 passed" line

**Caption cue:** "Bob generated thirty unit tests — all thirty pass."

---

## RECORDING 9 — Code Review Moments (Scene 5)
**Duration:** ~20s
**Tool:** VS Code or editor

**Actions:**
1. Open src/app/api/orders/[id]/route.ts
2. Highlight lines 55-62 (the 48-hour check):
   ```
   const hoursSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60)
   if (hoursSinceOrder > 48) {
     return NextResponse.json({ error: '...' }, { status: 400 })
   }
   ```
3. Open src/components/books/book-card.tsx
4. Show the BookCard component — highlight the reusable structure
5. Open prisma/schema.prisma — scroll through model list (User, Book, Order, Payment...)

**Caption cue:** "The 48-hour cancellation window enforced server-side..."

---

## RECORDING 10 — Responsive Mobile View (Scene 5)
**Duration:** ~15s
**Tool:** Chrome DevTools device emulation — iPhone 13 (390×844)

**Actions:**
1. Toggle DevTools device mode (Cmd+Shift+M)
2. Select "iPhone 13" preset
3. Navigate to http://localhost:3001/
4. Show hamburger menu icon in header
5. Click hamburger — show mobile navigation menu
6. Navigate to /catalogue — show 2-column grid layout
7. Navigate to a book detail — show stacked cover + details

**Caption cue:** "The application works on desktop, tablet and mobile."

---

## RECORDING 11 — GitHub Repository (Scene 6)
**Duration:** ~15s
**Tool:** Terminal or GitHub web UI

**Option A (Terminal):**
```bash
git log --oneline -5
git branch
```

**Option B (GitHub web):**
1. Open GitHub repository
2. Show: feature/chapter-and-co-bookstore branch
3. Show commit: "feat: complete Chapter & Co. eCommerce bookstore"
4. Show file tree: prisma/ · src/ · docs/ · README.md
5. Show Pull Request if created

**Caption cue:** "The project is committed to a feature branch..."

---

## EDITING SEQUENCE

Assemble clips in this order with the narration audio playing continuously:

| # | Clip | Start time | Duration | Notes |
|---|------|-----------|----------|-------|
| 1 | Homepage scroll | 0:00 | 20s | Scene 1 intro |
| 2 | IBM Bob prompt + Bob response | 0:20 | 20s | Scene 2 — most important |
| 3 | VS Code: auth.ts + checkout route | 0:40 | 15s | Scene 2 continued |
| 4 | Catalogue + filters + search | 0:55 | 20s | Scene 3 |
| 5 | Book detail + Add to Cart | 1:15 | 20s | Scene 3 |
| 6 | Login → Cart → Checkout | 1:35 | 30s | Scene 4 |
| 7 | Order confirmation + history | 2:05 | 10s | Scene 4 end |
| 8 | Terminal: vitest results | 2:15 | 15s | Scene 5 |
| 9 | Code: 48hr cancellation logic | 2:25 | 10s | Scene 5 |
| 10 | GitHub branch / commit | 2:35 | 15s | Scene 6 |
| 11 | Mobile responsive demo | 2:45 | 15s | Scene 6 + close |

**Transitions:** 0.3s fade or straight cut — no wipes or animations
**Background music:** None
**Captions:** Burn-in from captions.srt or render as subtitle track

---

## FFMPEG ASSEMBLY COMMAND (if clips are named sequentially)

```bash
# Concatenate clips (replace filenames with your actual recordings)
ffmpeg -f concat -safe 0 -i clips.txt \
  -vf "subtitles=docs/video/captions.srt:force_style='FontSize=20,PrimaryColour=&Hffffff'" \
  -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k \
  -s 1920x1080 -r 30 \
  IBM_AI_Specialist_Capstone_Chapter_and_Co.mp4

# clips.txt format:
# file 'clip_01_homepage.mp4'
# file 'clip_02_ibm_bob.mp4'
# ... etc
```

---

## SCREEN RESOLUTION & RECORDING SETTINGS

| Setting | Value |
|---------|-------|
| Resolution | 1920 × 1080 |
| Frame rate | 30 fps |
| Format | MP4 (H.264) |
| Audio | AAC, 44.1 kHz, stereo |
| Cursor | Visible, spotlight highlight recommended |
| Browser zoom | 100% |
| System notifications | Disabled during recording |
