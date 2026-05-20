'use client'
import { useTransition } from 'react'
import { updateOrderStatus } from '@/lib/actions/orders'
import FarmerDisputeResponder from '@/components/disputes/FarmerDisputeResponder'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Order, OrderStatus } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  confirmed: 'text-blue-400',
  shipped: 'text-purple-400',
  delivered: 'text-green-400',
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [isPending, startTransition] = useTransition()

  const handleStatus = (orderId: string, status: OrderStatus) => {
    startTransition(async () => {
      try { await updateOrderStatus(orderId, status); toast.success('Status updated') }
      catch (err: any) { toast.error(err.message) }
    })
  }

  if (orders.length === 0) return <div className="text-center py-16 text-gray-500">No orders yet.</div>

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const consumer = (order as any).profiles
        return (
          <div key={order.id} className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-white font-bold">Order #{order.id.slice(0, 8)}</p>
                <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                {consumer && <p className="text-gray-400 text-sm mt-1">👤 {consumer.full_name}{consumer.phone ? ` · ${consumer.phone}` : ''}</p>}
                <p className="text-gray-500 text-xs mt-1 capitalize">{order.delivery_type}{order.address ? `: ${order.address}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold capitalize ${statusColors[order.status]}`}>{order.status}</span>
                <Select defaultValue={order.status} onValueChange={v => handleStatus(order.id, v as OrderStatus)} disabled={isPending}>
                  <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['pending','confirmed','shipped','delivered'].map(s => (
                      <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-t border-white/5">
                <span className="text-gray-300">{(item as any).products?.name} × {item.quantity} {(item as any).products?.unit}</span>
                <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-end pt-3 border-t border-white/10 mt-2">
              <span className="text-green-400 font-bold">₹{order.total_price.toFixed(2)}</span>
            </div>
            {/* Show dispute if one exists on this order */}
            {(() => {
              const disputes = (order as any).disputes
              const dispute = Array.isArray(disputes) ? disputes[0] : disputes
              return dispute ? <FarmerDisputeResponder dispute={dispute} /> : null
            })()}
          </div>
        )
      })}
    </div>
  )
}
