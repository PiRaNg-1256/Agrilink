'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const SEASONAL = [
  { name: 'Alphonso Mangoes', nameHi: 'अल्फांसो आम', nameKn: 'ಆಮ್ರ', season: 'Apr – Jun', badgeKey: 'peakSeason' as const, image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&auto=format&fit=crop', color: 'from-yellow-900/40 to-orange-900/20' },
  { name: 'Fresh Strawberries', nameHi: 'स्ट्रॉबेरी', nameKn: 'ಸ್ಟ್ರಾಬೆರಿ', season: 'Dec – Feb', badgeKey: 'winterSpecial' as const, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop', color: 'from-red-900/40 to-pink-900/20' },
  { name: 'Sweet Corn', nameHi: 'मकई', nameKn: 'ಜೋಳ', season: 'Jun – Aug', badgeKey: 'monsoonFresh' as const, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop', color: 'from-yellow-900/30 to-green-900/20' },
  { name: 'Pomegranate', nameHi: 'अनार', nameKn: 'ದಾಳಿಂಬೆ', season: 'Aug – Feb', badgeKey: 'inSeasonNow' as const, image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f1?w=300&auto=format&fit=crop', color: 'from-red-900/40 to-purple-900/20' },
]

export default function SeasonalHighlights() {
  const { t, locale } = useLanguage()
  const getName = (s: typeof SEASONAL[0]) =>
    locale === 'hi' ? s.nameHi : locale === 'kn' ? s.nameKn : s.name

  return (
    <section className="py-24 px-4 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className={`text-xs font-bold text-green-400 uppercase ${locale === 'en' ? 'tracking-[0.3em]' : 'tracking-normal'}`}>{t.seasonalHighlights.label}</span>
          <h2 className="text-4xl font-black text-white mt-3">
            {t.seasonalHighlights.title} <span className="text-green-400">{t.seasonalHighlights.titleGreen}</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SEASONAL.map(s => (
            <Link key={s.name} href="/shop">
              <div className={`group rounded-2xl bg-gradient-to-br ${s.color} border border-white/10 overflow-hidden hover:border-green-400/30 transition-all hover:-translate-y-1 cursor-pointer`}>
                <div className="h-40 overflow-hidden">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-yellow-400">{t.seasonalHighlights[s.badgeKey]}</span>
                  <h3 className="text-white font-bold mt-1">{getName(s)}</h3>
                  <p className="text-gray-500 text-xs mt-1">{t.seasonalHighlights.season}: {s.season}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
