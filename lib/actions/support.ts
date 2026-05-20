'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTicket(subject: string, category: string, firstMessage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({ user_id: user.id, subject, category })
    .select().single()
  if (error) return { error: error.message }
  await supabase.from('support_messages').insert({
    ticket_id: ticket.id, sender_id: user.id, is_admin: false, message: firstMessage
  })
  revalidatePath('/support')
  return { ticketId: ticket.id }
}

export async function getUserTickets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  return data ?? []
}

export async function getTicketWithMessages(ticketId: string) {
  const supabase = await createClient()
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()
  const { data: messages } = await supabase
    .from('support_messages')
    .select('*, sender:profiles!support_messages_sender_id_fkey(full_name, role)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  return { ticket, messages: messages ?? [] }
}

export async function sendMessage(ticketId: string, message: string, isAdmin = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  await supabase.from('support_messages').insert({
    ticket_id: ticketId, sender_id: user.id, is_admin: isAdmin, message
  })
  await supabase.from('support_tickets')
    .update({ updated_at: new Date().toISOString(), status: isAdmin ? 'in_progress' : 'open' })
    .eq('id', ticketId)
  revalidatePath(`/support/${ticketId}`)
  revalidatePath(`/admin/support/${ticketId}`)
  return { success: true }
}

export async function closeTicket(ticketId: string) {
  const supabase = await createClient()
  await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', ticketId)
  revalidatePath('/support')
  revalidatePath(`/support/${ticketId}`)
}

export async function adminGetAllTickets() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('support_tickets')
    .select('*, user:profiles!support_tickets_user_id_fkey(full_name)')
    .order('updated_at', { ascending: false })
  return data ?? []
}
