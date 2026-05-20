import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTicketWithMessages } from '@/lib/actions/support'
import AdminTicketClient from './AdminTicketClient'

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { ticket, messages } = await getTicketWithMessages(id)
  if (!ticket) redirect('/admin/support')
  return <AdminTicketClient ticket={ticket} messages={messages} adminId={user.id} />
}
