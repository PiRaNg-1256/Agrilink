import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import OrdersTable from '@/components/dashboard/OrdersTable'
import { getFarmerOrders } from '@/lib/actions/orders'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FarmerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'farmer') redirect('/')

  const orders = await getFarmerOrders()
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4 mr-1" />Dashboard</Button></Link>
            <h1 className="text-3xl font-black text-white">Incoming Orders</h1>
          </div>
          <OrdersTable orders={orders} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
