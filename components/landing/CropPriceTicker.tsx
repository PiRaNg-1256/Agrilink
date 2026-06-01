'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const BASE_PRICES = [
  { crop: 'Tomato', cropHi: 'टमाटर', cropKn: 'ಟೊಮೆಟೊ', base: 28, unit: 'kg', market: 'Kolar', icon: '🍅' },
  { crop: 'Onion', cropHi: 'प्याज', cropKn: 'ಈರುಳ್ಳಿ', base: 22, unit: 'kg', market: 'Lasalgaon', icon: '🧅' },
  { crop: 'Potato', cropHi: 'आलू', cropKn: 'ಆಲೂಗಡ್ಡೆ', base: 18, unit: 'kg', market: 'Agra', icon: '🥔' },
  { crop: 'Rice (Sona Masoori)', cropHi: 'चावल', cropKn: 'ಅಕ್ಕಿ', base: 42, unit: 'kg', market: 'Thanjavur', icon: '🌾' },
  { crop: 'Wheat', cropHi: 'गेहूँ', cropKn: 'ಗೋಧಿ', base: 24, unit: 'kg', market: 'Indore', icon: '🌾' },
  { crop: 'Alphonso Mango', cropHi: 'अल्फांसो आम', cropKn: 'ಆಮ್ರ', base: 220, unit: 'dozen', market: 'Ratnagiri', icon: '🥭' },
  { crop: 'Green Chili', cropHi: 'हरी मिर्च', cropKn: 'ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ', base: 55, unit: 'kg', market: 'Guntur', icon: '🌶️' },
  { crop: 'Banana (Nendran)', cropHi: 'केला', cropKn: 'ಬಾಳೆ', base: 65, unit: 'dozen', market: 'Thrissur', icon: '🍌' },
  { crop: 'Coconut', cropHi: 'नारियल', cropKn: 'ತೆಂಗಿನಕಾಯಿ', base: 22, unit: 'piece', market: 'Thanjavur', icon: '🥥' },
  { crop: 'Toor Dal', cropHi: 'तुअर दाल', cropKn: 'ತೊಗರಿ ಬೇಳೆ', base: 120, unit: 'kg', market: 'Gulbarga', icon: '🫘' },
  { crop: 'Bajra', cropHi: 'बाजरा', cropKn: 'ಸಜ್ಜೆ', base: 38, unit: 'kg', market: 'Barmer', icon: '🌾' },
  { crop: 'Pomegranate', cropHi: 'अनार', cropKn: 'ದಾಳಿಂಬೆ', base: 130, unit: 'kg', market: 'Solapur', icon: '🌹' },
]

type PriceEntry = typeof BASE_PRICES[0] & { current: number; prev: number }

function randomVariation(base: number) {
  const change = (Math.random() - 0.5) * base * 0.04
  return Math.max(1, Math.round((base + change) * 10) / 10)
}

export default function CropPriceTicker() {
  const { t, locale } = useLanguage()
  const [prices, setPrices] = useState<PriceEntry[]>(
    BASE_PRICES.map(p => ({ ...p, current: p.base, prev: p.base }))
  )
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => ({ ...p, prev: p.current, current: randomVariation(p.base) })))
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const cropName = (p: PriceEntry) =>
    locale === 'hi' ? p.cropHi : locale === 'kn' ? p.cropKn : p.crop

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className={`text-xs font-bold text-green-400 uppercase ${locale === 'en' ? 'tracking-[0.3em]' : 'tracking-normal'}`}>{t.cropPrices.label}</span>
          <h2 className="text-4xl font-black text-white mt-3">{t.cropPrices.title}</h2>
          <p className="text-gray-500 text-sm mt-2">{t.cropPrices.subtitle}</p>
          <p className="text-gray-600 text-xs mt-1">{t.cropPrices.lastUpdated}: {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {prices.map(p => {
            const up = p.current >= p.prev
            return (
              <div key={p.crop} className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-green-400/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {up ? '▲' : '▼'} {Math.abs(((p.current - p.prev) / p.prev) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-white font-bold text-sm truncate">{cropName(p)}</p>
                <p className="text-gray-500 text-xs mb-2">{p.market}</p>
                <p className={`text-xl font-black ${up ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{p.current}<span className="text-gray-600 text-xs font-normal">/{p.unit}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
