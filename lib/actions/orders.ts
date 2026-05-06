'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Order, CartItem, OrderStatus } from '@/lib/types'

export async function createOrder(
  items: CartItem[],
  deliveryType: 'delivery' | 'pickup',
  address: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (items.length === 0) throw new Error('Cart is empty')

  const byFarmer = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const fid = item.product.farmer_id
    if (!acc[fid]) acc[fid] = []
    acc[fid].push(item)
    return acc
  }, {})

  for (const [farmerId, farmerItems] of Object.entries(byFarmer)) {
    const total = farmerItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      consumer_id: user.id,
      farmer_id: farmerId,
      delivery_type: deliveryType,
      address: deliveryType === 'delivery' ? address : null,
      total_price: total,
    }).select().single()
    if (orderError) throw orderError

    const orderItems = farmerItems.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      price: i.product.price,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError
  }

  revalidatePath('/orders')
}

export async function getConsumerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, unit, image_url)), profiles!farmer_id(full_name)')
    .eq('consumer_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function getFarmerOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, unit)), profiles!consumer_id(full_name, phone)')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Order[]
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId).eq('farmer_id', user.id)
  if (error) throw error
  revalidatePath('/dashboard/orders')
}
