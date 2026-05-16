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
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700" />
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
