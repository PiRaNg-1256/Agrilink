'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toggleWishlist, getWishlist } from '@/lib/actions/wishlist'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ProductCard({ product }: { product: Product }) {
  const p = product
  const [wished, setWished] = useState(false)
  const [isConsumer, setIsConsumer] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (data?.role === 'consumer') {
        setIsConsumer(true)
        if (!p.id.startsWith('fake-')) {
          const list = await getWishlist()
          setWished(list.includes(p.id))
        }
      }
    })
  }, [p.id])

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isConsumer) { router.push('/auth'); return }
    if (p.id.startsWith('fake-')) { toast.info('Demo product — wishlist not available'); return }
    try {
      await toggleWishlist(p.id)
      setWished(w => !w)
    } catch {
      toast.error('Could not update wishlist')
    }
  }

  const farmerProfile = (p as any).profiles

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-green-400/40 transition-all hover:-translate-y-1 relative">
      <Link href={`/product/${p.id}`} className="block">
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
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{p.description}</p>
          {farmerProfile?.full_name && (
            <p className="text-gray-500 text-xs mb-2 hover:text-green-400 transition-colors"
              onClick={e => { e.preventDefault(); router.push(`/farmer/${p.farmer_id}`) }}>
              {farmerProfile.full_name} · {farmerProfile.location}
            </p>
          )}
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
      </Link>
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
        aria-label="Wishlist">
        <Heart className={`w-4 h-4 transition-colors ${wished ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
      </button>
    </div>
  )
}
