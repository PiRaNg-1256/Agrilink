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

-- Profiles
create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Products
create policy "Products public read" on public.products for select using (is_available = true);
create policy "Farmers read own products" on public.products for select using (auth.uid() = farmer_id);
create policy "Farmers insert products" on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmers update own products" on public.products for update using (auth.uid() = farmer_id);
create policy "Farmers delete own products" on public.products for delete using (auth.uid() = farmer_id);

-- Orders
create policy "Consumers read own orders" on public.orders for select using (auth.uid() = consumer_id);
create policy "Farmers read incoming orders" on public.orders for select using (auth.uid() = farmer_id);
create policy "Consumers create orders" on public.orders for insert with check (auth.uid() = consumer_id);
create policy "Farmers update order status" on public.orders for update using (auth.uid() = farmer_id);

-- Order items
create policy "Order items readable" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.consumer_id = auth.uid() or o.farmer_id = auth.uid()))
);
create policy "Order items insertable" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.consumer_id = auth.uid())
);
