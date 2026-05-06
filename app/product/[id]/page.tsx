'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProduct } from '@/lib/actions/products'
import { useCart } from '@/components/cart/CartProvider'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import { ShoppingCart, MapPin, Truck, Store } from 'lucide-react'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
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

              <div className="flex gap-3 mb-2 text-sm flex-wrap">
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
                <Button onClick={() => { addItem(product, qty); toast.success('Added to cart!') }}
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
