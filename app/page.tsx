import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import CropPriceTicker from '@/components/landing/CropPriceTicker'
import SeasonalHighlights from '@/components/landing/SeasonalHighlights'
import FeaturedProducts from '@/components/landing/FeaturedProducts'
import ConsumerTestimonials from '@/components/landing/ConsumerTestimonials'
import FarmerTestimonials from '@/components/landing/FarmerTestimonials'
import PlatformComparison from '@/components/landing/PlatformComparison'
import FarmerSpotlight from '@/components/landing/FarmerSpotlight'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <CropPriceTicker />
      <SeasonalHighlights />
      <FeaturedProducts />
      <ConsumerTestimonials />
      <FarmerTestimonials />
      <PlatformComparison />
      <FarmerSpotlight />
      <Footer />
    </main>
  )
}
