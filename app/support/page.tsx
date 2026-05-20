import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserTickets } from '@/lib/actions/support'
import SupportPageClient from './SupportPageClient'

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const tickets = await getUserTickets()
  return <SupportPageClient tickets={tickets} />
}
