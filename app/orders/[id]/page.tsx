import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import OrderDetailClient from './OrderDetailClient'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

const DEMO_ORDER_DETAIL = {
  id: 'demo-order-001',
  consumer_id: 'demo',
  farmer_id: 'fake-farmer-1',
  status: 'confirmed',
  delivery_type: 'delivery',
  address: '123, Demo Street, Bangalore',
  total_price: 315,
  created_at: new Date().toISOString(),
  farmer: { full_name: 'Demo Farmer', location: 'Bangalore', lat: null, lng: null },
  order_items: [
    { id: 'di1', order_id: 'demo-order-001', quantity: 2, price: 35, products: { id: 'fake-1', name: 'Fresh Tomatoes', image_url: null } },
    { id: 'di2', order_id: 'demo-order-001', quantity: 1, price: 280, products: { id: 'fake-9', name: 'Alphonso Mangoes', image_url: null } },
  ],
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  if (id === 'demo-order-001') {
    return (
      <>
        <Navbar />
        <OrderDetailClient order={DEMO_ORDER_DETAIL} existingDispute={null} />
        <Footer />
      </>
    )
  }

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, price,
        products (id, name, image_url)
      ),
      farmer:profiles!orders_farmer_id_fkey (full_name, location, lat, lng)
    `)
    .eq('id', id)
    .eq('consumer_id', user.id)
    .single()

  if (!order) notFound()

  const { data: existingDispute } = await supabase
    .from('disputes')
    .select('id, status, reason')
    .eq('order_id', id)
    .maybeSingle()

  return (
    <>
      <Navbar />
      <OrderDetailClient order={order} existingDispute={existingDispute ?? null} />
      <Footer />
    </>
  )
}
