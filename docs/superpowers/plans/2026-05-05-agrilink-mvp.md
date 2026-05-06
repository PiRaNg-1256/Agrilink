# Agrilink MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. ALSO USE `caveman:caveman` skill at session start to minimize token usage.

**Goal:** Build and deploy Agrilink — a direct-to-consumer farm marketplace — as a working MVP on Vercel by end of session.

**Architecture:** Next.js 14 App Router with Server Actions for mutations. Supabase handles auth (email/password + Google OAuth), PostgreSQL database, and image storage. GSAP + ScrollTrigger powers cinematic landing page animations.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Supabase (`@supabase/ssr`), GSAP + ScrollTrigger, Vercel

**Spec:** `docs/superpowers/specs/2026-05-05-agrilink-design.md`

---

## File Map

```
agrilink/
├── app/
│   ├── layout.tsx                          # Root layout, fonts, providers
│   ├── page.tsx                            # Landing page
│   ├── auth/
│   │   └── page.tsx                        # Login + Register + role selector
│   ├── shop/
│   │   └── page.tsx                        # Product listing with filters
│   ├── product/
│   │   └── [id]/page.tsx                   # Product detail
│   ├── cart/
│   │   └── page.tsx                        # Cart page
│   ├── checkout/
│   │   └── page.tsx                        # Fake checkout
│   ├── orders/
│   │   └── page.tsx                        # Consumer order history
│   └── dashboard/
│       ├── page.tsx                        # Farmer dashboard
│       ├── add-product/page.tsx            # Add product form
│       ├── edit-product/[id]/page.tsx      # Edit product form
│       └── orders/page.tsx                 # Farmer incoming orders
├── components/
│   ├── landing/
│   │   ├── Hero.tsx                        # GSAP animated hero section
│   │   ├── HowItWorks.tsx                  # 3-step scroll animation
│   │   ├── FeaturedProducts.tsx            # Products grid preview
│   │   └── FarmerSpotlight.tsx             # Farmer highlight section
│   ├── shared/
│   │   ├── Navbar.tsx                      # Top nav with auth state
│   │   └── Footer.tsx                      # Site footer
│   ├── auth/
│   │   └── AuthForm.tsx                    # Unified login/register form
│   ├── products/
│   │   ├── ProductCard.tsx                 # Reusable product card
│   │   ├── ProductGrid.tsx                 # Grid + filter wrapper
│   │   └── ProductForm.tsx                 # Add/edit product form
│   ├── cart/
│   │   └── CartProvider.tsx                # Cart context + localStorage
│   ├── checkout/
│   │   └── FakePaymentForm.tsx             # Fake UPI/card UI
│   └── dashboard/
│       ├── StatsCards.tsx                  # Farmer stats overview
│       ├── ListingsGrid.tsx                # Farmer's product listings
│       └── OrdersTable.tsx                 # Reusable orders table
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser Supabase client
│   │   └── server.ts                       # Server Supabase client
│   ├── actions/
│   │   ├── products.ts                     # Product CRUD server actions
│   │   ├── orders.ts                       # Order create/update actions
│   │   └── profile.ts                      # Profile fetch/update actions
│   └── types.ts                            # Shared TypeScript types
├── middleware.ts                           # Auth + role-based route protection
├── supabase/
│   └── schema.sql                          # Full DB schema + RLS policies
└── .env.local                              # Supabase + Google OAuth keys
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json` (via CLI)
- Create: `.env.local`
- Create: `supabase/schema.sql`
- Create: `lib/types.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd D:/Agrilink
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
```
When prompted: answer Yes to all defaults.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js gsap @gsap/react lucide-react clsx
npx shadcn@latest init
```
shadcn init prompts: Default style → Default, Base color → Neutral, CSS variables → Yes.

- [ ] **Step 3: Add shadcn components used in this project**

```bash
npx shadcn@latest add button input label card badge select textarea toast dialog
```

- [ ] **Step 4: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Get values from: Supabase dashboard → Project Settings → API.

- [ ] **Step 5: Create `supabase/schema.sql`**

```sql
-- Run this in Supabase SQL Editor

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('farmer','consumer')) not null,
  full_name text,
  phone text,
  location text,
  avatar_url text,
  created_at timestamptz default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  unit text not null default 'kg',
  stock integer not null default 0,
  category text check (category in ('vegetables','fruits','grains','dairy','other')) not null,
  image_url text,
  delivery_type text check (delivery_type in ('both','delivery','pickup')) not null default 'both',
  delivery_area text,
  pickup_location text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid references public.profiles(id) not null,
  farmer_id uuid references public.profiles(id) not null,
  status text check (status in ('pending','confirmed','shipped','delivered')) default 'pending',
  delivery_type text check (delivery_type in ('delivery','pickup')) not null,
  address text,
  total_price numeric not null,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  price numeric not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'consumer'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users read own, farmers readable by all for product pages
create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Products: public read, farmers manage own
create policy "Products public read" on public.products for select using (is_available = true);
create policy "Farmers read own products" on public.products for select using (auth.uid() = farmer_id);
create policy "Farmers insert products" on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmers update own products" on public.products for update using (auth.uid() = farmer_id);
create policy "Farmers delete own products" on public.products for delete using (auth.uid() = farmer_id);

-- Orders: consumers see own, farmers see incoming
create policy "Consumers read own orders" on public.orders for select using (auth.uid() = consumer_id);
create policy "Farmers read incoming orders" on public.orders for select using (auth.uid() = farmer_id);
create policy "Consumers create orders" on public.orders for insert with check (auth.uid() = consumer_id);
create policy "Farmers update order status" on public.orders for update using (auth.uid() = farmer_id);

-- Order items: linked to order access
create policy "Order items readable" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.consumer_id = auth.uid() or o.farmer_id = auth.uid()))
);
create policy "Order items insertable" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.consumer_id = auth.uid())
);
```

Run the above in Supabase SQL Editor → Run.

- [ ] **Step 6: Create Supabase Storage bucket**

In Supabase dashboard → Storage → New bucket:
- Name: `product-images`
- Public: Yes

Add storage policy: In SQL Editor run:
```sql
create policy "Anyone can view product images"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Auth users can upload product images"
  on storage.objects for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Owners can delete product images"
  on storage.objects for delete using (bucket_id = 'product-images' and auth.uid() = owner);
```

- [ ] **Step 7: Create `lib/types.ts`**

```typescript
export type UserRole = 'farmer' | 'consumer'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  location: string | null
  avatar_url: string | null
  created_at: string
}

export type ProductCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'other'
export type DeliveryType = 'both' | 'delivery' | 'pickup'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered'

export interface Product {
  id: string
  farmer_id: string
  name: string
  description: string | null
  price: number
  unit: string
  stock: number
  category: ProductCategory
  image_url: string | null
  delivery_type: DeliveryType
  delivery_area: string | null
  pickup_location: string | null
  is_available: boolean
  created_at: string
  profiles?: Profile
}

export interface Order {
  id: string
  consumer_id: string
  farmer_id: string
  status: OrderStatus
  delivery_type: 'delivery' | 'pickup'
  address: string | null
  total_price: number
  created_at: string
  order_items?: OrderItem[]
  profiles?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  products?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}
```

- [ ] **Step 8: Create `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 9: Create `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 10: Create `middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  const protectedRoutes = ['/cart', '/checkout', '/orders', '/dashboard']
  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Role-based: only farmers can access /dashboard
  if (user && pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'farmer') {
      return NextResponse.redirect(new URL('/shop', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 11: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart/CartProvider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agrilink — Farm Fresh, Direct to You',
  description: 'Empowering small-scale farmers through direct-to-consumer supply chain',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0d0d1a] text-white`}>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 12: Commit**

```bash
git init
git add .
git commit -m "feat: project bootstrap — Next.js, Supabase, GSAP, shadcn/ui setup"
```

---

## Task 2: Shared Components (Navbar + Footer)

**Files:**
- Create: `components/shared/Navbar.tsx`
- Create: `components/shared/Footer.tsx`

- [ ] **Step 1: Create `components/shared/Navbar.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Leaf } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { useCart } from '@/components/cart/CartProvider'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { items } = useCart()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0d0d1a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-black" />
          </div>
          <span className="font-black text-lg tracking-widest text-white">AGRILINK</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/shop" className="text-sm text-gray-300 hover:text-green-400 transition-colors">Shop</Link>
          {profile?.role === 'farmer' && (
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-green-400 transition-colors">Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {profile ? (
                <>
                  {profile.role === 'consumer' && (
                    <Link href="/cart" className="relative">
                      <ShoppingCart className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />
                      {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                          {items.length}
                        </span>
                      )}
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-300 hover:text-white">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button size="sm" className="bg-green-500 hover:bg-green-400 text-black font-bold">
                    Get Started
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create `components/shared/Footer.tsx`**

```typescript
import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0d1a] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-black" />
            </div>
            <span className="font-black tracking-widest text-white">AGRILINK</span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            Empowering farmers. Connecting communities. Fresh from the source.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/shop" className="hover:text-green-400 transition-colors">Shop</Link>
            <Link href="/auth" className="hover:text-green-400 transition-colors">Join</Link>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-8">© 2026 Agrilink. All rights reserved.</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: shared Navbar and Footer components"
```

---

## Task 3: Cart Context

**Files:**
- Create: `components/cart/CartProvider.tsx`

- [ ] **Step 1: Create `components/cart/CartProvider.tsx`**

```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { CartItem, Product } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('agrilink-cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('agrilink-cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        )
      }
      return [...prev, { product, quantity }]
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: cart context with localStorage persistence"
```

---

## Task 4: Landing Page (GSAP Animations)

**Files:**
- Create: `components/landing/Hero.tsx`
- Create: `components/landing/HowItWorks.tsx`
- Create: `components/landing/FeaturedProducts.tsx`
- Create: `components/landing/FarmerSpotlight.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/landing/Hero.tsx`**

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation
      const tl = gsap.timeline()
      tl.from(headlineRef.current, { y: 80, opacity: 0, duration: 1.2, ease: 'power4.out' })
        .from(subRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .from(ctaRef.current, { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')

      // Parallax on scroll
      gsap.to(bgRef.current, {
        yPercent: 40,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      // Text fade out on scroll
      gsap.to([headlineRef.current, subRef.current, ctaRef.current], {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: '30% top', end: '60% top', scrub: true },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div ref={bgRef} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f0f] via-[#0d0d1a] to-[#0d0d1a]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-yellow-400/5 rounded-full blur-[80px]" />
      </div>

      <div className="text-center px-4 max-w-5xl mx-auto">
        <div className="mb-4 inline-block">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase border border-green-400/30 px-4 py-1.5 rounded-full">
            Direct Farm to Consumer
          </span>
        </div>
        <h1 ref={headlineRef} className="text-6xl md:text-8xl font-black leading-none mb-6">
          <span className="block text-white">Farm Fresh.</span>
          <span className="block bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            Direct to You.
          </span>
        </h1>
        <p ref={subRef} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Agrilink connects small-scale farmers directly with consumers — no middlemen, fairer prices, fresher produce.
        </p>
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 text-base">
              Shop Fresh Produce
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-base">
              Join as Farmer
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-5 h-5 text-gray-500" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/landing/HowItWorks.tsx`**

```typescript
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sprout, ShoppingBag, Truck } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { icon: Sprout, number: '01', title: 'Farmers List Produce', desc: 'Small-scale farmers create listings with prices, availability, and delivery options — directly on Agrilink.' },
  { icon: ShoppingBag, number: '02', title: 'Consumers Browse & Order', desc: 'Buyers discover local farmers, browse fresh produce, and place orders with a single click.' },
  { icon: Truck, number: '03', title: 'Direct Delivery or Pickup', desc: 'Farmers deliver to your door or you pick up locally — zero middlemen, maximum freshness.' },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      })
      stepsRef.current.forEach((el, i) => {
        gsap.from(el, {
          y: 80, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.15,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-20">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4">From field to table,<br /><span className="text-gray-500">simplified.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={el => { if (el) stepsRef.current[i] = el }}
              className="relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-green-400/30 transition-colors"
            >
              <div className="text-6xl font-black text-white/5 absolute top-6 right-6">{step.number}</div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `components/landing/FeaturedProducts.tsx`**

```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

export default async function FeaturedProducts() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, profiles(full_name, location)')
    .eq('is_available', true)
    .limit(6)
    .order('created_at', { ascending: false })

  const items: Product[] = products ?? []

  return (
    <section className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Fresh Listings</span>
            <h2 className="text-4xl font-black text-white mt-2">Straight from the farm.</h2>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">View All</Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">First farmers coming soon.</p>
            <Link href="/auth" className="mt-4 inline-block">
              <Button className="bg-green-500 hover:bg-green-400 text-black font-bold mt-4">Join as Farmer</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(p => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-green-400/40 transition-all hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-green-900/30 to-yellow-900/20 flex items-center justify-center overflow-hidden">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <span className="text-5xl">🌿</span>
                    }
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white">{p.name}</h3>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">{p.category}</Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-bold text-lg">₹{p.price}<span className="text-gray-500 text-sm font-normal">/{p.unit}</span></span>
                      <span className="text-xs text-gray-500">{(p as any).profiles?.location ?? 'Local Farm'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/landing/FarmerSpotlight.tsx`**

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FarmerSpotlight() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-green-400/20 bg-gradient-to-br from-green-950/40 to-[#0d0d1a] p-12 md:p-20 text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">For Farmers</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4 mb-6">
            Your harvest.<br />
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">Your price.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            List your produce in minutes. Reach consumers directly. No commission to middlemen — every rupee goes to you.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-bold px-10 text-base">
              Start Selling Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Update `app/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturedProducts from '@/components/landing/FeaturedProducts'
import FarmerSpotlight from '@/components/landing/FarmerSpotlight'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturedProducts />
      <FarmerSpotlight />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 6: Run dev server and verify landing page renders**

```bash
npm run dev
```
Open http://localhost:3000. Verify: hero text animates in on load, parallax on scroll, HowItWorks cards fade in on scroll, featured products grid shows (or empty state). No console errors.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: landing page with GSAP scroll animations"
```

---

## Task 5: Auth Page

**Files:**
- Create: `components/auth/AuthForm.tsx`
- Create: `app/auth/page.tsx`

Note: Google OAuth deferred to full product build. Email/password only for MVP.

- [ ] **Step 1: Create `components/auth/AuthForm.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Leaf } from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<UserRole>('consumer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { role, full_name: fullName } },
        })
        if (error) throw error
        toast({ title: 'Account created!', description: 'Check your email to confirm, then sign in.' })
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
        window.location.href = profile?.role === 'farmer' ? '/dashboard' : '/shop'
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-xl tracking-widest text-white">AGRILINK</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-green-500 text-black' : 'text-gray-400'}`}>
              Sign In
            </button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-green-500 text-black' : 'text-gray-400'}`}>
              Register
            </button>
          </div>

          {mode === 'register' && (
            <>
              <div className="mb-4">
                <Label className="text-gray-300 text-sm mb-2 block">I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['consumer', 'farmer'] as UserRole[]).map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`p-3 rounded-xl border text-sm font-medium capitalize transition-colors ${role === r ? 'border-green-400 bg-green-500/20 text-green-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                      {r === 'consumer' ? '🛒 Consumer' : '🌾 Farmer'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="name" className="text-gray-300 text-sm">Full Name</Label>
                <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white" placeholder="Your full name" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-400 text-black font-bold">
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/auth/page.tsx`**

```typescript
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  return <AuthForm />
}
```

- [ ] **Step 3: Disable email confirmation in Supabase (important for demo)**

In Supabase dashboard → Authentication → Email → toggle OFF "Confirm email". This lets users register and login immediately without checking email — critical for live demo.

- [ ] **Step 4: Test auth flow**

```bash
npm run dev
```
Visit http://localhost:3000/auth. Test: register as consumer, register as farmer, login. Verify redirect to `/shop` for consumer, `/dashboard` for farmer.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: auth page with email/password (Google OAuth deferred to full build)"
```

---

## Task 6: Server Actions

**Files:**
- Create: `lib/actions/products.ts`
- Create: `lib/actions/orders.ts`
- Create: `lib/actions/profile.ts`

- [ ] **Step 1: Create `lib/actions/products.ts`**

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Product } from '@/lib/types'

export async function getProducts(category?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*, profiles(full_name, location, id)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
  if (category && category !== 'all') query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data as Product[]
}

export async function getFarmerProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Product[]
}

export async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, profiles(full_name, location, phone, id)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Product
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let image_url: string | null = null
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = publicUrl
    }
  }

  const { error } = await supabase.from('products').insert({
    farmer_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    unit: formData.get('unit') as string,
    stock: parseInt(formData.get('stock') as string),
    category: formData.get('category') as string,
    delivery_type: formData.get('delivery_type') as string,
    delivery_area: formData.get('delivery_area') as string || null,
    pickup_location: formData.get('pickup_location') as string || null,
    image_url,
  })
  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath('/shop')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let image_url: string | undefined
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = publicUrl
    }
  }

  const updates: Record<string, any> = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    unit: formData.get('unit') as string,
    stock: parseInt(formData.get('stock') as string),
    category: formData.get('category') as string,
    delivery_type: formData.get('delivery_type') as string,
    delivery_area: formData.get('delivery_area') as string || null,
    pickup_location: formData.get('pickup_location') as string || null,
  }
  if (image_url) updates.image_url = image_url

  const { error } = await supabase.from('products').update(updates).eq('id', id).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath(`/product/${id}`)
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase.from('products').delete().eq('id', id).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard')
}

export async function toggleProductAvailability(id: string, is_available: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase.from('products').update({ is_available }).eq('id', id).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard')
}
```

- [ ] **Step 2: Create `lib/actions/orders.ts`**

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Order, CartItem, OrderStatus } from '@/lib/types'

export async function createOrder(
  items: CartItem[],
  deliveryType: 'delivery' | 'pickup',
  address: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (items.length === 0) throw new Error('Cart is empty')

  // Group by farmer (one order per farmer)
  const byFarmer = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const fid = item.product.farmer_id
    if (!acc[fid]) acc[fid] = []
    acc[fid].push(item)
    return acc
  }, {})

  for (const [farmerId, farmerItems] of Object.entries(byFarmer)) {
    const total = farmerItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      consumer_id: user.id,
      farmer_id: farmerId,
      delivery_type: deliveryType,
      address: deliveryType === 'delivery' ? address : null,
      total_price: total,
    }).select().single()
    if (orderError) throw orderError

    const orderItems = farmerItems.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      price: i.product.price,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError
  }

  revalidatePath('/orders')
}

export async function getConsumerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, unit, image_url)), profiles!farmer_id(full_name)')
    .eq('consumer_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function getFarmerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, unit)), profiles!consumer_id(full_name, phone)')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard/orders')
}
```

- [ ] **Step 3: Create `lib/actions/profile.ts`**

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data as Profile | null
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: server actions for products, orders, and profile"
```

---

## Task 7: Product Components

**Files:**
- Create: `components/products/ProductCard.tsx`
- Create: `components/products/ProductGrid.tsx`
- Create: `components/products/ProductForm.tsx`

- [ ] **Step 1: Create `components/products/ProductCard.tsx`**

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

export default function ProductCard({ product }: { product: Product }) {
  const p = product
  return (
    <Link href={`/product/${p.id}`}>
      <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-green-400/40 transition-all hover:-translate-y-1 cursor-pointer">
        <div className="h-48 bg-gradient-to-br from-green-900/30 to-yellow-900/20 flex items-center justify-center overflow-hidden">
          {p.image_url
            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <span className="text-5xl">🌿</span>
          }
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white truncate mr-2">{p.name}</h3>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs shrink-0">{p.category}</Badge>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{p.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-bold text-lg">
              ₹{p.price}<span className="text-gray-500 text-sm font-normal">/{p.unit}</span>
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {p.delivery_type !== 'pickup' && <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Delivery</span>}
              {p.delivery_type !== 'delivery' && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Pickup</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `components/products/ProductGrid.tsx`**

```typescript
'use client'
import { useState, useTransition } from 'react'
import ProductCard from './ProductCard'
import { Button } from '@/components/ui/button'
import type { Product, ProductCategory } from '@/lib/types'

const categories: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Grains', value: 'grains' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Other', value: 'other' },
]

const deliveryFilters = [
  { label: 'All', value: 'all' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Pickup', value: 'pickup' },
]

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [category, setCategory] = useState('all')
  const [deliveryFilter, setDeliveryFilter] = useState('all')

  const filtered = products.filter(p => {
    const catMatch = category === 'all' || p.category === category
    const delMatch = deliveryFilter === 'all' ||
      (deliveryFilter === 'delivery' && p.delivery_type !== 'pickup') ||
      (deliveryFilter === 'pickup' && p.delivery_type !== 'delivery')
    return catMatch && delMatch
  })

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c.value ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-8">
        {deliveryFilters.map(d => (
          <button key={d.value} onClick={() => setDeliveryFilter(d.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${deliveryFilter === d.value ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {d.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products found for this filter.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/products/ProductForm.tsx`**

```typescript
'use client'
import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [deliveryType, setDeliveryType] = useState(product?.delivery_type ?? 'both')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('delivery_type', deliveryType)
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, formData)
          toast({ title: 'Product updated!' })
        } else {
          await createProduct(formData)
          toast({ title: 'Product listed!' })
        }
        router.push('/dashboard')
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Product Name</Label>
          <Input name="name" defaultValue={product?.name} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Fresh Tomatoes" />
        </div>
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Description</Label>
          <Textarea name="description" defaultValue={product?.description ?? ''} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="Describe your produce..." />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Price (₹)</Label>
          <Input name="price" type="number" step="0.01" defaultValue={product?.price} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="0.00" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Unit</Label>
          <Input name="unit" defaultValue={product?.unit ?? 'kg'} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="kg / dozen / piece" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Stock Available</Label>
          <Input name="stock" type="number" defaultValue={product?.stock} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="0" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Category</Label>
          <Select name="category" defaultValue={product?.category ?? 'vegetables'}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['vegetables','fruits','grains','dairy','other'].map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Delivery Type</Label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {[['both','Both'], ['delivery','Delivery Only'], ['pickup','Pickup Only']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setDeliveryType(val as any)}
                className={`p-2.5 rounded-xl border text-sm font-medium transition-colors ${deliveryType === val ? 'border-green-400 bg-green-500/20 text-green-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {deliveryType !== 'pickup' && (
          <div className="col-span-2">
            <Label className="text-gray-300 text-sm">Delivery Area</Label>
            <Input name="delivery_area" defaultValue={product?.delivery_area ?? ''} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Bangalore South" />
          </div>
        )}
        {deliveryType !== 'delivery' && (
          <div className="col-span-2">
            <Label className="text-gray-300 text-sm">Pickup Location</Label>
            <Input name="pickup_location" defaultValue={product?.pickup_location ?? ''} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Farm gate, Kolar" />
          </div>
        )}
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Product Image</Label>
          <Input name="image" type="file" accept="image/*" className="mt-1 bg-white/5 border-white/10 text-white file:bg-green-500/20 file:text-green-400 file:border-0 file:rounded-lg file:px-3 file:py-1" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="bg-green-500 hover:bg-green-400 text-black font-bold w-full">
        {isPending ? 'Saving...' : product ? 'Update Product' : 'List Product'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: product card, grid with filters, and product form"
```

---

## Task 8: Shop + Product Detail Pages

**Files:**
- Create: `app/shop/page.tsx`
- Create: `app/product/[id]/page.tsx`

- [ ] **Step 1: Create `app/shop/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ProductGrid from '@/components/products/ProductGrid'
import { getProducts } from '@/lib/actions/products'

export default async function ShopPage() {
  const products = await getProducts()
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Fresh Produce</span>
            <h1 className="text-4xl font-black text-white mt-2">Shop Direct<br/><span className="text-gray-500">from farmers.</span></h1>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Create `app/product/[id]/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProduct } from '@/lib/actions/products'
import { useCart } from '@/components/cart/CartProvider'
import { useToast } from '@/components/ui/use-toast'
import type { Product } from '@/lib/types'
import { ShoppingCart, MapPin, Truck, Store } from 'lucide-react'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    getProduct(id).then(setProduct).catch(() => router.push('/shop'))
  }, [id])

  if (!product) return (
    <main><Navbar />
      <div className="pt-32 text-center text-gray-500">Loading...</div>
    </main>
  )

  const farmer = (product as any).profiles

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-green-900/30 to-yellow-900/20 aspect-square flex items-center justify-center">
              {product.image_url
                ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                : <span className="text-8xl">🌿</span>
              }
            </div>
            <div className="flex flex-col justify-center">
              <Badge className="bg-green-500/20 text-green-400 border-0 w-fit mb-4 capitalize">{product.category}</Badge>
              <h1 className="text-4xl font-black text-white mb-4">{product.name}</h1>
              <p className="text-gray-400 mb-6">{product.description}</p>
              <div className="text-3xl font-black text-green-400 mb-2">
                ₹{product.price} <span className="text-base text-gray-500 font-normal">/ {product.unit}</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">{product.stock} {product.unit} available</p>

              {farmer && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                    {farmer.full_name?.[0] ?? 'F'}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{farmer.full_name}</p>
                    {farmer.location && <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{farmer.location}</p>}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mb-2 text-sm">
                {product.delivery_type !== 'pickup' && (
                  <div className="flex items-center gap-1.5 text-blue-400"><Truck className="w-4 h-4" />Delivery: {product.delivery_area ?? 'Contact farmer'}</div>
                )}
                {product.delivery_type !== 'delivery' && (
                  <div className="flex items-center gap-1.5 text-yellow-400"><Store className="w-4 h-4" />Pickup: {product.pickup_location ?? 'Contact farmer'}</div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <div className="flex items-center border border-white/20 rounded-lg">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-white hover:bg-white/10 rounded-l-lg">−</button>
                  <span className="px-4 py-2 text-white font-medium">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-white hover:bg-white/10 rounded-r-lg">+</button>
                </div>
                <Button onClick={() => { addItem(product, qty); toast({ title: 'Added to cart!' }) }}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: shop listing page and product detail page"
```

---

## Task 9: Cart + Checkout + Orders Pages

**Files:**
- Create: `app/cart/page.tsx`
- Create: `components/checkout/FakePaymentForm.tsx`
- Create: `app/checkout/page.tsx`
- Create: `app/orders/page.tsx`

- [ ] **Step 1: Create `app/cart/page.tsx`**

```typescript
'use client'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (items.length === 0) return (
    <main><Navbar />
      <div className="pt-32 pb-20 text-center px-4">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some fresh produce to get started.</p>
        <Link href="/shop"><Button className="bg-green-500 hover:bg-green-400 text-black font-bold">Browse Products</Button></Link>
      </div>
      <Footer />
    </main>
  )

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">Your Cart</h1>
          <div className="space-y-4 mb-8">
            {items.map(item => (
              <div key={item.product.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                <div className="w-16 h-16 rounded-xl bg-green-900/30 flex items-center justify-center overflow-hidden shrink-0">
                  {item.product.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} /> : <span className="text-2xl">🌿</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{item.product.name}</p>
                  <p className="text-green-400 text-sm">₹{item.product.price}/{item.product.unit}</p>
                </div>
                <div className="flex items-center border border-white/20 rounded-lg">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2.5 py-1.5 text-white hover:bg-white/10 rounded-l-lg text-sm">−</button>
                  <span className="px-3 py-1.5 text-white text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2.5 py-1.5 text-white hover:bg-white/10 rounded-r-lg text-sm">+</button>
                </div>
                <p className="text-white font-bold w-20 text-right">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item.product.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-white/5">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-3xl font-black text-white">₹{total.toFixed(2)}</p>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Create `components/checkout/FakePaymentForm.tsx`**

```typescript
'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/components/cart/CartProvider'
import { createOrder } from '@/lib/actions/orders'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function FakePaymentForm() {
  const { items, total, clearCart } = useCart()
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const handlePay = () => {
    if (deliveryType === 'delivery' && !address.trim()) {
      toast({ title: 'Enter delivery address', variant: 'destructive' })
      return
    }
    startTransition(async () => {
      try {
        await createOrder(items, deliveryType, address)
        clearCart()
        toast({ title: 'Order placed!', description: 'Farmer will confirm soon.' })
        router.push('/orders')
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' })
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Delivery method */}
      <div>
        <Label className="text-gray-300 text-sm mb-2 block">Delivery Method</Label>
        <div className="grid grid-cols-2 gap-3">
          {[['delivery','🚚 Home Delivery'], ['pickup','🏪 Farm Pickup']].map(([val, label]) => (
            <button key={val} onClick={() => setDeliveryType(val as any)}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors ${deliveryType === val ? 'border-green-400 bg-green-500/20 text-green-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {deliveryType === 'delivery' && (
        <div>
          <Label className="text-gray-300 text-sm">Delivery Address</Label>
          <Input value={address} onChange={e => setAddress(e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white" placeholder="Full address including pincode" />
        </div>
      )}

      {/* Fake payment UI */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Payment Details (Demo)</p>
        <div className="flex gap-3 mb-4">
          {[['upi','UPI'], ['card','Card']].map(([val, label]) => (
            <button key={val} onClick={() => setPayMethod(val as any)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${payMethod === val ? 'bg-yellow-500 text-black font-bold' : 'bg-white/10 text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>
        {payMethod === 'upi' ? (
          <div>
            <Label className="text-gray-300 text-sm">UPI ID</Label>
            <Input defaultValue="farmer@upi" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
            <p className="text-yellow-400/60 text-xs mt-2">⚠️ This is a demo — no real payment processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-gray-300 text-sm">Card Number</Label>
              <Input defaultValue="4242 4242 4242 4242" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300 text-sm">Expiry</Label>
                <Input defaultValue="12/28" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">CVV</Label>
                <Input defaultValue="123" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
              </div>
            </div>
            <p className="text-yellow-400/60 text-xs">⚠️ This is a demo — no real payment processed</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
        <span className="text-gray-400">Total</span>
        <span className="text-2xl font-black text-white">₹{total.toFixed(2)}</span>
      </div>

      <Button onClick={handlePay} disabled={isPending} size="lg"
        className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-black text-base">
        {isPending ? 'Placing Order...' : `Pay ₹${total.toFixed(2)}`}
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/checkout/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import FakePaymentForm from '@/components/checkout/FakePaymentForm'

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-10 text-center">Checkout</h1>
          <FakePaymentForm />
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 4: Create `app/orders/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { getConsumerOrders } from '@/lib/actions/orders'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
}

export default async function OrdersPage() {
  const orders: Order[] = await getConsumerOrders()

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">My Orders</h1>
          {orders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No orders yet. <a href="/shop" className="text-green-400 hover:underline">Start shopping!</a></div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-bold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status]}`}>{order.status}</span>
                  </div>
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-t border-white/5">
                      <span className="text-gray-300">{(item as any).products?.name} × {item.quantity} {(item as any).products?.unit}</span>
                      <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-white/10 mt-2">
                    <span className="text-gray-400 text-sm capitalize">{order.delivery_type}</span>
                    <span className="text-green-400 font-bold">₹{order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: cart, checkout with fake payment UI, and consumer orders page"
```

---

## Task 10: Farmer Dashboard

**Files:**
- Create: `components/dashboard/StatsCards.tsx`
- Create: `components/dashboard/ListingsGrid.tsx`
- Create: `components/dashboard/OrdersTable.tsx`
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/add-product/page.tsx`
- Create: `app/dashboard/edit-product/[id]/page.tsx`
- Create: `app/dashboard/orders/page.tsx`

- [ ] **Step 1: Create `components/dashboard/StatsCards.tsx`**

```typescript
interface StatsCardsProps {
  productCount: number
  orderCount: number
  pendingCount: number
}

export default function StatsCards({ productCount, orderCount, pendingCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Active Listings', value: productCount, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Total Orders', value: orderCount, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Pending Orders', value: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      ].map(stat => (
        <div key={stat.label} className={`${stat.bg} rounded-2xl p-6 border border-white/10`}>
          <p className="text-gray-400 text-sm">{stat.label}</p>
          <p className={`text-4xl font-black ${stat.color} mt-1`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/dashboard/ListingsGrid.tsx`**

```typescript
'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteProduct, toggleProductAvailability } from '@/lib/actions/products'
import { useToast } from '@/components/ui/use-toast'
import type { Product } from '@/lib/types'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

export default function ListingsGrid({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return
    startTransition(async () => {
      try { await deleteProduct(id); toast({ title: 'Product deleted' }) }
      catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }) }
    })
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      try { await toggleProductAvailability(id, !current); toast({ title: !current ? 'Product visible' : 'Product hidden' }) }
      catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }) }
    })
  }

  if (products.length === 0) return (
    <div className="text-center py-16 text-gray-500">
      <p className="mb-4">No products listed yet.</p>
      <Link href="/dashboard/add-product"><Button className="bg-green-500 hover:bg-green-400 text-black font-bold">Add First Product</Button></Link>
    </div>
  )

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map(p => (
        <div key={p.id} className={`rounded-2xl border bg-white/5 overflow-hidden ${p.is_available ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
          <div className="h-36 bg-green-900/20 flex items-center justify-center overflow-hidden">
            {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🌿</span>}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-white mb-1 truncate">{p.name}</h3>
            <p className="text-green-400 font-bold text-sm">₹{p.price}/{p.unit}</p>
            <p className="text-gray-500 text-xs mt-1">Stock: {p.stock} {p.unit}</p>
            <div className="flex gap-2 mt-4">
              <Link href={`/dashboard/edit-product/${p.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-xs">
                  <Pencil className="w-3 h-3 mr-1" />Edit
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => handleToggle(p.id, p.is_available)}
                className="text-gray-400 hover:text-white" disabled={isPending}>
                {p.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}
                className="text-red-400 hover:text-red-300" disabled={isPending}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/dashboard/OrdersTable.tsx`**

```typescript
'use client'
import { useTransition } from 'react'
import { updateOrderStatus } from '@/lib/actions/orders'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import type { Order, OrderStatus } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  confirmed: 'text-blue-400',
  shipped: 'text-purple-400',
  delivered: 'text-green-400',
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleStatus = (orderId: string, status: OrderStatus) => {
    startTransition(async () => {
      try { await updateOrderStatus(orderId, status); toast({ title: 'Status updated' }) }
      catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }) }
    })
  }

  if (orders.length === 0) return <div className="text-center py-16 text-gray-500">No orders yet.</div>

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const consumer = (order as any).profiles
        return (
          <div key={order.id} className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-white font-bold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                {consumer && <p className="text-gray-400 text-sm mt-1">👤 {consumer.full_name}{consumer.phone ? ` · ${consumer.phone}` : ''}</p>}
                <p className="text-gray-500 text-xs mt-1 capitalize">{order.delivery_type}{order.address ? `: ${order.address}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold capitalize ${statusColors[order.status]}`}>{order.status}</span>
                <Select defaultValue={order.status} onValueChange={v => handleStatus(order.id, v as OrderStatus)} disabled={isPending}>
                  <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['pending','confirmed','shipped','delivered'].map(s => (
                      <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-t border-white/5">
                <span className="text-gray-300">{(item as any).products?.name} × {item.quantity} {(item as any).products?.unit}</span>
                <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-end pt-3 border-t border-white/10 mt-2">
              <span className="text-green-400 font-bold">₹{order.total_price.toFixed(2)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/dashboard/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import StatsCards from '@/components/dashboard/StatsCards'
import ListingsGrid from '@/components/dashboard/ListingsGrid'
import { getFarmerProducts } from '@/lib/actions/products'
import { getFarmerOrders } from '@/lib/actions/orders'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const [products, orders] = await Promise.all([getFarmerProducts(), getFarmerOrders()])
  const pending = orders.filter(o => o.status === 'pending').length

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Farmer</span>
              <h1 className="text-3xl font-black text-white mt-1">My Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/orders">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">View Orders {pending > 0 && <span className="ml-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{pending}</span>}</Button>
              </Link>
              <Link href="/dashboard/add-product">
                <Button className="bg-green-500 hover:bg-green-400 text-black font-bold"><Plus className="w-4 h-4 mr-1" />Add Product</Button>
              </Link>
            </div>
          </div>
          <StatsCards productCount={products.length} orderCount={orders.length} pendingCount={pending} />
          <h2 className="text-xl font-bold text-white mb-5">My Listings</h2>
          <ListingsGrid products={products} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 5: Create `app/dashboard/add-product/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ProductForm from '@/components/products/ProductForm'

export default function AddProductPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">List New Product</h1>
          <ProductForm />
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 6: Create `app/dashboard/edit-product/[id]/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ProductForm from '@/components/products/ProductForm'
import { getProduct } from '@/lib/actions/products'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">Edit Product</h1>
          <ProductForm product={product} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 7: Create `app/dashboard/orders/page.tsx`**

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import OrdersTable from '@/components/dashboard/OrdersTable'
import { getFarmerOrders } from '@/lib/actions/orders'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function FarmerOrdersPage() {
  const orders = await getFarmerOrders()
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4 mr-1" />Dashboard</Button></Link>
            <h1 className="text-3xl font-black text-white">Incoming Orders</h1>
          </div>
          <OrdersTable orders={orders} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: farmer dashboard with listings, orders, and product management"
```

---

## Task 11: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

Create a new GitHub repo (via GitHub UI), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/agrilink.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Deploy to Vercel**

1. Go to vercel.com → New Project → Import your `agrilink` GitHub repo
2. Framework: Next.js (auto-detected)
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
   - `NEXT_PUBLIC_SITE_URL` → your Vercel deployment URL (e.g. `https://agrilink.vercel.app`)
4. Click Deploy

- [ ] **Step 3: Update Supabase OAuth redirect URL**

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://agrilink.vercel.app`
- Redirect URLs: add `https://agrilink.vercel.app/auth/callback`

In Google Cloud Console → OAuth credentials:
- Add `https://agrilink.vercel.app/auth/callback` to authorized redirect URIs

- [ ] **Step 4: Verify deployed app**

Visit your Vercel URL. Test the golden path:
1. Register as farmer → add a product with image → view it on /shop
2. Register as consumer → add product to cart → checkout → see order on /orders
3. Switch to farmer → see order on /dashboard/orders → update status

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: production config and deployment"
git push
```

---

## Post-MVP Reminders (do NOT implement now)
- Razorpay real payment integration
- SMS notifications (Twilio or similar)
- Farmer public profile pages (`/farmer/[id]`)
- Reviews and ratings
- Advanced search
- Meta login (when account stabilizes)
