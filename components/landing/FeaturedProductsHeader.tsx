'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function FeaturedProductsHeader() {
  const { t, locale } = useLanguage()
  return (
    <div className="flex items-end justify-between mb-12">
      <div>
        <span className={`text-xs font-bold text-green-400 uppercase ${locale === 'en' ? 'tracking-[0.3em]' : 'tracking-normal'}`}>
          {t.featuredProducts.label}
        </span>
        <h2 className="text-4xl font-black text-white mt-2">{t.featuredProducts.title}</h2>
      </div>
      <Link href="/shop">
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          {t.featuredProducts.viewAll}
        </Button>
      </Link>
    </div>
  )
}
