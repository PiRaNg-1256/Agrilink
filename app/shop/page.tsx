import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ProductGrid from '@/components/products/ProductGrid'
import { getProducts } from '@/lib/actions/products'
import ShopHeader from '@/components/shop/ShopHeader'

export default async function ShopPage() {
  const products = await getProducts()
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ShopHeader />
          <ProductGrid products={products} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
