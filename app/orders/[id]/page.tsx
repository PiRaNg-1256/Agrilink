import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import OrderDetailClient from './OrderDetailClient'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

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
