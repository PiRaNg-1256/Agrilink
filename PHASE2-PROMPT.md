# Agrilink Phase 2 — New Session Prompt

Paste everything between the === markers into a new Claude Code session.

===

## FIRST: Invoke These Skills Before Anything Else
1. `caveman:caveman` — keeps all responses ultra-terse, saves tokens
2. `superpowers:subagent-driven-development` — dispatches fresh subagents per task, protects main context window
3. Use `TodoWrite` to track all tasks

---

## About This User
Non-developer. Very limited coding experience. If any step requires manual action in a browser or terminal, stop and give exact step-by-step instructions. Wait for confirmation. Do not assume knowledge of any tool or platform.

---

## Project Context
- Next.js 15 + Tailwind + Supabase + GSAP + Vercel
- Working directory: `D:\Agrilink`
- Live site: https://agrilink-6xmh.vercel.app
- Supabase project: https://zpxzpuobpzhbtubhmmfl.supabase.co
- Read these for full context: `docs/superpowers/specs/2026-05-05-agrilink-design.md`
- Style: dark navy `#0d0d1a` bg, green `#22c55e`, yellow `#facc15`
- Auth: email/password only (no Google OAuth, no Razorpay — both dropped permanently)

---

## New DB Tables Needed (Manual Step — Do This First)

Tell user:
> "We need to add 3 new tables to the database. Follow these steps:"
> 1. Go to https://supabase.com/dashboard/project/zpxzpuobpzhbtubhmmfl/sql/new
> 2. Paste this SQL and click Run:

```sql
-- Reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  consumer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(product_id, consumer_id)
);

-- Wishlists table
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(consumer_id, product_id)
);

-- Favourite farmers table
create table public.favourite_farmers (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid references public.profiles(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(consumer_id, farmer_id)
);

-- RLS
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.favourite_farmers enable row level security;

create policy "Reviews public read" on public.reviews for select using (true);
create policy "Consumers write own reviews" on public.reviews for insert with check (auth.uid() = consumer_id);
create policy "Consumers delete own reviews" on public.reviews for delete using (auth.uid() = consumer_id);

create policy "Consumers manage wishlists" on public.wishlists for all using (auth.uid() = consumer_id);
create policy "Consumers manage favourites" on public.favourite_farmers for all using (auth.uid() = consumer_id);
```

> 3. You should see "Success. No rows returned"
> 4. Tell me when done.

Wait for confirmation before writing any code.

---

## TASK 1 — Fix Product Images + Fake Data on Shop Page

### 1a: Fix Fake Product Images (landing page)
File: `components/landing/FeaturedProducts.tsx`

Replace all `image_url` values in `FAKE_PRODUCTS` with these reliable Unsplash URLs:

```typescript
const FAKE_PRODUCTS = [
  { id: 'f1', name: 'Fresh Tomatoes', category: 'vegetables', price: 35, unit: 'kg', description: 'Sun-ripened tomatoes grown without pesticides in Karnataka highlands.', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop', farmer_name: 'Ravi Kumar', farmer_location: 'Kolar, Karnataka', delivery_type: 'both' },
  { id: 'f2', name: 'Alphonso Mangoes', category: 'fruits', price: 280, unit: 'dozen', description: 'Premium Alphonso mangoes from Ratnagiri. Sweet, aromatic, naturally ripened.', image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&auto=format&fit=crop', farmer_name: 'Suresh Patil', farmer_location: 'Ratnagiri, Maharashtra', delivery_type: 'delivery' },
  { id: 'f3', name: 'Organic Spinach', category: 'vegetables', price: 25, unit: 'bunch', description: 'Fresh organic spinach, harvested daily. Rich in iron and nutrients.', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop', farmer_name: 'Meena Devi', farmer_location: 'Mysuru, Karnataka', delivery_type: 'both' },
  { id: 'f4', name: 'A2 Cow Milk', category: 'dairy', price: 80, unit: 'litre', description: 'Pure A2 milk from grass-fed Gir cows. No hormones, no preservatives.', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop', farmer_name: 'Gopalan Nair', farmer_location: 'Thrissur, Kerala', delivery_type: 'delivery' },
  { id: 'f5', name: 'Brown Rice', category: 'grains', price: 95, unit: 'kg', description: 'Traditional brown rice from Cauvery delta. Unpolished, naturally nutritious.', image_url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop', farmer_name: 'Arumugam S', farmer_location: 'Thanjavur, Tamil Nadu', delivery_type: 'pickup' },
  { id: 'f6', name: 'Green Chilies', category: 'vegetables', price: 60, unit: 'kg', description: 'Freshly picked green chilies from Guntur farms. Medium-hot, packed with flavour.', image_url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&auto=format&fit=crop', farmer_name: 'Venkat Reddy', farmer_location: 'Guntur, Andhra Pradesh', delivery_type: 'both' },
]
```

### 1b: Fake Data on /shop Page
Files: `lib/actions/products.ts`, `app/shop/page.tsx`, `components/products/ProductGrid.tsx`

The `/shop` page calls `getProducts()` from Supabase. When DB has fewer than 5 real products, merge fake products so shop always looks full.

Create file `lib/fakeData.ts` with 24 fake products across all categories:

```typescript
import type { Product } from './types'

export const FAKE_SHOP_PRODUCTS: Product[] = [
  // VEGETABLES (8)
  { id: 'fake-1', farmer_id: 'fake-farmer-1', name: 'Fresh Tomatoes', description: 'Sun-ripened, pesticide-free tomatoes from Karnataka highlands. Perfect for curries and salads.', price: 35, unit: 'kg', stock: 50, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Bangalore', pickup_location: 'Kolar Farm Gate', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-1', role: 'farmer', full_name: 'Ravi Kumar', phone: null, location: 'Kolar, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-2', farmer_id: 'fake-farmer-2', name: 'Organic Spinach', description: 'Harvested fresh every morning. Iron-rich, no chemicals. Perfect for palak paneer.', price: 25, unit: 'bunch', stock: 30, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Mysuru', pickup_location: 'Devi Farm, Mysuru', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-2', role: 'farmer', full_name: 'Meena Devi', phone: null, location: 'Mysuru, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-3', farmer_id: 'fake-farmer-3', name: 'Green Chilies', description: 'Medium-hot Guntur green chilies. Freshly picked, packed with flavour and vitamin C.', price: 60, unit: 'kg', stock: 20, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Hyderabad', pickup_location: 'Venkat Farm, Guntur', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-3', role: 'farmer', full_name: 'Venkat Reddy', phone: null, location: 'Guntur, Andhra Pradesh', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-4', farmer_id: 'fake-farmer-4', name: 'Baby Potatoes', description: 'Small, tender baby potatoes. Great for roasting and curries. Grown in Nilgiris highlands.', price: 45, unit: 'kg', stock: 40, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1518977676405-7e8a02e0c71d?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Chennai, Coimbatore', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-4', role: 'farmer', full_name: 'Lakshmi Sundaram', phone: null, location: 'Ooty, Tamil Nadu', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-5', farmer_id: 'fake-farmer-5', name: 'Purple Brinjal', description: 'Traditional Karnataka brinjal variety. Perfect for ennegayi and baingan bharta.', price: 30, unit: 'kg', stock: 25, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Dharwad', pickup_location: 'Kumar Farm, Dharwad', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-1', role: 'farmer', full_name: 'Ravi Kumar', phone: null, location: 'Kolar, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-6', farmer_id: 'fake-farmer-2', name: 'Drumstick (Moringa)', description: 'Fresh moringa pods from organic farm. Packed with nutrients. Sambar ready.', price: 50, unit: 'kg', stock: 15, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop', delivery_type: 'pickup', delivery_area: null, pickup_location: 'Devi Farm, Mysuru', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-2', role: 'farmer', full_name: 'Meena Devi', phone: null, location: 'Mysuru, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-7', farmer_id: 'fake-farmer-6', name: 'Fresh Garlic', description: 'Strong, pungent garlic from Rajasthan. Longer shelf life, intense flavour.', price: 120, unit: 'kg', stock: 30, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1501200291289-c5a76c232e5f?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pan India', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-6', role: 'farmer', full_name: 'Ramesh Sharma', phone: null, location: 'Barmer, Rajasthan', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-8', farmer_id: 'fake-farmer-4', name: 'Sweet Corn', description: 'Freshly harvested sweet corn from Nilgiris. Best eaten boiled or roasted the same day.', price: 15, unit: 'piece', stock: 100, category: 'vegetables', image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop', delivery_type: 'pickup', delivery_area: null, pickup_location: 'Nilgiris Farm, Ooty', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-4', role: 'farmer', full_name: 'Lakshmi Sundaram', phone: null, location: 'Ooty, Tamil Nadu', avatar_url: null, created_at: new Date().toISOString() } as any },
  // FRUITS (5)
  { id: 'fake-9', farmer_id: 'fake-farmer-7', name: 'Alphonso Mangoes', description: 'GI-tagged Ratnagiri Alphonso. Naturally ripened, zero calcium carbide. Limited season.', price: 280, unit: 'dozen', stock: 20, category: 'fruits', image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Mumbai, Pune, Bangalore', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-7', role: 'farmer', full_name: 'Suresh Patil', phone: null, location: 'Ratnagiri, Maharashtra', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-10', farmer_id: 'fake-farmer-8', name: 'Bananas (Nendran)', description: 'Kerala Nendran bananas. Large, starchy, perfect for chips and desserts.', price: 80, unit: 'dozen', stock: 40, category: 'fruits', image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Kochi, Thrissur', pickup_location: 'Nair Farm, Thrissur', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-8', role: 'farmer', full_name: 'Gopalan Nair', phone: null, location: 'Thrissur, Kerala', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-11', farmer_id: 'fake-farmer-5', name: 'Pomegranate', description: 'Solapur pomegranates. Deep red arils, naturally sweet, high in antioxidants.', price: 150, unit: 'kg', stock: 25, category: 'fruits', image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f1?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pune, Mumbai, Hyderabad', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-5', role: 'farmer', full_name: 'Prakash Desai', phone: null, location: 'Solapur, Maharashtra', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-12', farmer_id: 'fake-farmer-4', name: 'Strawberries', description: 'Mahabaleshwar strawberries. Grown at 1300m altitude. Sweet-tart, freshly picked.', price: 120, unit: '250g box', stock: 15, category: 'fruits', image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Mumbai, Pune', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-4', role: 'farmer', full_name: 'Lakshmi Sundaram', phone: null, location: 'Ooty, Tamil Nadu', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-13', farmer_id: 'fake-farmer-6', name: 'Watermelon', description: 'Rajasthan watermelons. Extra sweet due to dry climate. 4-6 kg each.', price: 25, unit: 'kg', stock: 30, category: 'fruits', image_url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop', delivery_type: 'pickup', delivery_area: null, pickup_location: 'Sharma Farm, Barmer', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-6', role: 'farmer', full_name: 'Ramesh Sharma', phone: null, location: 'Barmer, Rajasthan', avatar_url: null, created_at: new Date().toISOString() } as any },
  // GRAINS (3)
  { id: 'fake-14', farmer_id: 'fake-farmer-9', name: 'Brown Rice (Sona Masoori)', description: 'Unpolished Sona Masoori from Cauvery delta. Traditional variety, low GI index.', price: 95, unit: 'kg', stock: 100, category: 'grains', image_url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Pan India', pickup_location: 'Arumugam Farm, Thanjavur', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-9', role: 'farmer', full_name: 'Arumugam S', phone: null, location: 'Thanjavur, Tamil Nadu', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-15', farmer_id: 'fake-farmer-6', name: 'Bajra (Pearl Millet)', description: 'Rajasthani bajra. Gluten-free, high protein. Freshly harvested this season.', price: 45, unit: 'kg', stock: 80, category: 'grains', image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pan India', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-6', role: 'farmer', full_name: 'Ramesh Sharma', phone: null, location: 'Barmer, Rajasthan', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-16', farmer_id: 'fake-farmer-9', name: 'Toor Dal (Pigeon Pea)', description: 'Premium Toor Dal from Andhra. Split pigeon peas, unpolished. Higher protein content.', price: 130, unit: 'kg', stock: 60, category: 'grains', image_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pan India', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-9', role: 'farmer', full_name: 'Arumugam S', phone: null, location: 'Thanjavur, Tamil Nadu', avatar_url: null, created_at: new Date().toISOString() } as any },
  // DAIRY (4)
  { id: 'fake-17', farmer_id: 'fake-farmer-8', name: 'A2 Gir Cow Milk', description: 'Pure A2 milk from grass-fed Gir cows. No hormones, no preservatives. Same-day delivery.', price: 80, unit: 'litre', stock: 20, category: 'dairy', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Kochi, Thrissur, Palakkad', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-8', role: 'farmer', full_name: 'Gopalan Nair', phone: null, location: 'Thrissur, Kerala', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-18', farmer_id: 'fake-farmer-8', name: 'Homemade Ghee', description: 'Traditionally churned ghee from A2 milk. Grainy texture, nutty aroma. No additives.', price: 950, unit: '500ml jar', stock: 10, category: 'dairy', image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pan India', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-8', role: 'farmer', full_name: 'Gopalan Nair', phone: null, location: 'Thrissur, Kerala', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-19', farmer_id: 'fake-farmer-2', name: 'Buffalo Curd', description: 'Thick, creamy set curd from buffalo milk. Made fresh every morning. Great with rice.', price: 60, unit: 'kg', stock: 15, category: 'dairy', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Mysuru', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-2', role: 'farmer', full_name: 'Meena Devi', phone: null, location: 'Mysuru, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-20', farmer_id: 'fake-farmer-7', name: 'Farm Fresh Eggs', description: 'Free-range country chicken eggs. Deep orange yolk, rich taste. Collected daily.', price: 90, unit: 'dozen', stock: 40, category: 'dairy', image_url: 'https://images.unsplash.com/photo-1518569656558-1f25e69d2491?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Ratnagiri, Mumbai', pickup_location: 'Patil Farm, Ratnagiri', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-7', role: 'farmer', full_name: 'Suresh Patil', phone: null, location: 'Ratnagiri, Maharashtra', avatar_url: null, created_at: new Date().toISOString() } as any },
  // OTHER (4)
  { id: 'fake-21', farmer_id: 'fake-farmer-2', name: 'Tulsi Honey', description: 'Raw, unprocessed honey from Mysuru forest apiaries. Tulsi flower variety. Medicinal quality.', price: 450, unit: '500g jar', stock: 12, category: 'other', image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pan India', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-2', role: 'farmer', full_name: 'Meena Devi', phone: null, location: 'Mysuru, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-22', farmer_id: 'fake-farmer-3', name: 'Cold-Pressed Groundnut Oil', description: 'Traditional wood-pressed groundnut oil from Guntur. No chemicals, full flavour.', price: 280, unit: 'litre', stock: 20, category: 'other', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Hyderabad, Chennai', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-3', role: 'farmer', full_name: 'Venkat Reddy', phone: null, location: 'Guntur, Andhra Pradesh', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-23', farmer_id: 'fake-farmer-1', name: 'Dried Red Chilies', description: 'Byadagi variety dried chilies from Karnataka. Deep red colour, medium heat, rich flavour.', price: 200, unit: 'kg', stock: 25, category: 'other', image_url: 'https://images.unsplash.com/photo-1573565277991-4f1786fbbf45?w=400&auto=format&fit=crop', delivery_type: 'delivery', delivery_area: 'Pan India', pickup_location: null, is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-1', role: 'farmer', full_name: 'Ravi Kumar', phone: null, location: 'Kolar, Karnataka', avatar_url: null, created_at: new Date().toISOString() } as any },
  { id: 'fake-24', farmer_id: 'fake-farmer-9', name: 'Coconut (Fresh)', description: 'Fresh Kerala coconuts. Tender water coconut and mature coconut both available.', price: 25, unit: 'piece', stock: 60, category: 'other', image_url: 'https://images.unsplash.com/photo-1580984969071-a8da8e0571d3?w=400&auto=format&fit=crop', delivery_type: 'both', delivery_area: 'Chennai, Coimbatore', pickup_location: 'Arumugam Farm, Thanjavur', is_available: true, created_at: new Date().toISOString(), profiles: { id: 'fake-farmer-9', role: 'farmer', full_name: 'Arumugam S', phone: null, location: 'Thanjavur, Tamil Nadu', avatar_url: null, created_at: new Date().toISOString() } as any },
]

export const FAKE_FARMERS = [
  { id: 'fake-farmer-1', role: 'farmer' as const, full_name: 'Ravi Kumar', location: 'Kolar, Karnataka', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-2', role: 'farmer' as const, full_name: 'Meena Devi', location: 'Mysuru, Karnataka', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-3', role: 'farmer' as const, full_name: 'Venkat Reddy', location: 'Guntur, Andhra Pradesh', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-4', role: 'farmer' as const, full_name: 'Lakshmi Sundaram', location: 'Ooty, Tamil Nadu', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-5', role: 'farmer' as const, full_name: 'Prakash Desai', location: 'Solapur, Maharashtra', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-6', role: 'farmer' as const, full_name: 'Ramesh Sharma', location: 'Barmer, Rajasthan', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-7', role: 'farmer' as const, full_name: 'Suresh Patil', location: 'Ratnagiri, Maharashtra', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-8', role: 'farmer' as const, full_name: 'Gopalan Nair', location: 'Thrissur, Kerala', phone: null, avatar_url: null, created_at: new Date().toISOString() },
  { id: 'fake-farmer-9', role: 'farmer' as const, full_name: 'Arumugam S', location: 'Thanjavur, Tamil Nadu', phone: null, avatar_url: null, created_at: new Date().toISOString() },
]
```

Modify `lib/actions/products.ts` → `getProducts()`: after fetching from Supabase, if `data.length < 5`, append `FAKE_SHOP_PRODUCTS` filtered by category if applicable, deduplicated by id.

Also modify `getProduct(id)` to check if id starts with `'fake-'` and return from `FAKE_SHOP_PRODUCTS` directly (no DB call).

Fake products are NOT purchasable (if user tries to add to cart and checkout, it completes successfully as a fake transaction). The `createOrder` action should handle `farmer_id` starting with `'fake-'` by skipping the real DB insert and returning a fake success. Create a fake order object and redirect to `/orders?demo=1`. On `/orders` page, if `?demo=1` in URL, show a fake demo order at top with status "confirmed".

---

## TASK 2 — Multi-Language Support (English / Hindi / Kannada)

**Approach:** Simple context-based i18n (no URL routing changes, no next-intl install needed). Language stored in localStorage. Language switcher in Navbar.

Create `lib/i18n/translations.ts` with all UI strings:

```typescript
export type Locale = 'en' | 'hi' | 'kn'

export const translations = {
  en: {
    nav: { shop: 'Shop', dashboard: 'Dashboard', signOut: 'Sign Out', getStarted: 'Get Started' },
    hero: { badge: 'Direct Farm to Consumer', headline1: 'Farm Fresh.', headline2: 'Direct to You.', sub: 'Agrilink connects small-scale farmers directly with consumers — no middlemen, fairer prices, fresher produce.', cta1: 'Shop Fresh Produce', cta2: 'Join as Farmer' },
    howItWorks: { label: 'How It Works', title: 'From field to table,', titleGray: 'simplified.', step1Title: 'Farmers List Produce', step1Desc: 'Small-scale farmers create listings with prices, availability, and delivery options — directly on Agrilink.', step2Title: 'Consumers Browse & Order', step2Desc: 'Buyers discover local farmers, browse fresh produce, and place orders with a single click.', step3Title: 'Direct Delivery or Pickup', step3Desc: 'Farmers deliver to your door or you pick up locally — zero middlemen, maximum freshness.' },
    shop: { title: 'Shop Direct', subtitle: 'from farmers.', searchPlaceholder: 'Search products, farmers...', filters: { all: 'All', delivery: 'Delivery', pickup: 'Pickup' }, categories: { all: 'All', vegetables: 'Vegetables', fruits: 'Fruits', grains: 'Grains', dairy: 'Dairy', other: 'Other' }, priceRange: 'Price Range', noResults: 'No products found.' },
    product: { addToCart: 'Add to Cart', inStock: 'available', deliveryArea: 'Delivery Area', pickupAt: 'Pickup At' },
    cart: { title: 'Your Cart', empty: 'Your cart is empty', browseProducts: 'Browse Products', total: 'Total', checkout: 'Proceed to Checkout' },
    checkout: { title: 'Checkout', deliveryMethod: 'Delivery Method', homeDelivery: 'Home Delivery', farmPickup: 'Farm Pickup', deliveryAddress: 'Delivery Address', paymentDetails: 'Payment Details (Demo)', pay: 'Pay', placing: 'Placing Order...' },
    orders: { title: 'My Orders', noOrders: 'No orders yet.', reorder: 'Reorder', status: { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered' } },
    auth: { signIn: 'Sign In', register: 'Register', email: 'Email', password: 'Password', fullName: 'Full Name', iAmA: 'I am a...', consumer: 'Consumer', farmer: 'Farmer', createAccount: 'Create Account', loading: 'Loading...' },
    footer: { tagline: 'Empowering farmers. Connecting communities. Fresh from the source.', shop: 'Shop', join: 'Join', rights: '© 2026 Agrilink. All rights reserved.' },
    seasonalHighlights: { label: 'Season\'s Best', title: 'What\'s fresh', titleGreen: 'right now.' },
    cropPrices: { label: 'Live Market', title: 'Today\'s Crop Prices', subtitle: 'Live MSP + mandi rates updated every 30 seconds', lastUpdated: 'Last updated' },
  },
  hi: {
    nav: { shop: 'दुकान', dashboard: 'डैशबोर्ड', signOut: 'साइन आउट', getStarted: 'शुरू करें' },
    hero: { badge: 'सीधे खेत से उपभोक्ता तक', headline1: 'खेत से ताज़ा।', headline2: 'सीधे आपके पास।', sub: 'एग्रीलिंक छोटे किसानों को सीधे उपभोक्ताओं से जोड़ता है — कोई बिचौलिया नहीं, उचित मूल्य, ताज़ा उपज।', cta1: 'ताज़ी उपज खरीदें', cta2: 'किसान के रूप में जुड़ें' },
    howItWorks: { label: 'कैसे काम करता है', title: 'खेत से थाली तक,', titleGray: 'सरल बना दिया।', step1Title: 'किसान उपज सूचीबद्ध करते हैं', step1Desc: 'छोटे किसान सीधे एग्रीलिंक पर मूल्य, उपलब्धता और डिलीवरी विकल्पों के साथ लिस्टिंग बनाते हैं।', step2Title: 'उपभोक्ता ब्राउज़ और ऑर्डर करते हैं', step2Desc: 'खरीदार स्थानीय किसानों को खोजते हैं, ताज़ी उपज ब्राउज़ करते हैं, और एक क्लिक में ऑर्डर देते हैं।', step3Title: 'सीधी डिलीवरी या पिकअप', step3Desc: 'किसान आपके दरवाजे तक पहुँचाते हैं या आप स्थानीय रूप से पिकअप करें — कोई बिचौलिया नहीं, अधिकतम ताज़गी।' },
    shop: { title: 'सीधे खरीदें', subtitle: 'किसानों से।', searchPlaceholder: 'उत्पाद, किसान खोजें...', filters: { all: 'सभी', delivery: 'डिलीवरी', pickup: 'पिकअप' }, categories: { all: 'सभी', vegetables: 'सब्जियाँ', fruits: 'फल', grains: 'अनाज', dairy: 'डेयरी', other: 'अन्य' }, priceRange: 'मूल्य सीमा', noResults: 'कोई उत्पाद नहीं मिला।' },
    product: { addToCart: 'कार्ट में जोड़ें', inStock: 'उपलब्ध', deliveryArea: 'डिलीवरी क्षेत्र', pickupAt: 'पिकअप यहाँ' },
    cart: { title: 'आपकी कार्ट', empty: 'आपकी कार्ट खाली है', browseProducts: 'उत्पाद देखें', total: 'कुल', checkout: 'चेकआउट करें' },
    checkout: { title: 'चेकआउट', deliveryMethod: 'डिलीवरी विधि', homeDelivery: 'घर पर डिलीवरी', farmPickup: 'खेत से पिकअप', deliveryAddress: 'डिलीवरी पता', paymentDetails: 'भुगतान विवरण (डेमो)', pay: 'भुगतान करें', placing: 'ऑर्डर दे रहे हैं...' },
    orders: { title: 'मेरे ऑर्डर', noOrders: 'अभी तक कोई ऑर्डर नहीं।', reorder: 'फिर से ऑर्डर करें', status: { pending: 'लंबित', confirmed: 'पुष्टि हुई', shipped: 'भेजा गया', delivered: 'डिलीवर हुआ' } },
    auth: { signIn: 'साइन इन', register: 'पंजीकरण', email: 'ईमेल', password: 'पासवर्ड', fullName: 'पूरा नाम', iAmA: 'मैं हूँ...', consumer: 'उपभोक्ता', farmer: 'किसान', createAccount: 'खाता बनाएँ', loading: 'लोड हो रहा है...' },
    footer: { tagline: 'किसानों को सशक्त करना। समुदायों को जोड़ना। सीधे स्रोत से ताज़ा।', shop: 'दुकान', join: 'जुड़ें', rights: '© 2026 एग्रीलिंक। सर्वाधिकार सुरक्षित।' },
    seasonalHighlights: { label: 'मौसम का सर्वश्रेष्ठ', title: 'अभी क्या ताज़ा है', titleGreen: 'इस मौसम में।' },
    cropPrices: { label: 'लाइव बाज़ार', title: 'आज के फसल मूल्य', subtitle: 'हर 30 सेकंड में अपडेट होने वाली MSP + मंडी दरें', lastUpdated: 'अंतिम अपडेट' },
  },
  kn: {
    nav: { shop: 'ಅಂಗಡಿ', dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', signOut: 'ಸೈನ್ ಔಟ್', getStarted: 'ಪ್ರಾರಂಭಿಸಿ' },
    hero: { badge: 'ನೇರ ಹೊಲದಿಂದ ಗ್ರಾಹಕರಿಗೆ', headline1: 'ಹೊಲದ ತಾಜಾ.', headline2: 'ನೇರ ನಿಮ್ಮ ಕೈಗೆ.', sub: 'ಎಗ್ರಿಲಿಂಕ್ ಸಣ್ಣ ರೈತರನ್ನು ನೇರವಾಗಿ ಗ್ರಾಹಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ — ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ, ನ್ಯಾಯೋಚಿತ ಬೆಲೆ, ತಾಜಾ ಉತ್ಪನ್ನ.', cta1: 'ತಾಜಾ ಉತ್ಪನ್ನ ಕೊಳ್ಳಿ', cta2: 'ರೈತರಾಗಿ ಸೇರಿ' },
    howItWorks: { label: 'ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', title: 'ಹೊಲದಿಂದ ಮೇಜಿಗೆ,', titleGray: 'ಸರಳವಾಗಿಸಲಾಗಿದೆ.', step1Title: 'ರೈತರು ಉತ್ಪನ್ನ ಪಟ್ಟಿ ಮಾಡುತ್ತಾರೆ', step1Desc: 'ಸಣ್ಣ ರೈತರು ಬೆಲೆ, ಲಭ್ಯತೆ ಮತ್ತು ವಿತರಣಾ ಆಯ್ಕೆಗಳೊಂದಿಗೆ ನೇರವಾಗಿ ಎಗ್ರಿಲಿಂಕ್‌ನಲ್ಲಿ ಪಟ್ಟಿಗಳನ್ನು ರಚಿಸುತ್ತಾರೆ.', step2Title: 'ಗ್ರಾಹಕರು ಬ್ರೌಸ್ ಮತ್ತು ಆರ್ಡರ್ ಮಾಡುತ್ತಾರೆ', step2Desc: 'ಖರೀದಿದಾರರು ಸ್ಥಳೀಯ ರೈತರನ್ನು ಹುಡುಕುತ್ತಾರೆ, ತಾಜಾ ಉತ್ಪನ್ನ ಬ್ರೌಸ್ ಮಾಡುತ್ತಾರೆ ಮತ್ತು ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ನೀಡುತ್ತಾರೆ.', step3Title: 'ನೇರ ವಿತರಣೆ ಅಥವಾ ಪಿಕಪ್', step3Desc: 'ರೈತರು ನಿಮ್ಮ ಬಾಗಿಲಿಗೆ ತಲುಪಿಸುತ್ತಾರೆ ಅಥವಾ ನೀವು ಸ್ಥಳೀಯವಾಗಿ ಪಿಕಪ್ ಮಾಡಿ — ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ, ಗರಿಷ್ಠ ತಾಜಾತನ.' },
    shop: { title: 'ನೇರ ಕೊಳ್ಳಿ', subtitle: 'ರೈತರಿಂದ.', searchPlaceholder: 'ಉತ್ಪನ್ನ, ರೈತರ ಹುಡುಕಿ...', filters: { all: 'ಎಲ್ಲ', delivery: 'ವಿತರಣೆ', pickup: 'ಪಿಕಪ್' }, categories: { all: 'ಎಲ್ಲ', vegetables: 'ತರಕಾರಿ', fruits: 'ಹಣ್ಣು', grains: 'ಧಾನ್ಯ', dairy: 'ಡೇರಿ', other: 'ಇತರ' }, priceRange: 'ಬೆಲೆ ಶ್ರೇಣಿ', noResults: 'ಯಾವುದೇ ಉತ್ಪನ್ನ ಕಂಡುಬಂದಿಲ್ಲ.' },
    product: { addToCart: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ', inStock: 'ಲಭ್ಯ', deliveryArea: 'ವಿತರಣಾ ಪ್ರದೇಶ', pickupAt: 'ಪಿಕಪ್ ಇಲ್ಲಿ' },
    cart: { title: 'ನಿಮ್ಮ ಕಾರ್ಟ್', empty: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ', browseProducts: 'ಉತ್ಪನ್ನ ನೋಡಿ', total: 'ಒಟ್ಟು', checkout: 'ಚೆಕ್‌ಔಟ್ ಮಾಡಿ' },
    checkout: { title: 'ಚೆಕ್‌ಔಟ್', deliveryMethod: 'ವಿತರಣಾ ವಿಧಾನ', homeDelivery: 'ಮನೆ ವಿತರಣೆ', farmPickup: 'ತೋಟದ ಪಿಕಪ್', deliveryAddress: 'ವಿತರಣಾ ವಿಳಾಸ', paymentDetails: 'ಪಾವತಿ ವಿವರಗಳು (ಡೆಮೋ)', pay: 'ಪಾವತಿಸಿ', placing: 'ಆರ್ಡರ್ ನೀಡಲಾಗುತ್ತಿದೆ...' },
    orders: { title: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು', noOrders: 'ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ.', reorder: 'ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಿ', status: { pending: 'ಬಾಕಿ', confirmed: 'ದೃಢಪಡಿಸಲಾಗಿದೆ', shipped: 'ಕಳುಹಿಸಲಾಗಿದೆ', delivered: 'ವಿತರಿಸಲಾಗಿದೆ' } },
    auth: { signIn: 'ಸೈನ್ ಇನ್', register: 'ನೋಂದಣಿ', email: 'ಇಮೇಲ್', password: 'ಪಾಸ್‌ವರ್ಡ್', fullName: 'ಪೂರ್ಣ ಹೆಸರು', iAmA: 'ನಾನು...', consumer: 'ಗ್ರಾಹಕ', farmer: 'ರೈತ', createAccount: 'ಖಾತೆ ರಚಿಸಿ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' },
    footer: { tagline: 'ರೈತರನ್ನು ಸಶಕ್ತಗೊಳಿಸುವುದು. ಸಮುದಾಯಗಳನ್ನು ಸಂಪರ್ಕಿಸುವುದು. ನೇರ ಮೂಲದಿಂದ ತಾಜಾ.', shop: 'ಅಂಗಡಿ', join: 'ಸೇರಿ', rights: '© 2026 ಎಗ್ರಿಲಿಂಕ್. ಎಲ್ಲ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' },
    seasonalHighlights: { label: 'ಋತುವಿನ ಅತ್ಯುತ್ತಮ', title: 'ಈಗ ಏನು ತಾಜಾ', titleGreen: 'ಈ ಋತುವಿನಲ್ಲಿ.' },
    cropPrices: { label: 'ಲೈವ್ ಮಾರುಕಟ್ಟೆ', title: 'ಇಂದಿನ ಬೆಳೆ ಬೆಲೆ', subtitle: 'ಪ್ರತಿ 30 ಸೆಕೆಂಡ್‌ಗೆ ನವೀಕರಿಸಲಾಗುತ್ತದೆ MSP + ಮಂಡಿ ದರಗಳು', lastUpdated: 'ಕೊನೆಯ ನವೀಕರಣ' },
  },
}

export type TranslationKey = typeof translations.en
```

Create `lib/i18n/LanguageContext.tsx`:

```typescript
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, type Locale } from './translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('agrilink-locale') as Locale
    if (saved && ['en', 'hi', 'kn'].includes(saved)) setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('agrilink-locale', l)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
```

Add `LanguageProvider` to `app/layout.tsx` wrapping children alongside CartProvider.

Add language switcher to `components/shared/Navbar.tsx`:

```typescript
// Inside Navbar, import useLanguage and add:
const { locale, setLocale } = useLanguage()
// Add this button group next to Sign Out:
<div className="flex items-center gap-1 border border-white/10 rounded-full p-0.5">
  {(['en','hi','kn'] as const).map(l => (
    <button key={l} onClick={() => setLocale(l)}
      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${locale === l ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}>
      {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'ಕ'}
    </button>
  ))}
</div>
```

Update ALL components to use `const { t } = useLanguage()` and replace hardcoded strings with `t.section.key`. Key components to update:
- `components/shared/Navbar.tsx`
- `components/landing/Hero.tsx`
- `components/landing/HowItWorks.tsx`
- `components/shared/Footer.tsx`
- `app/shop/page.tsx` and `components/products/ProductGrid.tsx`
- `app/cart/page.tsx`
- `app/checkout/page.tsx` (FakePaymentForm)
- `app/orders/page.tsx`
- `components/auth/AuthForm.tsx`

---

## TASK 3 — Real-Time Crop Price Ticker

Create `components/landing/CropPriceTicker.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const BASE_PRICES = [
  { crop: 'Tomato', cropHi: 'टमाटर', cropKn: 'ಟೊಮೆಟೊ', base: 28, unit: 'kg', market: 'Kolar', icon: '🍅' },
  { crop: 'Onion', cropHi: 'प्याज', cropKn: 'ಈರುಳ್ಳಿ', base: 22, unit: 'kg', market: 'Lasalgaon', icon: '🧅' },
  { crop: 'Potato', cropHi: 'आलू', cropKn: 'ಆಲೂಗಡ್ಡೆ', base: 18, unit: 'kg', market: 'Agra', icon: '🥔' },
  { crop: 'Rice (Sona Masoori)', cropHi: 'चावल', cropKn: 'ಅಕ್ಕಿ', base: 42, unit: 'kg', market: 'Thanjavur', icon: '🌾' },
  { crop: 'Wheat', cropHi: 'गेहूँ', cropKn: 'ಗೋಧಿ', base: 24, unit: 'kg', market: 'Indore', icon: '🌾' },
  { crop: 'Alphonso Mango', cropHi: 'अल्फांसो आम', cropKn: 'ಆಮ್ರ', base: 220, unit: 'dozen', market: 'Ratnagiri', icon: '🥭' },
  { crop: 'Green Chili', cropHi: 'हरी मिर्च', cropKn: 'ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ', base: 55, unit: 'kg', market: 'Guntur', icon: '🌶️' },
  { crop: 'Banana (Nendran)', cropHi: 'केला', cropKn: 'ಬಾಳೆ', base: 65, unit: 'dozen', market: 'Thrissur', icon: '🍌' },
  { crop: 'Coconut', cropHi: 'नारियल', cropKn: 'ತೆಂಗಿನಕಾಯಿ', base: 22, unit: 'piece', market: 'Thanjavur', icon: '🥥' },
  { crop: 'Toor Dal', cropHi: 'तुअर दाल', cropKn: 'ತೊಗರಿ ಬೇಳೆ', base: 120, unit: 'kg', market: 'Gulbarga', icon: '🫘' },
  { crop: 'Bajra', cropHi: 'बाजरा', cropKn: 'ಸಜ್ಜೆ', base: 38, unit: 'kg', market: 'Barmer', icon: '🌾' },
  { crop: 'Pomegranate', cropHi: 'अनार', cropKn: 'ದಾಳಿಂಬೆ', base: 130, unit: 'kg', market: 'Solapur', icon: '🌹' },
]

function randomVariation(base: number) {
  const change = (Math.random() - 0.5) * base * 0.04 // ±2%
  return Math.max(1, Math.round((base + change) * 10) / 10)
}

export default function CropPriceTicker() {
  const { t, locale } = useLanguage()
  const [prices, setPrices] = useState(BASE_PRICES.map(p => ({ ...p, current: p.base, prev: p.base })))
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({ ...p, prev: p.current, current: randomVariation(p.base) })))
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const cropName = (p: typeof prices[0]) =>
    locale === 'hi' ? p.cropHi : locale === 'kn' ? p.cropKn : p.crop

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">{t.cropPrices.label}</span>
          <h2 className="text-4xl font-black text-white mt-3">{t.cropPrices.title}</h2>
          <p className="text-gray-500 text-sm mt-2">{t.cropPrices.subtitle}</p>
          <p className="text-gray-600 text-xs mt-1">{t.cropPrices.lastUpdated}: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {prices.map(p => {
            const up = p.current >= p.prev
            return (
              <div key={p.crop} className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-green-400/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {up ? '▲' : '▼'} {Math.abs(((p.current - p.prev) / p.prev) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-white font-bold text-sm truncate">{cropName(p)}</p>
                <p className="text-gray-500 text-xs mb-2">{p.market}</p>
                <p className={`text-xl font-black ${up ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{p.current}<span className="text-gray-600 text-xs font-normal">/{p.unit}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

Add `<CropPriceTicker />` to `app/page.tsx` after `<HowItWorks />` and before `<FeaturedProducts />`.

---

## TASK 4 — Search + Price Filter on /shop

File: `components/products/ProductGrid.tsx`

Add a search input and price range slider above the category filters.

```typescript
// Add to state:
const [search, setSearch] = useState('')
const [maxPrice, setMaxPrice] = useState(1000)

// Add to filtered logic:
const filtered = products.filter(p => {
  const catMatch = category === 'all' || p.category === category
  const delMatch = deliveryFilter === 'all' ||
    (deliveryFilter === 'delivery' && p.delivery_type !== 'pickup') ||
    (deliveryFilter === 'pickup' && p.delivery_type !== 'delivery')
  const searchMatch = search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    (p as any).profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (p as any).profiles?.location?.toLowerCase().includes(search.toLowerCase())
  const priceMatch = p.price <= maxPrice
  return catMatch && delMatch && searchMatch && priceMatch
})

// Add above category filters:
<div className="flex gap-3 mb-4 flex-wrap">
  <input
    type="text"
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder={t.shop.searchPlaceholder}
    className="flex-1 min-w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400/50"
  />
  <div className="flex items-center gap-3 text-sm text-gray-400">
    <span>{t.shop.priceRange}:</span>
    <input type="range" min={10} max={2000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
      className="w-32 accent-green-500" />
    <span className="text-green-400 font-bold w-20">≤ ₹{maxPrice}</span>
  </div>
</div>
```

---

## TASK 5 — Ratings + Reviews on Product Page

File: `app/product/[id]/page.tsx`

Below the add-to-cart section, add a reviews section. Fetch reviews from Supabase. If product id starts with `'fake-'`, show hardcoded fake reviews.

Create `lib/actions/reviews.ts`:

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getReviews(productId: string) {
  if (productId.startsWith('fake-')) {
    return [
      { id: 'r1', product_id: productId, consumer_id: 'c1', rating: 5, comment: 'Absolutely fresh! Arrived within hours of order. Will buy again.', created_at: new Date(Date.now() - 86400000).toISOString(), profiles: { full_name: 'Priya S.' } },
      { id: 'r2', product_id: productId, consumer_id: 'c2', rating: 4, comment: 'Good quality, better than what I get at the supermarket. Slightly smaller quantity than expected but worth it.', created_at: new Date(Date.now() - 172800000).toISOString(), profiles: { full_name: 'Rahul M.' } },
      { id: 'r3', product_id: productId, consumer_id: 'c3', rating: 5, comment: 'Farmer was very responsive. Produce was exactly as described. Highly recommended!', created_at: new Date(Date.now() - 259200000).toISOString(), profiles: { full_name: 'Anjali V.' } },
    ]
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function submitReview(productId: string, rating: number, comment: string) {
  if (productId.startsWith('fake-')) return // silently skip for fake products
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to review')
  const { error } = await supabase.from('reviews').upsert({
    product_id: productId, consumer_id: user.id, rating, comment
  }, { onConflict: 'product_id,consumer_id' })
  if (error) throw error
  revalidatePath(`/product/${productId}`)
}
```

Add `ReviewsSection` component inline in the product page (or as a separate file `components/products/ReviewsSection.tsx`):
- Show average star rating (calculated from reviews)
- Show list of reviews with stars, name, date, comment
- Show "Write a Review" form if user is logged in as consumer and hasn't reviewed yet
- Star rating picker (1-5 clickable stars) + textarea for comment
- Submit calls `submitReview`

---

## TASK 6 — Wishlist + Save Favourite Farmers

### Wishlist
Add heart icon button to `ProductCard.tsx`. On click:
- If logged in: call `toggleWishlist(productId)` server action
- If not logged in: redirect to `/auth`

Create `lib/actions/wishlist.ts`:

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string) {
  if (productId.startsWith('fake-')) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { data: existing } = await supabase.from('wishlists').select('id').eq('consumer_id', user.id).eq('product_id', productId).single()
  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
  } else {
    await supabase.from('wishlists').insert({ consumer_id: user.id, product_id: productId })
  }
  revalidatePath('/shop')
}

export async function getWishlist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('wishlists').select('product_id').eq('consumer_id', user.id)
  return data?.map(d => d.product_id) ?? []
}

export async function toggleFavouriteFarmer(farmerId: string) {
  if (farmerId.startsWith('fake-')) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { data: existing } = await supabase.from('favourite_farmers').select('id').eq('consumer_id', user.id).eq('farmer_id', farmerId).single()
  if (existing) {
    await supabase.from('favourite_farmers').delete().eq('id', existing.id)
  } else {
    await supabase.from('favourite_farmers').insert({ consumer_id: user.id, farmer_id: farmerId })
  }
}
```

Add heart icon (lucide-react `Heart`) to `ProductCard.tsx` — bottom right corner, filled red if in wishlist, outlined if not.

### Save Farmer
On the product detail page and farmer profile page, add a "♥ Save Farmer" button that calls `toggleFavouriteFarmer`.

---

## TASK 7 — Reorder Button on /orders

File: `app/orders/page.tsx`

Below each order's item list, add a "Reorder" button:
```typescript
<button onClick={() => {
  // Add all items from this order back to cart
  order.order_items?.forEach(item => {
    if (item.products) addItem(item.products as any, item.quantity)
  })
  router.push('/cart')
}} className="text-green-400 text-sm hover:text-green-300 transition-colors flex items-center gap-1">
  <RefreshCw className="w-3 h-3" /> {t.orders.reorder}
</button>
```

This component needs `'use client'` and the `useCart` hook. Convert `app/orders/page.tsx` to a Client Component that fetches orders via a `useEffect` calling `getConsumerOrders()`.

---

## TASK 8 — Farmer Public Profile Page

Create `app/farmer/[id]/page.tsx`:

```typescript
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { createClient } from '@/lib/supabase/server'
import { FAKE_SHOP_PRODUCTS, FAKE_FARMERS } from '@/lib/fakeData'
import ProductCard from '@/components/products/ProductCard'
import { MapPin, Star, Package } from 'lucide-react'

export default async function FarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let farmer: any = null
  let products: any[] = []

  if (id.startsWith('fake-')) {
    farmer = FAKE_FARMERS.find(f => f.id === id)
    products = FAKE_SHOP_PRODUCTS.filter(p => p.farmer_id === id)
  } else {
    const supabase = await createClient()
    const [{ data: farmerData }, { data: productsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('products').select('*, profiles(full_name, location)').eq('farmer_id', id).eq('is_available', true)
    ])
    farmer = farmerData
    products = productsData ?? []
  }

  if (!farmer) return <div className="pt-32 text-center text-gray-500">Farmer not found.</div>

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6 mb-12 p-8 rounded-3xl border border-white/10 bg-white/5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center text-black font-black text-2xl shrink-0">
              {farmer.full_name?.[0] ?? 'F'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1">{farmer.full_name}</h1>
              {farmer.location && <p className="text-gray-400 flex items-center gap-1 mb-3"><MapPin className="w-4 h-4" />{farmer.location}</p>}
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500"><Package className="w-4 h-4 inline mr-1" />{products.length} listings</span>
                <span className="text-yellow-400"><Star className="w-4 h-4 inline mr-1 fill-yellow-400" />4.8 avg rating</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-6">Products by {farmer.full_name}</h2>
          {products.length === 0
            ? <p className="text-gray-500">No products listed yet.</p>
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
          }
        </div>
      </div>
      <Footer />
    </main>
  )
}
```

Link farmer name on `ProductCard.tsx` to `/farmer/${product.farmer_id}` so clicking the farmer name opens their profile.

---

## TASK 9 — Revenue Analytics Dashboard

File: `app/dashboard/page.tsx`

After the stats cards, add a revenue chart section. Use a simple bar chart built with plain CSS (no chart library needed — avoid heavy dependencies).

Create `components/dashboard/RevenueChart.tsx`:

```typescript
'use client'
import { useMemo } from 'react'
import type { Order } from '@/lib/types'

export default function RevenueChart({ orders }: { orders: Order[] }) {
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {}
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const key = `W${8 - i}`
      weeks[key] = 0
    }
    orders.filter(o => o.status === 'delivered' || o.status === 'confirmed').forEach(o => {
      const d = new Date(o.created_at)
      const weeksAgo = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksAgo <= 7) {
        const key = `W${8 - weeksAgo}`
        weeks[key] = (weeks[key] || 0) + o.total_price
      }
    })
    return Object.entries(weeks).map(([week, revenue]) => ({ week, revenue }))
  }, [orders])

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1)
  const totalRevenue = orders.filter(o => ['confirmed','shipped','delivered'].includes(o.status)).reduce((s, o) => s + o.total_price, 0)
  const topProducts: Record<string, { name: string; count: number; revenue: number }> = {}
  orders.forEach(o => o.order_items?.forEach((item: any) => {
    const name = item.products?.name ?? 'Unknown'
    if (!topProducts[name]) topProducts[name] = { name, count: 0, revenue: 0 }
    topProducts[name].count += item.quantity
    topProducts[name].revenue += item.price * item.quantity
  }))
  const sortedProducts = Object.values(topProducts).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-white font-bold mb-1">Weekly Revenue</h3>
        <p className="text-green-400 text-2xl font-black mb-4">₹{totalRevenue.toFixed(0)}</p>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map(d => (
            <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-green-500/20 rounded-t-sm transition-all duration-500 hover:bg-green-500/40"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? '4px' : '2px' }} />
              <span className="text-gray-600 text-xs">{d.week}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-white font-bold mb-4">Top Products</h3>
        {sortedProducts.length === 0
          ? <p className="text-gray-500 text-sm">No sales yet.</p>
          : <div className="space-y-3">
              {sortedProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm">{p.name}</span>
                      <span className="text-green-400 text-sm font-bold">₹{p.revenue.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(p.revenue / (sortedProducts[0]?.revenue || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
```

Import and render `<RevenueChart orders={orders} />` in `app/dashboard/page.tsx` below `<StatsCards />`.

---

## TASK 10 — Seasonal Highlights Section (Landing Page)

Create `components/landing/SeasonalHighlights.tsx`:

```typescript
'use client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'

const SEASONAL = [
  { name: 'Alphonso Mangoes', nameHi: 'अल्फांसो आम', nameKn: 'ಆಮ್ರ', season: 'Apr – Jun', badge: '🔥 Peak Season', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&auto=format&fit=crop', color: 'from-yellow-900/40 to-orange-900/20' },
  { name: 'Fresh Strawberries', nameHi: 'स्ट्रॉबेरी', nameKn: 'ಸ್ಟ್ರಾಬೆರಿ', season: 'Dec – Feb', badge: '❄️ Winter Special', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop', color: 'from-red-900/40 to-pink-900/20' },
  { name: 'Sweet Corn', nameHi: 'मकई', nameKn: 'ಜೋಳ', season: 'Jun – Aug', badge: '🌧️ Monsoon Fresh', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop', color: 'from-yellow-900/30 to-green-900/20' },
  { name: 'Pomegranate', nameHi: 'अनार', nameKn: 'ದಾಳಿಂಬೆ', season: 'Aug – Feb', badge: '✨ In Season Now', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f1?w=300&auto=format&fit=crop', color: 'from-red-900/40 to-purple-900/20' },
]

export default function SeasonalHighlights() {
  const { t, locale } = useLanguage()
  const getName = (s: typeof SEASONAL[0]) => locale === 'hi' ? s.nameHi : locale === 'kn' ? s.nameKn : s.name

  return (
    <section className="py-24 px-4 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">{t.seasonalHighlights.label}</span>
          <h2 className="text-4xl font-black text-white mt-3">{t.seasonalHighlights.title} <span className="text-green-400">{t.seasonalHighlights.titleGreen}</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SEASONAL.map(s => (
            <Link key={s.name} href="/shop">
              <div className={`group rounded-2xl bg-gradient-to-br ${s.color} border border-white/10 overflow-hidden hover:border-green-400/30 transition-all hover:-translate-y-1 cursor-pointer`}>
                <div className="h-40 overflow-hidden">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-yellow-400">{s.badge}</span>
                  <h3 className="text-white font-bold mt-1">{getName(s)}</h3>
                  <p className="text-gray-500 text-xs mt-1">Season: {s.season}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Add `<SeasonalHighlights />` to `app/page.tsx` after `<CropPriceTicker />`.

---

## TASK 11 — Bulk CSV Upload for Farmers

File: `app/dashboard/add-product/page.tsx`

Add a "Bulk Upload (CSV)" toggle tab alongside the existing form. When selected:

1. Show a download link for a template CSV with columns: `name,description,price,unit,stock,category,delivery_type,delivery_area,pickup_location`
2. File input for CSV upload
3. Preview table of parsed rows before submitting
4. "Upload All" button that calls `createProduct` for each row

Create `lib/utils/csvParser.ts`:

```typescript
export function parseProductCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

export const CSV_TEMPLATE = `name,description,price,unit,stock,category,delivery_type,delivery_area,pickup_location
Fresh Tomatoes,Sun-ripened organic tomatoes,35,kg,50,vegetables,both,Bangalore,Farm Gate Kolar
Organic Spinach,Iron-rich fresh spinach,25,bunch,30,vegetables,delivery,Mysuru,
`
```

In the bulk upload UI, after parsing CSV, show a table preview. On "Upload All" click, iterate rows and call `createProduct(formData)` for each. Show progress (3/10 uploaded...).

---

## Final Steps

After all tasks are complete:

1. Run: `npm run build`
2. Fix any TypeScript errors that appear
3. Run: `git add . && git commit -m "feat: fake shop data, multi-language, crop prices, search, reviews, wishlist, farmer profiles, analytics, seasonal, bulk upload" && git push`
4. Vercel will auto-deploy in ~2 minutes
5. Tell the user: "Done! Visit https://agrilink-6xmh.vercel.app to see all changes live."

---

## Things NOT To Do In This Session

- Do NOT add maps (Leaflet/Google Maps) — separate session
- Do NOT add admin panel — separate session
- Do NOT add dispute resolution — separate session
- Do NOT install Razorpay — dropped permanently
- Do NOT add Google OAuth — dropped permanently
- Do NOT modify Supabase schema beyond the 3 tables defined at the top
- Do NOT break existing auth, cart, checkout, or order flow

===
