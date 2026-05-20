'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { getConsumerOrders } from '@/lib/actions/orders'
import { useCart } from '@/components/cart/CartProvider'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { RefreshCw } from 'lucide-react'
import type { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
}

const DEMO_ORDER: Order = {
  id: 'demo-order-001',
  consumer_id: 'demo',
  farmer_id: 'fake-farmer-1',
  status: 'confirmed',
  delivery_type: 'delivery',
  address: '123, Demo Street, Bangalore',
  total_price: 315,
  created_at: new Date().toISOString(),
  order_items: [
    { id: 'di1', order_id: 'demo-order-001', product_id: 'fake-1', quantity: 2, price: 35, products: { id: 'fake-1', farmer_id: 'fake-farmer-1', name: 'Fresh Tomatoes', description: null, price: 35, unit: 'kg', stock: 50, category: 'vegetables', image_url: null, delivery_type: 'both', delivery_area: null, pickup_location: null, is_available: true, created_at: new Date().toISOString() } },
    { id: 'di2', order_id: 'demo-order-001', product_id: 'fake-9', quantity: 1, price: 280, products: { id: 'fake-9', farmer_id: 'fake-farmer-7', name: 'Alphonso Mangoes', description: null, price: 280, unit: 'dozen', stock: 20, category: 'fruits', image_url: null, delivery_type: 'delivery', delivery_area: null, pickup_location: null, is_available: true, created_at: new Date().toISOString() } },
  ] as any,
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === '1'

  useEffect(() => {
    getConsumerOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false))
  }, [])

  const displayOrders = orders.length > 0 ? orders : [DEMO_ORDER]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-8">{t.orders.title}</h1>
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {t.orders.noOrders} <a href="/shop" className="text-green-400 hover:underline">Start shopping!</a>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map(order => (
            <div key={order.id} className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-bold">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {order.id === 'demo-order-001' && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full mt-1 inline-block">Demo Order</span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status]}`}>
                  {t.orders.status[order.status] ?? order.status}
                </span>
              </div>
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-t border-white/5">
                  <span className="text-gray-300">{(item as any).products?.name} × {item.quantity} {(item as any).products?.unit}</span>
                  <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-2">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm capitalize">{order.delivery_type}</span>
                  {order.order_items && order.order_items.length > 0 && (
                    <button onClick={() => {
                      order.order_items?.forEach(item => {
                        if ((item as any).products) addItem((item as any).products, item.quantity)
                      })
                      router.push('/cart')
                    }} className="text-green-400 text-sm hover:text-green-300 transition-colors flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> {t.orders.reorder}
                    </button>
                  )}
                  <a href={`/orders/${order.id}`} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                    View Details →
                  </a>
                </div>
                <span className="text-green-400 font-bold">₹{order.total_price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <Suspense fallback={<div className="pt-32 text-center text-gray-500">Loading...</div>}>
          <OrdersContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
