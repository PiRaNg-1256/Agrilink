'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!p?.is_admin) return null
  return { supabase, user }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: 'Not authorized' }
  await ctx.supabase.from('profiles').update({ is_active: isActive }).eq('id', userId)
  revalidatePath('/admin/users')
}

export async function resolveDispute(disputeId: string, status: 'resolved' | 'closed', resolution: string) {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: 'Not authorized' }
  await ctx.supabase.from('disputes').update({
    status,
    resolution: resolution.trim() || null,
    resolved_at: new Date().toISOString(),
  }).eq('id', disputeId)
  revalidatePath('/admin/disputes')
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: 'Not authorized' }
  await ctx.supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath('/admin/orders')
}
