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
