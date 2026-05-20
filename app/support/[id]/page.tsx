import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTicketWithMessages } from '@/lib/actions/support'
import TicketThreadClient from './TicketThreadClient'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { ticket, messages } = await getTicketWithMessages(id)
  if (!ticket || ticket.user_id !== user.id) redirect('/support')
  return <TicketThreadClient ticket={ticket} messages={messages} userId={user.id} />
}
