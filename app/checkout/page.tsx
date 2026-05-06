import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import FakePaymentForm from '@/components/checkout/FakePaymentForm'

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-10 text-center">Checkout</h1>
          <FakePaymentForm />
        </div>
      </div>
      <Footer />
    </main>
  )
}
