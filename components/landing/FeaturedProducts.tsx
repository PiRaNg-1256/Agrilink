import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

const FAKE_PRODUCTS = [
  { id: 'f1', name: 'Fresh Tomatoes', category: 'vegetables', price: 35, unit: 'kg', description: 'Sun-ripened tomatoes grown without pesticides in Karnataka highlands.', image_url: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&q=80', farmer_location: 'Kolar, Karnataka' },
  { id: 'f2', name: 'Alphonso Mangoes', category: 'fruits', price: 280, unit: 'dozen', description: 'Premium Alphonso mangoes from Ratnagiri. Sweet, aromatic, naturally ripened.', image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80', farmer_location: 'Ratnagiri, Maharashtra' },
  { id: 'f3', name: 'Organic Spinach', category: 'vegetables', price: 25, unit: 'bunch', description: 'Fresh organic spinach, harvested daily. Rich in iron and nutrients.', image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', farmer_location: 'Mysuru, Karnataka' },
  { id: 'f4', name: 'A2 Cow Milk', category: 'dairy', price: 80, unit: 'litre', description: 'Pure A2 milk from grass-fed Gir cows. No hormones, no preservatives.', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', farmer_location: 'Thrissur, Kerala' },
  { id: 'f5', name: 'Brown Rice', category: 'grains', price: 95, unit: 'kg', description: 'Traditional brown rice from Cauvery delta. Unpolished, naturally nutritious.', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', farmer_location: 'Thanjavur, Tamil Nadu' },
  { id: 'f6', name: 'Green Chilies', category: 'vegetables', price: 60, unit: 'kg', description: 'Freshly picked green chilies from Guntur farms. Medium-hot, packed with flavour.', image_url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&q=80', farmer_location: 'Guntur, Andhra Pradesh' },
]

function ProductCard({ id, name, category, price, unit, description, image_url, location }: {
  id: string; name: string; category: string; price: number; unit: string;
  description: string; image_url: string; location: string;
}) {
  return (
    <Link href={`/product/${id}`}>
      <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-green-400/40 transition-all hover:-translate-y-1">
        <div className="h-48 bg-gradient-to-br from-green-900/30 to-yellow-900/20 flex items-center justify-center overflow-hidden">
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white">{name}</h3>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">{category}</Badge>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-green-400 font-bold text-lg">₹{price}<span className="text-gray-500 text-sm font-normal">/{unit}</span></span>
            <span className="text-xs text-gray-500">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function FeaturedProducts() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, profiles(full_name, location)')
    .eq('is_available', true)
    .limit(6)
    .order('created_at', { ascending: false })

  const items: Product[] = products ?? []
  const showFake = items.length === 0

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showFake
            ? FAKE_PRODUCTS.map(p => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category}
                  price={p.price}
                  unit={p.unit}
                  description={p.description}
                  image_url={p.image_url}
                  location={p.farmer_location}
                />
              ))
            : items.map(p => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category}
                  price={p.price}
                  unit={p.unit}
                  description={p.description ?? ''}
                  image_url={p.image_url ?? ''}
                  location={(p as any).profiles?.location ?? 'Local Farm'}
                />
              ))}
        </div>
      </div>
    </section>
  )
}
