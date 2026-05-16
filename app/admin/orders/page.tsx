import { createClient } from '@/lib/supabase/server'
import AdminOrderStatus from './AdminOrderStatus'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, status, delivery_type, total_price, created_at,
      consumer:profiles!orders_consumer_id_fkey (full_name),
      farmer:profiles!orders_farmer_id_fkey (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const statusColors: Record<string, string> = {
    pending:   'bg-gray-800 text-gray-400',
    confirmed: 'bg-blue-900/50 text-blue-400',
    shipped:   'bg-yellow-900/50 text-yellow-400',
    delivered: 'bg-green-900/50 text-green-400',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Orders ({orders?.length ?? 0})</h1>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              {['Order ID', 'Consumer', 'Farmer', 'Total', 'Type', 'Status', 'Date', 'Action'].map((h) => (
                <th key={h} className="text-left text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-gray-300">{(o.consumer as any)?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-300">{(o.farmer as any)?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-white font-medium">₹{o.total_price}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">{o.delivery_type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <AdminOrderStatus orderId={o.id} currentStatus={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
