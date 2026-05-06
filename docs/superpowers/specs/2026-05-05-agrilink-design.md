# Agrilink — MVP Design Spec
_Date: 2026-05-05_

## Problem
Small-scale farmers lack direct access to consumers, losing margin to middlemen. Agrilink is a direct-to-consumer marketplace that empowers farmers to list produce and consumers to buy directly.

## Product Summary
Web app named **Agrilink**. MVP delivered by 2026-05-06. Full product continues after MVP.

---

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router + Server Actions) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | GSAP + ScrollTrigger |
| Backend/Auth/DB | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Vercel (auto-deploy on git push) |

---

## Visual Style
- **Dark Bold Modern**: dark navy/black background
- Accent: vibrant green (`#22c55e`) + gold gradient (`#facc15`)
- Logo: free-use image from internet, name "AGRILINK" in bold
- Animation feel: cinematic scroll-driven, like shelby.ashfall.studio

---

## User Roles
- **Farmer**: lists products, manages inventory, receives + updates orders
- **Consumer**: browses products, places orders, tracks order status

---

## Auth
- Supabase Auth (built-in)
- Email/password only (MVP — Google OAuth deferred to full product build)
- Role selected on signup (farmer / consumer)
- Supabase trigger creates `profiles` row on `auth.users` insert
- Middleware protects `/dashboard/*` (farmer only) and `/orders`, `/cart`, `/checkout` (consumer only)

---

## Pages

### Public
| Route | Description |
|---|---|
| `/` | Landing page — cinematic GSAP hero, how-it-works, featured products, farmer spotlight, CTAs |
| `/shop` | Product listing — grid, category filter, delivery/pickup toggle |
| `/product/[id]` | Product detail — images, farmer snippet, add to cart |
| `/auth` | Login / Register with role selector |

### Consumer (auth required)
| Route | Description |
|---|---|
| `/cart` | Cart items, quantity, total, proceed to checkout |
| `/checkout` | Fake payment UI (UPI/card fields, hardcoded, no real gateway), saves order on submit |
| `/orders` | Order history with status badges |

### Farmer (auth required)
| Route | Description |
|---|---|
| `/dashboard` | Stats (products count, orders count), listings grid, toggle availability |
| `/dashboard/add-product` | Product form: name, description, price, unit, category, stock, image, delivery type |
| `/dashboard/edit-product/[id]` | Edit existing listing |
| `/dashboard/orders` | Incoming orders, update status |

---

## Database Schema (Supabase PostgreSQL)

```sql
-- Extends Supabase auth.users
profiles (
  id          uuid references auth.users primary key,
  role        text check (role in ('farmer','consumer')),
  full_name   text,
  phone       text,
  location    text,
  avatar_url  text,
  created_at  timestamptz default now()
)

products (
  id              uuid primary key default gen_random_uuid(),
  farmer_id       uuid references profiles(id),
  name            text,
  description     text,
  price           numeric,
  unit            text,           -- 'kg','dozen','piece','litre', etc.
  stock           integer,
  category        text,           -- 'vegetables','fruits','grains','dairy','other'
  image_url       text,
  delivery_type   text check (delivery_type in ('both','delivery','pickup')),
  delivery_area   text,
  pickup_location text,
  is_available    boolean default true,
  created_at      timestamptz default now()
)

orders (
  id              uuid primary key default gen_random_uuid(),
  consumer_id     uuid references profiles(id),
  farmer_id       uuid references profiles(id),
  status          text check (status in ('pending','confirmed','shipped','delivered')) default 'pending',
  delivery_type   text check (delivery_type in ('delivery','pickup')),
  address         text,
  total_price     numeric,
  created_at      timestamptz default now()
)

order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references orders(id),
  product_id  uuid references products(id),
  quantity    integer,
  price       numeric
)
```

RLS enabled on all tables. Supabase Storage bucket: `product-images` (public read, auth write).

---

## MVP Phases

### Phase 1 — Foundation (~45 min)
- `npx create-next-app@latest agrilink` + Tailwind + shadcn/ui
- Supabase project init, run schema SQL, enable RLS policies
- Next.js middleware for protected routes
- Vercel deploy + env vars set

### Phase 2 — Landing Page (~60 min)
- Install GSAP + ScrollTrigger
- Hero: full-screen, scroll-driven text reveal + parallax
- How it works: 3-step staggered fade-in
- Featured products placeholder grid (static)
- Navbar + footer
- Style C applied (dark navy + green/gold)

### Phase 3 — Auth (~30 min)
- `/auth` page: email/password + Google OAuth via Supabase
- Role selector on signup
- Profile auto-creation via Supabase DB trigger
- Post-login redirect by role

### Phase 4 — Farmer Dashboard (~45 min)
- `/dashboard`: stats cards + listings grid
- `/dashboard/add-product`: form + Supabase Storage image upload
- Edit / delete / toggle availability
- `/dashboard/orders`: incoming orders + status update actions

### Phase 5 — Consumer Storefront + Checkout (~60 min)
- `/shop`: product grid + category filter + delivery toggle
- `/product/[id]`: detail page + farmer snippet + add to cart
- Cart: React context + localStorage persistence
- `/checkout`: fake payment UI (fields present, no real gateway, "Pay ₹XXX" saves order)
- `/orders`: order history

---

## Post-MVP (after 2026-05-06)
- Real Razorpay payment integration
- SMS/email notifications
- Farmer profile public pages
- Reviews and ratings
- Search + advanced filters
- Map-based delivery zone picker
- Mobile app (React Native)

---

## Constraints
- No paid APIs for MVP
- No Meta Developer Platform
- No Razorpay for MVP (placeholder only)
- Supabase free tier + Vercel free tier sufficient for MVP
