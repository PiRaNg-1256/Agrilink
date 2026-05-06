'use client'
import { useState } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Grains', value: 'grains' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Other', value: 'other' },
]

const deliveryFilters = [
  { label: 'All', value: 'all' },
  { label: 'Delivery', value: 'delivery' },
  { label: 'Pickup', value: 'pickup' },
]

export default function ProductGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState('all')
  const [deliveryFilter, setDeliveryFilter] = useState('all')

  const filtered = products.filter(p => {
    const catMatch = category === 'all' || p.category === category
    const delMatch = deliveryFilter === 'all' ||
      (deliveryFilter === 'delivery' && p.delivery_type !== 'pickup') ||
      (deliveryFilter === 'pickup' && p.delivery_type !== 'delivery')
    return catMatch && delMatch
  })

  return (
    <div>
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
        <div className="text-center py-20 text-gray-500">No products found for this filter.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
