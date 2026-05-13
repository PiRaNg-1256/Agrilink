'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Review {
  id: string
  product_id: string
  consumer_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: { full_name: string | null }
}

const FAKE_REVIEWS: Record<string, Review[]> = {}

function getFakeReviews(productId: string): Review[] {
  return [
    { id: 'r1', product_id: productId, consumer_id: 'c1', rating: 5, comment: 'Absolutely fresh! Arrived within hours of order. Will buy again.', created_at: new Date(Date.now() - 86400000).toISOString(), profiles: { full_name: 'Priya S.' } },
    { id: 'r2', product_id: productId, consumer_id: 'c2', rating: 4, comment: 'Good quality, better than what I get at the supermarket. Slightly smaller quantity than expected but worth it.', created_at: new Date(Date.now() - 172800000).toISOString(), profiles: { full_name: 'Rahul M.' } },
    { id: 'r3', product_id: productId, consumer_id: 'c3', rating: 5, comment: 'Farmer was very responsive. Produce was exactly as described. Highly recommended!', created_at: new Date(Date.now() - 259200000).toISOString(), profiles: { full_name: 'Anjali V.' } },
  ]
}

export async function getReviews(productId: string): Promise<Review[]> {
  if (productId.startsWith('fake-')) {
    return [...getFakeReviews(productId), ...(FAKE_REVIEWS[productId] ?? [])]
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Review[]
}

export async function submitReview(productId: string, rating: number, comment: string) {
  if (productId.startsWith('fake-')) return
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to review')
  const { error } = await supabase.from('reviews').upsert(
    { product_id: productId, consumer_id: user.id, rating, comment },
    { onConflict: 'product_id,consumer_id' }
  )
  if (error) throw error
  revalidatePath(`/product/${productId}`)
}

export async function getUserReview(productId: string) {
  if (productId.startsWith('fake-')) return null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('consumer_id', user.id)
    .single()
  return data as Review | null
}
