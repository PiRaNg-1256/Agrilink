'use client'
import { adminUpdateOrderStatus } from '@/lib/actions/admin'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered']

export default function AdminOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  async function change(e: React.ChangeEvent<HTMLSelectElement>) {
    await adminUpdateOrderStatus(orderId, e.target.value)
  }
  return (
    <select
      defaultValue={currentStatus}
      onChange={change}
      className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}
