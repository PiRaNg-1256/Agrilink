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
