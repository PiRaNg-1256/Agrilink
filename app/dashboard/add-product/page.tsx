import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import AddProductTabs from '@/components/products/AddProductTabs'

export default function AddProductPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-8">List New Product</h1>
          <AddProductTabs />
        </div>
      </div>
      <Footer />
    </main>
  )
}
