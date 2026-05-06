'use client'
import { useInView } from '@/hooks/useInView'

const FARMER_STORIES = [
  { name: 'Ravi Kumar', farm: 'Kumar Organics', location: 'Kolar, Karnataka', crops: 'Tomatoes, Beans, Greens', income_increase: '40%', quote: 'I was selling tomatoes at ₹8/kg to the mandi agent. On Agrilink I sell at ₹35/kg directly. Same tomatoes, four times the money. My family has a proper house now.', avatar: 'RK', years: 3, rating: 5 },
  { name: 'Meena Devi', farm: 'Devi Natural Farm', location: 'Mysuru, Karnataka', crops: 'Spinach, Herbs, Flowers', income_increase: '65%', quote: 'Before Agrilink, I had to rely on middlemen who decided what my work was worth. Now my customers message me directly and tell me my spinach is the best they have ever tasted.', avatar: 'MD', years: 12, rating: 5 },
  { name: 'Suresh Patil', farm: 'Patil Alphonso Estate', location: 'Ratnagiri, Maharashtra', crops: 'Alphonso Mangoes', income_increase: '55%', quote: 'Mango season used to be stressful — would the agent come? Would he take everything? Now I list on Agrilink and orders come in before the mangoes are even fully ripe.', avatar: 'SP', years: 22, rating: 5 },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function FarmerCard({ story, index }: { story: typeof FARMER_STORIES[0]; index: number }) {
  const { ref, visible } = useInView()
  const isEven = index % 2 === 0
  const animClass = visible
    ? isEven ? 'animate-slide-in-left' : 'animate-slide-in-right'
    : 'invisible-until-visible'

  return (
    <div
      ref={ref}
      className={`p-8 rounded-2xl border border-green-900/40 bg-gradient-to-br from-green-950/40 to-[#0d0d1a] ${animClass}`}
    >
      <div className={`flex flex-col md:flex-row gap-8 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
        {/* Farmer info */}
        <div className="flex-shrink-0 md:w-56">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-4">
            <span className="text-white text-xl font-black">{story.avatar}</span>
          </div>
          <h3 className="text-white font-bold text-lg">{story.name}</h3>
          <p className="text-green-400 text-sm font-medium">{story.farm}</p>
          <p className="text-gray-500 text-sm mt-1">{story.location}</p>
          <p className="text-gray-500 text-xs mt-1">{story.crops}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
              +{story.income_increase} income
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Stars count={story.rating} />
          </div>
          <p className="text-gray-600 text-xs mt-1">{story.years} years farming</p>
        </div>
        {/* Quote */}
        <div className="flex-1 flex items-center">
          <blockquote className="text-gray-200 text-lg md:text-xl italic leading-relaxed border-l-2 border-green-500/40 pl-6">
            "{story.quote}"
          </blockquote>
        </div>
      </div>
    </div>
  )
}

function SectionTitle() {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={`text-center mb-14 ${visible ? 'animate-fade-in-up' : 'invisible-until-visible'}`}>
      <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Farmer Stories</span>
      <h2 className="text-4xl md:text-5xl font-black text-white mt-4">Farmers who changed their lives.</h2>
    </div>
  )
}

export default function FarmerTestimonials() {
  return (
    <section className="py-24 px-4 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto">
        <SectionTitle />
        <div className="flex flex-col gap-6">
          {FARMER_STORIES.map((story, i) => (
            <FarmerCard key={story.name} story={story} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
