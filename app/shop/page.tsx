import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ProductGrid from '@/components/products/ProductGrid'
import { getProducts } from '@/lib/actions/products'

export default async function ShopPage() {
  const products = await getProducts()
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Fresh Produce</span>
            <h1 className="text-4xl font-black text-white mt-2">Shop Direct<br/><span className="text-gray-500">from farmers.</span></h1>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
