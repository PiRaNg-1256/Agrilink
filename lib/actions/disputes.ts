'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function fileDispute(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const orderId = formData.get('order_id') as string
  const reason = formData.get('reason') as string
  if (!reason?.trim()) return { error: 'Reason required' }

  const { data: order } = await supabase.from('orders').select('farmer_id').eq('id', orderId).single()
  if (!order) return { error: 'Order not found' }

  const { error } = await supabase.from('disputes').insert({
    order_id: orderId,
    consumer_id: user.id,
    farmer_id: order.farmer_id,
    reason: reason.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/orders')
  return { success: true }
}

export async function getDisputeForOrder(orderId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('disputes').select('id, status, reason').eq('order_id', orderId).single()
  return data
}

export async function farmerRespondToDispute(disputeId: string, response: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('disputes')
    .update({ farmer_response: response, status: 'under_review' })
    .eq('id', disputeId)
    .eq('farmer_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function getDisputesForFarmer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('disputes')
    .select('*, order:orders(id, total_price, status)')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
  return data ?? []
}
