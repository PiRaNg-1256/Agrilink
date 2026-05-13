'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string) {
  if (productId.startsWith('fake-')) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('consumer_id', user.id)
    .eq('product_id', productId)
    .single()
  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
  } else {
    await supabase.from('wishlists').insert({ consumer_id: user.id, product_id: productId })
  }
  revalidatePath('/shop')
}

export async function getWishlist(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('consumer_id', user.id)
  return data?.map(d => d.product_id) ?? []
}

export async function toggleFavouriteFarmer(farmerId: string) {
  if (farmerId.startsWith('fake-')) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  const { data: existing } = await supabase
    .from('favourite_farmers')
    .select('id')
    .eq('consumer_id', user.id)
    .eq('farmer_id', farmerId)
    .single()
  if (existing) {
    await supabase.from('favourite_farmers').delete().eq('id', existing.id)
  } else {
    await supabase.from('favourite_farmers').insert({ consumer_id: user.id, farmer_id: farmerId })
  }
}

export async function isFavouriteFarmer(farmerId: string): Promise<boolean> {
  if (farmerId.startsWith('fake-')) return false
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('favourite_farmers')
    .select('id')
    .eq('consumer_id', user.id)
    .eq('farmer_id', farmerId)
    .single()
  return !!data
}
