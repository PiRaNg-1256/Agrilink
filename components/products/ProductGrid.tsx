'use client'
import { useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ProductGrid({ products }: { products: Product[] }) {
  const { t } = useLanguage()
  const [category, setCategory] = useState('all')
  const [deliveryFilter, setDeliveryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState(2000)
  const [pincodeFilter, setPincodeFilter] = useState('')

  const categories = [
    { label: t.shop.categories.all, value: 'all' },
    { label: t.shop.categories.vegetables, value: 'vegetables' },
    { label: t.shop.categories.fruits, value: 'fruits' },
    { label: t.shop.categories.grains, value: 'grains' },
    { label: t.shop.categories.dairy, value: 'dairy' },
    { label: t.shop.categories.other, value: 'other' },
  ]

  const deliveryFilters = [
    { label: t.shop.filters.all, value: 'all' },
    { label: t.shop.filters.delivery, value: 'delivery' },
    { label: t.shop.filters.pickup, value: 'pickup' },
  ]

  const filtered = products.filter(p => {
    const catMatch = category === 'all' || p.category === category
    const delMatch = deliveryFilter === 'all' ||
      (deliveryFilter === 'delivery' && p.delivery_type !== 'pickup') ||
      (deliveryFilter === 'pickup' && p.delivery_type !== 'delivery')
    const searchMatch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      (p as any).profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      (p as any).profiles?.location?.toLowerCase().includes(search.toLowerCase())
    const priceMatch = p.price <= maxPrice
    const pincodeMatch = pincodeFilter === '' || (p as any).profiles?.pincode?.includes(pincodeFilter)
    return catMatch && delMatch && searchMatch && priceMatch && pincodeMatch
  })

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={pincodeFilter}
          onChange={e => setPincodeFilter(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          placeholder="Filter by pincode..."
          className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:border-green-500 focus:outline-none w-48"
        />
        {pincodeFilter && (
          <button onClick={() => setPincodeFilter('')} className="text-gray-400 hover:text-white text-sm">Clear</button>
        )}
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.shop.searchPlaceholder}
          className="flex-1 min-w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400/50"
        />
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{t.shop.priceRange}:</span>
          <input
            type="range"
            min={10}
            max={2000}
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-32 accent-green-500"
          />
          <span className="text-green-400 font-bold w-20">≤ ₹{maxPrice}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c.value ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-8">
        {deliveryFilters.map(d => (
          <button key={d.value} onClick={() => setDeliveryFilter(d.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${deliveryFilter === d.value ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {d.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">{t.shop.noResults}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
