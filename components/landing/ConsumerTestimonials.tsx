'use client'
import { useInView } from '@/hooks/useInView'

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Bengaluru', rating: 5, text: 'I switched from BigBasket to Agrilink and the difference in freshness is unbelievable. My tomatoes last 5 days longer and I know exactly which farm they came from.', avatar: 'PS', product: 'Fresh Vegetables' },
  { name: 'Rahul Menon', location: 'Kochi', rating: 5, text: 'Ordered A2 milk directly from a farmer 40km away. It arrived the same morning. My kids refuse to drink packaged milk now.', avatar: 'RM', product: 'Dairy Products' },
  { name: 'Anjali Verma', location: 'Pune', rating: 5, text: 'The Alphonso mangoes were exactly what my grandmother used to get from the market. Not the cold storage ones you find in supermarkets. Real stuff.', avatar: 'AV', product: 'Alphonso Mangoes' },
  { name: 'Deepak Nair', location: 'Chennai', rating: 4, text: "Prices are 20-30% lower than what I was paying at Spencer's. And I get to chat with the farmer directly if I have questions. This is how it should work.", avatar: 'DN', product: 'Rice & Grains' },
  { name: 'Shalini Gupta', location: 'Hyderabad', rating: 5, text: 'As a mother of two, I was worried about pesticides. Agrilink lets me buy from certified organic farmers directly. No more guessing if the "organic" label is real.', avatar: 'SG', product: 'Organic Produce' },
  { name: 'Vikram Iyer', location: 'Mumbai', rating: 5, text: 'Picked up fresh spinach from a farm just 15km from my house. I never knew local farming was this close. Agrilink opened my eyes to what\'s around me.', avatar: 'VI', product: 'Leafy Greens' },
]

const delays = ['0ms', '100ms', '200ms', '300ms', '400ms', '500ms']

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TestimonialCard({ t, delay }: { t: typeof TESTIMONIALS[0]; delay: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`flex-shrink-0 w-80 md:w-auto p-6 rounded-2xl border border-green-500/20 bg-white/[0.03] hover:border-green-500/40 transition-colors ${
        visible ? 'animate-fade-in-up' : 'invisible-until-visible'
      }`}
      style={{ animationDelay: delay }}
    >
      <Stars count={t.rating} />
      <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{t.avatar}</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{t.name}</p>
          <p className="text-gray-500 text-xs">{t.location} · {t.product}</p>
        </div>
      </div>
    </div>
  )
}

function SectionTitle() {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={`text-center mb-14 ${visible ? 'animate-fade-in-up' : 'invisible-until-visible'}`}>
      <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Real People, Real Food</span>
      <h2 className="text-4xl md:text-5xl font-black text-white mt-4">What our customers say.</h2>
    </div>
  )
}

export default function ConsumerTestimonials() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionTitle />
        {/* Mobile: horizontal scroll */}
        <div className="flex md:hidden gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className="snap-start">
              <TestimonialCard t={t} delay={delays[i]} />
            </div>
          ))}
        </div>
        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} delay={delays[i]} />
          ))}
        </div>
      </div>
    </section>
  )
}
