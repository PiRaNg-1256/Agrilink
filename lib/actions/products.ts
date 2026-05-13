'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Product } from '@/lib/types'
import { FAKE_SHOP_PRODUCTS } from '@/lib/fakeData'

export async function getProducts(category?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*, profiles(full_name, location, id)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
  if (category && category !== 'all') query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  const real = (data ?? []) as Product[]
  if (real.length >= 5) return real
  const fakeFiltered = category && category !== 'all'
    ? FAKE_SHOP_PRODUCTS.filter(fp => fp.category === category)
    : FAKE_SHOP_PRODUCTS
  const realIds = new Set(real.map(r => r.id))
  const merged = [...real, ...fakeFiltered.filter(fp => !realIds.has(fp.id))]
  return merged
}

export async function getFarmerProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Product[]
}

export async function getProduct(id: string) {
  if (id.startsWith('fake-')) {
    const fake = FAKE_SHOP_PRODUCTS.find(p => p.id === id)
    if (!fake) throw new Error('Product not found')
    return fake
  }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, profiles(full_name, location, phone, id)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Product
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let image_url: string | null = null
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = publicUrl
    }
  }

  const { error } = await supabase.from('products').insert({
    farmer_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    unit: formData.get('unit') as string,
    stock: parseInt(formData.get('stock') as string),
    category: formData.get('category') as string,
    delivery_type: formData.get('delivery_type') as string,
    delivery_area: formData.get('delivery_area') as string || null,
    pickup_location: formData.get('pickup_location') as string || null,
    image_url,
  })
  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath('/shop')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let image_url: string | undefined
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = publicUrl
    }
  }

  const updates: Record<string, any> = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    unit: formData.get('unit') as string,
    stock: parseInt(formData.get('stock') as string),
    category: formData.get('category') as string,
    delivery_type: formData.get('delivery_type') as string,
    delivery_area: formData.get('delivery_area') as string || null,
    pickup_location: formData.get('pickup_location') as string || null,
  }
  if (image_url) updates.image_url = image_url

  const { error } = await supabase.from('products').update(updates).eq('id', id).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard')
  revalidatePath(`/product/${id}`)
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase.from('products').delete().eq('id', id).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard')
}

export async function toggleProductAvailability(id: string, is_available: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase.from('products').update({ is_available }).eq('id', id).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard')
}
