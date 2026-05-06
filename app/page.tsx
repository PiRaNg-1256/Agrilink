import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import FeaturedProducts from '@/components/landing/FeaturedProducts'
import FarmerSpotlight from '@/components/landing/FarmerSpotlight'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturedProducts />
      <FarmerSpotlight />
      <Footer />
    </main>
  )
}
