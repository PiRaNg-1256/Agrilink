import { adminGetAllTickets } from '@/lib/actions/support'
import { createClient } from '@/lib/supabase/server'
import UnifiedSupportClient from './UnifiedSupportClient'

export default async function AdminSupportPage() {
  const tickets = await adminGetAllTickets()
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
  return <UnifiedSupportClient tickets={tickets} disputes={disputes ?? []} />
}
