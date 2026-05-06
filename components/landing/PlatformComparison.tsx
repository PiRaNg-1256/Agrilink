'use client'
import { useInView } from '@/hooks/useInView'

const FEATURES = [
  { feature: 'Farm-to-home freshness', agrilink: true, mandi: false, superapp: false },
  { feature: 'Know your farmer', agrilink: true, mandi: false, superapp: false },
  { feature: 'Zero middlemen', agrilink: true, mandi: false, superapp: false },
  { feature: 'Farmer gets fair price', agrilink: true, mandi: false, superapp: false },
  { feature: 'Organic verified produce', agrilink: true, mandi: false, superapp: 'partial' },
  { feature: 'Direct farmer support', agrilink: true, mandi: false, superapp: false },
  { feature: 'Seasonal local varieties', agrilink: true, mandi: true, superapp: false },
  { feature: 'Price transparency', agrilink: true, mandi: false, superapp: false },
  { feature: 'Same-day delivery available', agrilink: true, mandi: false, superapp: true },
]

function Check() {
  return <span className="text-green-400 font-bold text-lg">✓</span>
}
function Cross() {
  return <span className="text-red-500/70 font-bold text-lg">✗</span>
}
function Partial() {
  return <span className="text-yellow-400 font-bold text-lg">~</span>
}

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check />
  if (value === 'partial') return <Partial />
  return <Cross />
}

export default function PlatformComparison() {
  const { ref, visible } = useInView(0.1)

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">The Difference</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4">Why Agrilink?</h2>
        </div>

        <div
          ref={ref}
          className={`rounded-2xl overflow-hidden border border-white/10 ${visible ? 'animate-fade-in-up' : 'invisible-until-visible'}`}
        >
          {/* Header */}
          <div className="grid grid-cols-4 bg-white/5">
            <div className="p-4 text-gray-500 text-sm font-medium">Feature</div>
            <div className="p-4 text-center bg-green-500/10 border-l border-r border-green-500/20">
              <div className="text-green-400 font-black text-sm">Agrilink</div>
              <div className="text-green-600 text-xs">Direct farm marketplace</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-gray-400 font-bold text-sm">Mandi</div>
              <div className="text-gray-600 text-xs">Traditional market</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-gray-400 font-bold text-sm">BigBasket</div>
              <div className="text-gray-600 text-xs">Superapp</div>
            </div>
          </div>

          {/* Rows */}
          {FEATURES.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-4 border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
            >
              <div className="p-4 text-gray-300 text-sm flex items-center">{row.feature}</div>
              <div className="p-4 text-center bg-green-500/5 border-l border-r border-green-500/10 flex items-center justify-center">
                <Cell value={row.agrilink} />
              </div>
              <div className="p-4 text-center flex items-center justify-center">
                <Cell value={row.mandi} />
              </div>
              <div className="p-4 text-center flex items-center justify-center">
                <Cell value={row.superapp} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">
          * Comparison based on typical market conditions. Individual experiences may vary.
        </p>
      </div>
    </section>
  )
}
