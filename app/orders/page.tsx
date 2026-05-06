import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { getConsumerOrders } from '@/lib/actions/orders'
import type { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
}

export default async function OrdersPage() {
  const orders: Order[] = await getConsumerOrders()

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">My Orders</h1>
          {orders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No orders yet. <a href="/shop" className="text-green-400 hover:underline">Start shopping!</a></div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-bold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColors[order.status]}`}>{order.status}</span>
                  </div>
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-t border-white/5">
                      <span className="text-gray-300">{(item as any).products?.name} × {item.quantity} {(item as any).products?.unit}</span>
                      <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-white/10 mt-2">
                    <span className="text-gray-400 text-sm capitalize">{order.delivery_type}</span>
                    <span className="text-green-400 font-bold">₹{order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
