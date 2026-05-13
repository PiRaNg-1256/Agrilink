import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { createClient } from '@/lib/supabase/server'
import { FAKE_SHOP_PRODUCTS, FAKE_FARMERS } from '@/lib/fakeData'
import ProductCard from '@/components/products/ProductCard'
import FavFarmerButton from '@/components/products/FavFarmerButton'
import { MapPin, Star, Package } from 'lucide-react'

export default async function FarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let farmer: any = null
  let products: any[] = []

  if (id.startsWith('fake-')) {
    farmer = FAKE_FARMERS.find(f => f.id === id)
    products = FAKE_SHOP_PRODUCTS.filter(p => p.farmer_id === id)
  } else {
    const supabase = await createClient()
    const [{ data: farmerData }, { data: productsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('products').select('*, profiles(full_name, location, id)').eq('farmer_id', id).eq('is_available', true),
    ])
    farmer = farmerData
    products = productsData ?? []
  }

  if (!farmer) return (
    <main><Navbar />
      <div className="pt-32 text-center text-gray-500">Farmer not found.</div>
    </main>
  )

  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6 mb-12 p-8 rounded-3xl border border-white/10 bg-white/5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center text-black font-black text-2xl shrink-0">
              {farmer.full_name?.[0] ?? 'F'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-1">{farmer.full_name}</h1>
              {farmer.location && (
                <p className="text-gray-400 flex items-center gap-1 mb-3">
                  <MapPin className="w-4 h-4" />{farmer.location}
                </p>
              )}
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500"><Package className="w-4 h-4 inline mr-1" />{products.length} listings</span>
                <span className="text-yellow-400"><Star className="w-4 h-4 inline mr-1 fill-yellow-400" />4.8 avg rating</span>
              </div>
            </div>
            <FavFarmerButton farmerId={id} />
          </div>
          <h2 className="text-xl font-bold text-white mb-6">Products by {farmer.full_name}</h2>
          {products.length === 0
            ? <p className="text-gray-500">No products listed yet.</p>
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
          }
        </div>
      </div>
      <Footer />
    </main>
  )
}
