import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import StatsCards from '@/components/dashboard/StatsCards'
import ListingsGrid from '@/components/dashboard/ListingsGrid'
import { getFarmerProducts } from '@/lib/actions/products'
import { getFarmerOrders } from '@/lib/actions/orders'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const [products, orders] = await Promise.all([getFarmerProducts(), getFarmerOrders()])
  const pending = orders.filter(o => o.status === 'pending').length

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Farmer</span>
              <h1 className="text-3xl font-black text-white mt-1">My Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/orders">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View Orders {pending > 0 && <span className="ml-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{pending}</span>}
                </Button>
              </Link>
              <Link href="/dashboard/add-product">
                <Button className="bg-green-500 hover:bg-green-400 text-black font-bold"><Plus className="w-4 h-4 mr-1" />Add Product</Button>
              </Link>
            </div>
          </div>
          <StatsCards productCount={products.length} orderCount={orders.length} pendingCount={pending} />
          <h2 className="text-xl font-bold text-white mb-5">My Listings</h2>
          <ListingsGrid products={products} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
