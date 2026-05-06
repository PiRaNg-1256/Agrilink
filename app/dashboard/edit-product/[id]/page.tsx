import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import ProductForm from '@/components/products/ProductForm'
import { getProduct } from '@/lib/actions/products'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">Edit Product</h1>
          <ProductForm product={product} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
