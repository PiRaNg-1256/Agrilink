'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteProduct, toggleProductAvailability } from '@/lib/actions/products'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

export default function ListingsGrid({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return
    startTransition(async () => {
      try { await deleteProduct(id); toast.success('Product deleted') }
      catch (err: any) { toast.error(err.message) }
    })
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      try { await toggleProductAvailability(id, !current); toast.success(!current ? 'Product visible' : 'Product hidden') }
      catch (err: any) { toast.error(err.message) }
    })
  }

  if (products.length === 0) return (
    <div className="text-center py-16 text-gray-500">
      <p className="mb-4">No products listed yet.</p>
      <Link href="/dashboard/add-product"><Button className="bg-green-500 hover:bg-green-400 text-black font-bold">Add First Product</Button></Link>
    </div>
  )

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map(p => (
        <div key={p.id} className={`rounded-2xl border bg-white/5 overflow-hidden ${p.is_available ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
          <div className="h-36 bg-green-900/20 flex items-center justify-center overflow-hidden">
            {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🌿</span>}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-white mb-1 truncate">{p.name}</h3>
            <p className="text-green-400 font-bold text-sm">₹{p.price}/{p.unit}</p>
            <p className="text-gray-500 text-xs mt-1">Stock: {p.stock} {p.unit}</p>
            <div className="flex gap-2 mt-4">
              <Link href={`/dashboard/edit-product/${p.id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-xs">
                  <Pencil className="w-3 h-3 mr-1" />Edit
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => handleToggle(p.id, p.is_available)}
                className="text-gray-400 hover:text-white" disabled={isPending}>
                {p.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}
                className="text-red-400 hover:text-red-300" disabled={isPending}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
