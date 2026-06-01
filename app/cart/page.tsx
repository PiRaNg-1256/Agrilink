'use client'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { useCart } from '@/components/cart/CartProvider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const { t } = useLanguage()

  if (items.length === 0) return (
    <main><Navbar />
      <div className="pt-32 pb-20 text-center px-4">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-white mb-2">{t.cart.empty}</h2>
        <p className="text-gray-500 mb-8">Add some fresh produce to get started.</p>
        <Link href="/shop"><Button className="bg-green-500 hover:bg-green-400 text-black font-bold">{t.cart.browseProducts}</Button></Link>
      </div>
      <Footer />
    </main>
  )

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">{t.cart.title}</h1>
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
              <p className="text-gray-400 text-sm">{t.cart.total}</p>
              <p className="text-3xl font-black text-white">₹{total.toFixed(2)}</p>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8">{t.cart.checkout}</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
