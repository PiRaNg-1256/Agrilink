'use client'
import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deliveryType, setDeliveryType] = useState(product?.delivery_type ?? 'both')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('delivery_type', deliveryType)
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, formData)
          toast.success('Product updated!')
        } else {
          await createProduct(formData)
          toast.success('Product listed!')
        }
        router.push('/dashboard')
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Product Name</Label>
          <Input name="name" defaultValue={product?.name} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Fresh Tomatoes" />
        </div>
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Description</Label>
          <Textarea name="description" defaultValue={product?.description ?? ''} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="Describe your produce..." />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Price (₹)</Label>
          <Input name="price" type="number" step="0.01" defaultValue={product?.price} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="0.00" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Unit</Label>
          <Input name="unit" defaultValue={product?.unit ?? 'kg'} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="kg / dozen / piece" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Stock Available</Label>
          <Input name="stock" type="number" defaultValue={product?.stock} required className="mt-1 bg-white/5 border-white/10 text-white" placeholder="0" />
        </div>
        <div>
          <Label className="text-gray-300 text-sm">Category</Label>
          <Select name="category" defaultValue={product?.category ?? 'vegetables'}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['vegetables','fruits','grains','dairy','other'].map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Delivery Type</Label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {[['both','Both'], ['delivery','Delivery Only'], ['pickup','Pickup Only']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setDeliveryType(val as any)}
                className={`p-2.5 rounded-xl border text-sm font-medium transition-colors ${deliveryType === val ? 'border-green-400 bg-green-500/20 text-green-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {deliveryType !== 'pickup' && (
          <div className="col-span-2">
            <Label className="text-gray-300 text-sm">Delivery Area</Label>
            <Input name="delivery_area" defaultValue={product?.delivery_area ?? ''} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Bangalore South" />
          </div>
        )}
        {deliveryType !== 'delivery' && (
          <div className="col-span-2">
            <Label className="text-gray-300 text-sm">Pickup Location</Label>
            <Input name="pickup_location" defaultValue={product?.pickup_location ?? ''} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Farm gate, Kolar" />
          </div>
        )}
        <div className="col-span-2">
          <Label className="text-gray-300 text-sm">Product Image</Label>
          <Input name="image" type="file" accept="image/*" className="mt-1 bg-white/5 border-white/10 text-white file:bg-green-500/20 file:text-green-400 file:border-0 file:rounded-lg file:px-3 file:py-1" />
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="bg-green-500 hover:bg-green-400 text-black font-bold w-full">
        {isPending ? 'Saving...' : product ? 'Update Product' : 'List Product'}
      </Button>
    </form>
  )
}
