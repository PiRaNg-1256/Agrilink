'use client'
import { useMemo } from 'react'
import type { Order } from '@/lib/types'

export default function RevenueChart({ orders }: { orders: Order[] }) {
  const weeklyData = useMemo(() => {
    const now = new Date()
    const weeks: Record<string, number> = {}
    for (let i = 7; i >= 0; i--) {
      weeks[`W${8 - i}`] = 0
    }
    orders
      .filter(o => o.status === 'delivered' || o.status === 'confirmed')
      .forEach(o => {
        const weeksAgo = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (weeksAgo <= 7) {
          const key = `W${8 - weeksAgo}`
          weeks[key] = (weeks[key] || 0) + o.total_price
        }
      })
    return Object.entries(weeks).map(([week, revenue]) => ({ week, revenue }))
  }, [orders])

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1)
  const totalRevenue = orders
    .filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + o.total_price, 0)

  const topProducts: Record<string, { name: string; count: number; revenue: number }> = {}
  orders.forEach(o =>
    (o.order_items ?? []).forEach((item: any) => {
      const name = item.products?.name ?? 'Unknown'
      if (!topProducts[name]) topProducts[name] = { name, count: 0, revenue: 0 }
      topProducts[name].count += item.quantity
      topProducts[name].revenue += item.price * item.quantity
    })
  )
  const sortedProducts = Object.values(topProducts).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-white font-bold mb-1">Weekly Revenue</h3>
        <p className="text-green-400 text-2xl font-black mb-4">₹{totalRevenue.toFixed(0)}</p>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map(d => (
            <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-green-500/20 rounded-t-sm transition-all duration-500 hover:bg-green-500/40"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? '4px' : '2px' }}
              />
              <span className="text-gray-600 text-xs">{d.week}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-white font-bold mb-4">Top Products</h3>
        {sortedProducts.length === 0
          ? <p className="text-gray-500 text-sm">No sales yet.</p>
          : <div className="space-y-3">
              {sortedProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm">{p.name}</span>
                      <span className="text-green-400 text-sm font-bold">₹{p.revenue.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(p.revenue / (sortedProducts[0]?.revenue || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
