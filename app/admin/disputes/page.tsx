import { createClient } from '@/lib/supabase/server'
import AdminDisputeCard from './AdminDisputeCard'

export default async function AdminDisputesPage() {
  const supabase = await createClient()
  const { data: disputes } = await supabase
    .from('disputes')
    .select(`
      *,
      order:orders (id, total_price, status),
      consumer:profiles!disputes_consumer_id_fkey (full_name),
      farmer:profiles!disputes_farmer_id_fkey (full_name)
    `)
    .order('created_at', { ascending: false })

  const open = disputes?.filter((d) => d.status === 'open' || d.status === 'under_review') ?? []
  const closed = disputes?.filter((d) => d.status === 'resolved' || d.status === 'closed') ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Disputes — <span className="text-red-400">{open.length} open</span>
      </h1>

      {open.length === 0 && (
        <p className="text-gray-500 text-center py-12">No open disputes</p>
      )}

      <div className="space-y-4 mb-8">
        {open.map((d) => <AdminDisputeCard key={d.id} dispute={d} />)}
      </div>

      {closed.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-500 mb-4">Closed Disputes</h2>
          <div className="space-y-3">
            {closed.map((d) => <AdminDisputeCard key={d.id} dispute={d} />)}
          </div>
        </>
      )}
    </div>
  )
}
