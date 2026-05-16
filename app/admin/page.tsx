import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalFarmers },
    { count: totalProducts },
    { count: totalOrders },
    { count: openDisputes },
    { data: revenueRows },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('orders').select('total_price'),
  ])

  const totalRevenue = revenueRows?.reduce((sum, o) => sum + (o.total_price ?? 0), 0) ?? 0

  const stats = [
    { label: 'Total Users',    value: totalUsers ?? 0,                             color: 'text-blue-400' },
    { label: 'Farmers',        value: totalFarmers ?? 0,                           color: 'text-green-400' },
    { label: 'Products',       value: totalProducts ?? 0,                          color: 'text-yellow-400' },
    { label: 'Orders',         value: totalOrders ?? 0,                            color: 'text-purple-400' },
    { label: 'Open Disputes',  value: openDisputes ?? 0,                           color: 'text-red-400' },
    { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`,  color: 'text-emerald-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
