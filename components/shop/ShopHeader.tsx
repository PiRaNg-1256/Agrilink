'use client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ShopHeader() {
  const { t } = useLanguage()
  return (
    <div className="mb-10">
      <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Fresh Produce</span>
      <h1 className="text-4xl font-black text-white mt-2">
        {t.shop.title}<br /><span className="text-gray-500">{t.shop.subtitle}</span>
      </h1>
    </div>
  )
}
