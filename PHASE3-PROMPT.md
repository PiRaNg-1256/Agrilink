# Agrilink Phase 3 — New Session Prompt

Paste everything between the === markers into a new Claude Code session.

===

## FIRST: Invoke These Skills Before Anything Else
1. `caveman:caveman` — keeps all responses ultra-terse, saves tokens
2. `superpowers:subagent-driven-development` — dispatches fresh subagents per task, protects main context window
3. Use `TodoWrite` to track all tasks

---

## About This User
Non-developer. Very limited coding experience. If any step requires manual action in a browser or terminal, stop and give exact step-by-step instructions. Wait for confirmation before writing any code. Do not assume knowledge of any tool or platform.

---

## Project Context
- Next.js 15 + Tailwind + Supabase + Vercel
- Working directory: `D:\Agrilink`
- Live site: https://agrilink-6xmh.vercel.app
- Supabase project: https://zpxzpuobpzhbtubhmmfl.supabase.co
- Read `docs/superpowers/specs/2026-05-05-agrilink-design.md` for full context
- Read `lib/fakeData.ts` for fake product/farmer data
- Style: dark navy `#0d0d1a` bg, green `#22c55e`, yellow `#facc15`
- Auth: email/password only (no Google OAuth, no Razorpay — both dropped permanently)
- Phase 2 already built: multi-language (en/hi/kn), crop price ticker, search+filters, reviews, wishlist, farmer profiles, analytics, bulk CSV upload, reorder

---

## New DB Tables + Schema Changes (Manual Step — Do This FIRST)

Tell user:
> "We need to add new tables and update the database. Follow these steps:"
> 1. Go to https://supabase.com/dashboard/project/zpxzpuobpzhbtubhmmfl/sql/new
> 2. Paste this entire SQL block and click **Run**:

```sql
-- Add location + admin columns to profiles
alter table public.profiles add column if not exists lat numeric;
alter table public.profiles add column if not exists lng numeric;
alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists is_active boolean default true;

-- Farmer delivery zones (center point + radius, simpler than polygons)
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references public.profiles(id) on delete cascade not null unique,
  zone_name text default 'My Delivery Zone',
  center_lat numeric not null,
  center_lng numeric not null,
  radius_km integer default 20,
  created_at timestamptz default now()
);

-- Disputes
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  consumer_id uuid references public.profiles(id) on delete cascade not null,
  farmer_id uuid references public.profiles(id) on delete cascade not null,
  reason text not null,
  farmer_response text,
  status text check (status in ('open','under_review','resolved','closed')) default 'open',
  resolution text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- RLS for new tables
alter table public.delivery_zones enable row level security;
alter table public.disputes enable row level security;

create policy "Public read delivery zones" on public.delivery_zones for select using (true);
create policy "Farmers manage own zones" on public.delivery_zones for all using (auth.uid() = farmer_id);

create policy "Consumers read own disputes" on public.disputes for select using (auth.uid() = consumer_id);
create policy "Farmers read own disputes" on public.disputes for select using (auth.uid() = farmer_id);
create policy "Consumers create disputes" on public.disputes for insert with check (auth.uid() = consumer_id);
create policy "Farmers respond to disputes" on public.disputes for update
  using (auth.uid() = farmer_id);

-- Admin policies — additive, won't break existing policies
create policy "Admins manage all disputes" on public.disputes for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins read all orders" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins update all orders" on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins update profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
```

> 3. You should see "Success. No rows returned"
> 4. Tell me when done.

Wait for confirmation before writing any code.

---

## Install New Package (After DB Confirmed)

Run in terminal:
```bash
npm install leaflet react-leaflet @types/leaflet
```

---

## Task 1: Add Fake Farmer Locations to fakeData.ts

Read `lib/fakeData.ts`. Find the `FAKE_FARMERS` array (or create it if missing). Add `lat` and `lng` fields with real Indian city coordinates:

```typescript
export type FakeFarmer = {
  id: string
  full_name: string
  location: string
  lat: number
  lng: number
}

export const FAKE_FARMERS: FakeFarmer[] = [
  { id: 'fake-farmer-1', full_name: 'Ravi Kumar',    location: 'Kolar, Karnataka',          lat: 13.1366, lng: 78.1298 },
  { id: 'fake-farmer-2', full_name: 'Priya Devi',    location: 'Nashik, Maharashtra',        lat: 19.9975, lng: 73.7898 },
  { id: 'fake-farmer-3', full_name: 'Suresh Reddy',  location: 'Guntur, Andhra Pradesh',     lat: 16.3067, lng: 80.4365 },
  { id: 'fake-farmer-4', full_name: 'Anita Sharma',  location: 'Jaipur, Rajasthan',          lat: 26.9124, lng: 75.7873 },
  { id: 'fake-farmer-5', full_name: 'Mohan Das',     location: 'Thrissur, Kerala',           lat: 10.5276, lng: 76.2144 },
  { id: 'fake-farmer-6', full_name: 'Lakshmi Bai',   location: 'Mysuru, Karnataka',          lat: 12.2958, lng: 76.6394 },
]
```

If `FAKE_PRODUCTS` already references farmer IDs like `'fake-farmer-1'`, ensure those IDs match exactly.

---

## Task 2: Leaflet Base Map Component

**Important:** Leaflet uses `window` — must NEVER be server-rendered. Always use `dynamic(..., { ssr: false })`.

Create `components/map/BaseMap.tsx`:

```tsx
'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

function FixLeafletIcons() {
  useMap() // ensures we're inside MapContainer
  useEffect(() => {
    // Fix broken default icons in webpack/Next.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])
  return null
}

interface BaseMapProps {
  center?: [number, number]
  zoom?: number
  height?: string
  children?: React.ReactNode
}

export default function BaseMap({
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '500px',
  children,
}: BaseMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%', borderRadius: '12px' }}>
      <FixLeafletIcons />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}
```

Create `components/map/DynamicMap.tsx` (SSR-safe wrapper — always import THIS, never BaseMap directly from server):

```tsx
import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('./BaseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-500 text-sm"
         style={{ height: '500px' }}>
      Loading map...
    </div>
  ),
})

export default DynamicMap
```

---

## Task 3: Farmer Location Editor (`/dashboard/location`)

Create `app/dashboard/location/page.tsx`. This lets farmers click a map to pin their farm and set delivery radius.

```tsx
import dynamic from 'next/dynamic'

const LocationEditor = dynamic(() => import('./LocationEditorClient'), { ssr: false })

export default function LocationPage() {
  return <LocationEditor />
}
```

Create `app/dashboard/location/LocationEditorClient.tsx`:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createClient } from '@/lib/supabase/browser'

// Fix icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function LocationEditorClient() {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState(20)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('lat, lng').eq('id', user.id).single()
      if (p?.lat) setLat(p.lat)
      if (p?.lng) setLng(p.lng)
      const { data: z } = await supabase.from('delivery_zones').select('radius_km').eq('farmer_id', user.id).single()
      if (z?.radius_km) setRadius(z.radius_km)
    }
    load()
  }, [])

  async function save() {
    if (!lat || !lng) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ lat, lng }).eq('id', user.id)
    await supabase.from('delivery_zones').upsert(
      { farmer_id: user.id, center_lat: lat, center_lng: lng, radius_km: radius },
      { onConflict: 'farmer_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const mapCenter: [number, number] = lat && lng ? [lat, lng] : [20.5937, 78.9629]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Set Your Farm Location</h1>
      <p className="text-gray-400 mb-6">Click anywhere on the map to pin your farm. The green circle shows your delivery area.</p>

      <MapContainer center={mapCenter} zoom={lat ? 10 : 5} style={{ height: '420px', width: '100%', borderRadius: '12px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickPicker onPick={(la, ln) => { setLat(la); setLng(ln) }} />
        {lat && lng && (
          <>
            <Marker position={[lat, lng]} />
            <Circle center={[lat, lng]} radius={radius * 1000} color="#22c55e" fillOpacity={0.12} />
          </>
        )}
      </MapContainer>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-gray-300 text-sm">Delivery radius (km):</label>
          <input
            type="number" value={radius} min={1} max={500}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-gray-800 text-white rounded px-3 py-1 w-20 border border-gray-600"
          />
        </div>
        {lat && lng && (
          <p className="text-gray-500 text-sm">Pin: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
        )}
        <button
          onClick={save}
          disabled={!lat || !lng || saving}
          className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Location'}
        </button>
      </div>
      {!lat && (
        <p className="text-yellow-500 text-sm mt-3">Click on the map to place your farm pin.</p>
      )}
    </div>
  )
}
```

Add "📍 Set Location" link in the farmer dashboard sidebar nav (wherever `/dashboard/add-product` link is — add it nearby).

---

## Task 4: Public Farmer Map Page (`/map`)

Create `app/map/page.tsx` (server component — fetches real farmers):

```tsx
import { createClient } from '@/lib/supabase/server'
import MapPageClient from './MapPageClient'
import { FAKE_FARMERS } from '@/lib/fakeData'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: realFarmers } = await supabase
    .from('profiles')
    .select('id, full_name, location, lat, lng')
    .eq('role', 'farmer')
    .eq('is_active', true)
    .not('lat', 'is', null)

  type MapFarmer = { id: string; full_name: string; location: string; lat: number; lng: number }

  const allFarmers: MapFarmer[] = [
    ...(realFarmers?.filter(f => f.lat && f.lng) ?? []),
    ...FAKE_FARMERS,
  ]

  return <MapPageClient farmers={allFarmers} />
}
```

Create `app/map/MapPageClient.tsx`:

```tsx
'use client'
import dynamic from 'next/dynamic'
import { Marker, Popup } from 'react-leaflet'
import Link from 'next/link'

const DynamicMap = dynamic(() => import('@/components/map/BaseMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-800 rounded-xl animate-pulse" />,
})

interface MapFarmer {
  id: string
  full_name: string
  location: string
  lat: number
  lng: number
}

export default function MapPageClient({ farmers }: { farmers: MapFarmer[] }) {
  return (
    <main className="min-h-screen bg-[#0d0d1a] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Farmers on the Map</h1>
        <p className="text-gray-400 mb-8">Click a pin to see farmer details and browse their products</p>
        <DynamicMap height="600px" zoom={5}>
          {farmers.map((farmer) => (
            <Marker key={farmer.id} position={[farmer.lat, farmer.lng]}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-gray-900">{farmer.full_name}</p>
                  <p className="text-sm text-gray-600 mb-1">{farmer.location}</p>
                  <Link
                    href={`/farmer/${farmer.id}`}
                    className="text-green-600 text-sm font-semibold hover:underline"
                  >
                    View Products →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </DynamicMap>
        <p className="text-center text-gray-600 text-sm mt-4">{farmers.length} farmers shown</p>
      </div>
    </main>
  )
}
```

Add **"Map"** link to the Navbar (between "Shop" and any other nav links). Use the `/map` route.

---

## Task 5: Order Detail + Tracking Page (`/orders/[id]`)

Create `app/orders/[id]/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import OrderDetailClient from './OrderDetailClient'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, price,
        products (id, name, image_url)
      ),
      farmer:profiles!orders_farmer_id_fkey (full_name, location, lat, lng)
    `)
    .eq('id', id)
    .eq('consumer_id', user.id)
    .single()

  if (!order) notFound()
  return <OrderDetailClient order={order} />
}
```

Create `app/orders/[id]/OrderDetailClient.tsx`:

```tsx
'use client'
import dynamic from 'next/dynamic'
import { Marker, Popup } from 'react-leaflet'
import Link from 'next/link'

const DynamicMap = dynamic(() => import('@/components/map/BaseMap'), { ssr: false })

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'] as const

export default function OrderDetailClient({ order }: { order: any }) {
  const currentStep = STATUS_STEPS.indexOf(order.status)
  const farmer = order.farmer
  const showMap = order.delivery_type === 'delivery' && farmer?.lat && farmer?.lng

  return (
    <main className="min-h-screen bg-[#0d0d1a] py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="text-gray-400 hover:text-white text-sm">← Orders</Link>
          <h1 className="text-2xl font-bold text-white">Order #{order.id.slice(0, 8)}</h1>
        </div>

        {/* Status Timeline */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-6">Status</h2>
          <div className="relative flex justify-between">
            {/* Background line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700" />
            {/* Progress line */}
            <div
              className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-500"
              style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  ${i <= currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-gray-900 border-gray-600 text-gray-500'}`}>
                  {i <= currentStep ? '✓' : i + 1}
                </div>
                <span className="text-xs text-gray-400 mt-2 capitalize">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map (only for delivery orders where farmer has set location) */}
        {showMap && (
          <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-2">Farm Location</h2>
            <p className="text-gray-400 text-sm mb-4">
              Dispatching from: <span className="text-white">{farmer.location}</span>
            </p>
            <DynamicMap center={[farmer.lat, farmer.lng]} zoom={10} height="280px">
              <Marker position={[farmer.lat, farmer.lng]}>
                <Popup>{farmer.full_name}&apos;s Farm</Popup>
              </Marker>
            </DynamicMap>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  {item.products?.image_url && (
                    <img src={item.products.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                  )}
                  <span className="text-gray-300">{item.products?.name ?? 'Product'} × {item.quantity}</span>
                </div>
                <span className="text-white">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-4 pt-4 flex justify-between text-white font-bold">
            <span>Total</span>
            <span>₹{order.total_price}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-3">Delivery Details</h2>
          <p className="text-gray-400 text-sm">Type: <span className="text-white capitalize">{order.delivery_type}</span></p>
          {order.address && (
            <p className="text-gray-400 text-sm mt-1">Address: <span className="text-white">{order.address}</span></p>
          )}
          <p className="text-gray-400 text-sm mt-1">Farmer: <span className="text-white">{farmer?.full_name}</span></p>
        </div>
      </div>
    </main>
  )
}
```

Also update the existing `/orders` page: make each order card clickable, linking to `/orders/[id]`. Add a "View Details" button or make the card a `<Link href={/orders/${order.id}}>`.

---

## Task 6: Dispute System — Server Actions

Create `lib/actions/disputes.ts`:

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function fileDispute(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const orderId = formData.get('order_id') as string
  const reason = formData.get('reason') as string
  if (!reason?.trim()) return { error: 'Reason required' }

  // Get farmer_id from the order
  const { data: order } = await supabase.from('orders').select('farmer_id').eq('id', orderId).single()
  if (!order) return { error: 'Order not found' }

  const { error } = await supabase.from('disputes').insert({
    order_id: orderId,
    consumer_id: user.id,
    farmer_id: order.farmer_id,
    reason: reason.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/orders')
  return { success: true }
}

export async function getDisputeForOrder(orderId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('disputes').select('id, status, reason').eq('order_id', orderId).single()
  return data
}

export async function farmerRespondToDispute(disputeId: string, response: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('disputes')
    .update({ farmer_response: response, status: 'under_review' })
    .eq('id', disputeId)
    .eq('farmer_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function getDisputesForFarmer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('disputes')
    .select('*, order:orders(id, total_price, status)')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
  return data ?? []
}
```

---

## Task 7: Dispute UI — Consumer + Farmer Views

**Consumer side** — add to existing `/orders` page (`app/orders/page.tsx`):

For each order with status `'confirmed'`, `'shipped'`, or `'delivered'`, fetch its dispute (call `getDisputeForOrder(order.id)` in the server component). Pass dispute data to client.

Create `components/disputes/DisputeButton.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { fileDispute } from '@/lib/actions/disputes'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-900/50 text-red-400 border-red-800',
  under_review: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  resolved: 'bg-green-900/50 text-green-400 border-green-800',
  closed: 'bg-gray-800 text-gray-500 border-gray-700',
}

interface Props {
  orderId: string
  existingDispute?: { id: string; status: string; reason: string } | null
}

export default function DisputeButton({ orderId, existingDispute }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (done || existingDispute) {
    const status = existingDispute?.status ?? 'open'
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
        Dispute: {status.replace('_', ' ')}
      </span>
    )
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="text-xs text-red-400 hover:text-red-300 border border-red-900 rounded px-2 py-1"
    >
      File Dispute
    </button>
  )

  async function submit() {
    if (!reason.trim()) return
    setSubmitting(true)
    const fd = new FormData()
    fd.append('order_id', orderId)
    fd.append('reason', reason)
    await fileDispute(fd)
    setDone(true)
    setOpen(false)
    setSubmitting(false)
  }

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-red-900">
      <p className="text-white text-sm font-medium mb-2">Describe the issue:</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Product not delivered, wrong item received..."
        rows={3}
        className="w-full bg-gray-900 text-white rounded p-2 text-sm border border-gray-700 mb-2 resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!reason.trim() || submitting}
          className="bg-red-700 hover:bg-red-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Dispute'}
        </button>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5">
          Cancel
        </button>
      </div>
    </div>
  )
}
```

**Farmer side** — on `app/dashboard/orders/page.tsx`, for each order, fetch its dispute and show:
- Orange badge "⚠ Dispute Open" if status is `'open'`
- A "Respond" text area + button that calls `farmerRespondToDispute(dispute.id, response)`
- Yellow badge "Under Review" if status is `'under_review'`
- Green badge "Resolved" if status is `'resolved'`

Create `components/disputes/FarmerDisputeResponder.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { farmerRespondToDispute } from '@/lib/actions/disputes'

interface Dispute {
  id: string
  status: string
  reason: string
  farmer_response?: string | null
}

export default function FarmerDisputeResponder({ dispute }: { dispute: Dispute }) {
  const [response, setResponse] = useState(dispute.farmer_response ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const badgeMap: Record<string, string> = {
    open: 'bg-red-900/50 text-red-400',
    under_review: 'bg-yellow-900/50 text-yellow-400',
    resolved: 'bg-green-900/50 text-green-400',
    closed: 'bg-gray-800 text-gray-500',
  }

  async function submit() {
    if (!response.trim()) return
    setSubmitting(true)
    await farmerRespondToDispute(dispute.id, response)
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-orange-900/50">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${badgeMap[dispute.status]}`}>
          {dispute.status.replace('_', ' ')}
        </span>
        <span className="text-gray-400 text-sm">Dispute filed</span>
      </div>
      <p className="text-gray-300 text-sm mb-2"><strong>Consumer says:</strong> {dispute.reason}</p>
      {dispute.status === 'open' && !submitted && (
        <>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Explain your side..."
            rows={2}
            className="w-full bg-gray-900 text-white rounded p-2 text-sm border border-gray-700 mb-2 resize-none"
          />
          <button
            onClick={submit}
            disabled={!response.trim() || submitting}
            className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Response'}
          </button>
        </>
      )}
      {(submitted || dispute.farmer_response) && (
        <p className="text-gray-400 text-sm">Your response submitted. Admin will review.</p>
      )}
    </div>
  )
}
```

---

## Task 8: Admin Layout + Access Control

Create `app/admin/layout.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/disputes', label: 'Disputes' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="text-green-400 font-bold text-lg mr-4">⚙ Admin</span>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-300 hover:text-white text-sm">
            {l.label}
          </Link>
        ))}
        <span className="ml-auto text-gray-500 text-sm">{profile.full_name}</span>
      </nav>
      <div className="p-6">{children}</div>
    </div>
  )
}
```

Create `lib/actions/admin.ts`:

```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!p?.is_admin) return null
  return { supabase, user }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: 'Not authorized' }
  await ctx.supabase.from('profiles').update({ is_active: isActive }).eq('id', userId)
  revalidatePath('/admin/users')
}

export async function resolveDispute(disputeId: string, status: 'resolved' | 'closed', resolution: string) {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: 'Not authorized' }
  await ctx.supabase.from('disputes').update({
    status,
    resolution: resolution.trim() || null,
    resolved_at: new Date().toISOString(),
  }).eq('id', disputeId)
  revalidatePath('/admin/disputes')
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: 'Not authorized' }
  await ctx.supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/orders')
}
```

---

## Task 9: Admin Dashboard + Orders Pages

Create `app/admin/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalFarmers },
    { count: totalProducts },
    { count: totalOrders },
    { count: openDisputes },
    { data: revenueRows },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('orders').select('total_price'),
  ])

  const totalRevenue = revenueRows?.reduce((sum, o) => sum + (o.total_price ?? 0), 0) ?? 0

  const stats = [
    { label: 'Total Users',    value: totalUsers ?? 0,                             color: 'text-blue-400' },
    { label: 'Farmers',        value: totalFarmers ?? 0,                           color: 'text-green-400' },
    { label: 'Products',       value: totalProducts ?? 0,                          color: 'text-yellow-400' },
    { label: 'Orders',         value: totalOrders ?? 0,                            color: 'text-purple-400' },
    { label: 'Open Disputes',  value: openDisputes ?? 0,                           color: 'text-red-400' },
    { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`,  color: 'text-emerald-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Create `app/admin/orders/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import AdminOrderStatus from './AdminOrderStatus'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, status, delivery_type, total_price, created_at,
      consumer:profiles!orders_consumer_id_fkey (full_name),
      farmer:profiles!orders_farmer_id_fkey (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const statusColors: Record<string, string> = {
    pending:   'bg-gray-800 text-gray-400',
    confirmed: 'bg-blue-900/50 text-blue-400',
    shipped:   'bg-yellow-900/50 text-yellow-400',
    delivered: 'bg-green-900/50 text-green-400',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Orders ({orders?.length ?? 0})</h1>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              {['Order ID', 'Consumer', 'Farmer', 'Total', 'Type', 'Status', 'Date', 'Action'].map((h) => (
                <th key={h} className="text-left text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-gray-300">{(o.consumer as any)?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-300">{(o.farmer as any)?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-white font-medium">₹{o.total_price}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">{o.delivery_type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <AdminOrderStatus orderId={o.id} currentStatus={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

Create `app/admin/orders/AdminOrderStatus.tsx`:

```tsx
'use client'
import { adminUpdateOrderStatus } from '@/lib/actions/admin'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered']

export default function AdminOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  async function change(e: React.ChangeEvent<HTMLSelectElement>) {
    await adminUpdateOrderStatus(orderId, e.target.value)
  }
  return (
    <select
      defaultValue={currentStatus}
      onChange={change}
      className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
```

---

## Task 10: Admin Users Page (`/admin/users`)

Create `app/admin/users/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import AdminUserToggle from './AdminUserToggle'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, location, is_active, is_admin, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users ({users?.length ?? 0})</h1>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              {['Name', 'Role', 'Location', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-white">
                  {u.full_name ?? 'No name'}
                  {u.is_admin && <span className="ml-2 text-xs bg-purple-900/60 text-purple-400 px-1.5 py-0.5 rounded">admin</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${u.role === 'farmer' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.location ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {u.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!u.is_admin && <AdminUserToggle userId={u.id} isActive={!!u.is_active} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

Create `app/admin/users/AdminUserToggle.tsx`:

```tsx
'use client'
import { toggleUserActive } from '@/lib/actions/admin'

export default function AdminUserToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  return (
    <button
      onClick={() => toggleUserActive(userId, !isActive)}
      className={`text-xs px-3 py-1 rounded transition-colors
        ${isActive
          ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
          : 'bg-green-900/50 text-green-400 hover:bg-green-900'}`}
    >
      {isActive ? 'Suspend' : 'Restore'}
    </button>
  )
}
```

---

## Task 11: Admin Disputes Page (`/admin/disputes`)

Create `app/admin/disputes/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import AdminDisputeCard from './AdminDisputeCard'

export default async function AdminDisputesPage() {
  const supabase = await createClient()
  const { data: disputes } = await supabase
    .from('disputes')
    .select(`
      *,
      order:orders (id, total_price, status),
      consumer:profiles!disputes_consumer_id_fkey (full_name),
      farmer:profiles!disputes_farmer_id_fkey (full_name)
    `)
    .order('created_at', { ascending: false })

  const open = disputes?.filter((d) => d.status === 'open' || d.status === 'under_review') ?? []
  const closed = disputes?.filter((d) => d.status === 'resolved' || d.status === 'closed') ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Disputes — <span className="text-red-400">{open.length} open</span>
      </h1>

      {open.length === 0 && (
        <p className="text-gray-500 text-center py-12">No open disputes 🎉</p>
      )}

      <div className="space-y-4 mb-8">
        {open.map((d) => <AdminDisputeCard key={d.id} dispute={d} />)}
      </div>

      {closed.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">Closed Disputes</h2>
          <div className="space-y-3">
            {closed.map((d) => <AdminDisputeCard key={d.id} dispute={d} />)}
          </div>
        </>
      )}
    </div>
  )
}
```

Create `app/admin/disputes/AdminDisputeCard.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { resolveDispute } from '@/lib/actions/admin'

const STATUS_COLORS: Record<string, string> = {
  open:         'bg-red-900/50 text-red-400 border-red-800',
  under_review: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  resolved:     'bg-green-900/50 text-green-400 border-green-800',
  closed:       'bg-gray-800 text-gray-500 border-gray-700',
}

export default function AdminDisputeCard({ dispute }: { dispute: any }) {
  const [resolution, setResolution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isClosed = dispute.status === 'resolved' || dispute.status === 'closed'

  async function submit(status: 'resolved' | 'closed') {
    setSubmitting(true)
    await resolveDispute(dispute.id, status, resolution)
    setSubmitting(false)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[dispute.status]}`}>
            {dispute.status.replace('_', ' ')}
          </span>
          <span className="text-gray-400 text-sm">
            Order #{dispute.order?.id?.slice(0, 8)} — ₹{dispute.order?.total_price}
          </span>
        </div>
        <span className="text-gray-600 text-xs">{new Date(dispute.created_at).toLocaleDateString('en-IN')}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500 text-xs">Consumer</p>
          <p className="text-gray-300">{dispute.consumer?.full_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Farmer</p>
          <p className="text-gray-300">{dispute.farmer?.full_name ?? '—'}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-3 mb-3">
        <p className="text-gray-500 text-xs mb-1">Consumer complaint</p>
        <p className="text-gray-300 text-sm">{dispute.reason}</p>
      </div>

      {dispute.farmer_response && (
        <div className="bg-gray-800 rounded p-3 mb-3 border-l-2 border-yellow-600">
          <p className="text-gray-500 text-xs mb-1">Farmer response</p>
          <p className="text-gray-300 text-sm">{dispute.farmer_response}</p>
        </div>
      )}

      {dispute.resolution && (
        <div className="bg-gray-800 rounded p-3 mb-3 border-l-2 border-green-600">
          <p className="text-gray-500 text-xs mb-1">Resolution</p>
          <p className="text-gray-300 text-sm">{dispute.resolution}</p>
        </div>
      )}

      {!isClosed && (
        <div className="mt-3">
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Resolution notes (optional)..."
            rows={2}
            className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700 mb-2 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => submit('resolved')}
              disabled={submitting}
              className="bg-green-700 hover:bg-green-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
            >
              ✓ Mark Resolved
            </button>
            <button
              onClick={() => submit('closed')}
              disabled={submitting}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
            >
              Close (No Action)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Task 12: Make Your Account Admin (Manual Step)

After all code is written and deployed, tell user:

> "Last step — to access the admin panel, we need to make your account an admin. Follow these steps:"
> 1. Go to https://supabase.com/dashboard/project/zpxzpuobpzhbtubhmmfl/sql/new
> 2. Paste this SQL — **replace YOUR_EMAIL_HERE with the email you use to log into Agrilink:**
>
> ```sql
> UPDATE public.profiles
> SET is_admin = true
> WHERE id = (
>   SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
> );
> ```
>
> 3. Click Run — should say "1 row affected"
> 4. Now visit https://agrilink-6xmh.vercel.app/admin — you should see the admin dashboard
> 5. To set your farm location (if you have a farmer account): visit https://agrilink-6xmh.vercel.app/dashboard/location

---

## Final Steps

After all tasks complete:

1. Run: `npm run build`
2. Fix any TypeScript errors shown
3. Run:
```bash
git add . && git commit -m "feat: map view, order tracking, delivery zones, admin panel, dispute resolution" && git push
```
4. Vercel auto-deploys in ~2 minutes
5. Tell user:
   > "Done! Here's what's new:"
   > - **Map:** https://agrilink-6xmh.vercel.app/map — see all farmers on map
   > - **Order tracking:** Click any order → see map + status timeline
   > - **Admin panel:** https://agrilink-6xmh.vercel.app/admin (after making your account admin)
   > - **Farmer location:** https://agrilink-6xmh.vercel.app/dashboard/location (for farmer accounts)

---

## Things NOT To Do In This Session

- Do NOT use Google Maps — costs money. Use OpenStreetMap via Leaflet only (free, no API key)
- Do NOT add real-time GPS tracking — no free API for that
- Do NOT use `react-leaflet-draw` for polygon zones — use click-to-place + radius slider instead
- Do NOT install Razorpay — dropped permanently
- Do NOT add Google OAuth — dropped permanently
- Do NOT break existing auth, cart, checkout, orders, reviews, wishlist, or language features
- Do NOT add SMS/email notifications — separate session
- Do NOT add Leaflet to any Server Component directly — always use `dynamic(..., { ssr: false })`

===
