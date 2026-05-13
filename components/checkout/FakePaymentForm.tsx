'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/components/cart/CartProvider'
import { createOrder } from '@/lib/actions/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function FakePaymentForm() {
  const { items, total, clearCart } = useCart()
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handlePay = () => {
    if (deliveryType === 'delivery' && !address.trim()) {
      toast.error('Enter delivery address')
      return
    }
    startTransition(async () => {
      try {
        const result = await createOrder(items, deliveryType, address)
        clearCart()
        toast.success('Order placed! Farmer will confirm soon.')
        router.push(result.demo ? '/orders?demo=1' : '/orders')
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Label className="text-gray-300 text-sm mb-2 block">Delivery Method</Label>
        <div className="grid grid-cols-2 gap-3">
          {[['delivery','🚚 Home Delivery'], ['pickup','🏪 Farm Pickup']].map(([val, label]) => (
            <button key={val} onClick={() => setDeliveryType(val as any)}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors ${deliveryType === val ? 'border-green-400 bg-green-500/20 text-green-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {deliveryType === 'delivery' && (
        <div>
          <Label className="text-gray-300 text-sm">Delivery Address</Label>
          <Input value={address} onChange={e => setAddress(e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white" placeholder="Full address including pincode" />
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Payment Details (Demo)</p>
        <div className="flex gap-3 mb-4">
          {[['upi','UPI'], ['card','Card']].map(([val, label]) => (
            <button key={val} onClick={() => setPayMethod(val as any)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${payMethod === val ? 'bg-yellow-500 text-black font-bold' : 'bg-white/10 text-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>
        {payMethod === 'upi' ? (
          <div>
            <Label className="text-gray-300 text-sm">UPI ID</Label>
            <Input defaultValue="farmer@upi" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
            <p className="text-yellow-400/60 text-xs mt-2">⚠️ This is a demo — no real payment processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-gray-300 text-sm">Card Number</Label>
              <Input defaultValue="4242 4242 4242 4242" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300 text-sm">Expiry</Label>
                <Input defaultValue="12/28" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">CVV</Label>
                <Input defaultValue="123" className="mt-1 bg-white/5 border-white/10 text-white" readOnly />
              </div>
            </div>
            <p className="text-yellow-400/60 text-xs">⚠️ This is a demo — no real payment processed</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
        <span className="text-gray-400">Total</span>
        <span className="text-2xl font-black text-white">₹{total.toFixed(2)}</span>
      </div>

      <Button onClick={handlePay} disabled={isPending} size="lg"
        className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-black text-base">
        {isPending ? 'Placing Order...' : `Pay ₹${total.toFixed(2)}`}
      </Button>
    </div>
  )
}
