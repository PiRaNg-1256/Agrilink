'use client'
import { useState } from 'react'
import { resolveDispute } from '@/lib/actions/admin'

const STATUS_COLORS: Record<string, string> = {
  open:         'bg-red-900/50 text-red-400 border-red-800',
  under_review: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  resolved:     'bg-green-900/50 text-green-400 border-green-800',
  closed:       'bg-gray-800 text-gray-500 border-gray-700',
}

export default function AdminDisputeCard({ dispute }: { dispute: any }) {
  const [resolution, setResolution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isClosed = dispute.status === 'resolved' || dispute.status === 'closed'

  async function submit(status: 'resolved' | 'closed') {
    setSubmitting(true)
    await resolveDispute(dispute.id, status, resolution)
    setSubmitting(false)
  }

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[dispute.status]}`}>
            {dispute.status.replace('_', ' ')}
          </span>
          <span className="text-gray-400 text-sm">
            Order #{dispute.order?.id?.slice(0, 8)} — ₹{dispute.order?.total_price}
          </span>
        </div>
        <span className="text-gray-600 text-xs">{new Date(dispute.created_at).toLocaleDateString('en-IN')}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500 text-xs">Consumer</p>
          <p className="text-gray-300">{dispute.consumer?.full_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Farmer</p>
          <p className="text-gray-300">{dispute.farmer?.full_name ?? '—'}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-3 mb-3">
        <p className="text-gray-500 text-xs mb-1">Consumer complaint</p>
        <p className="text-gray-300 text-sm">{dispute.reason}</p>
      </div>

      {dispute.farmer_response && (
        <div className="bg-gray-800 rounded p-3 mb-3 border-l-2 border-yellow-600">
          <p className="text-gray-500 text-xs mb-1">Farmer response</p>
          <p className="text-gray-300 text-sm">{dispute.farmer_response}</p>
        </div>
      )}

      {dispute.resolution && (
        <div className="bg-gray-800 rounded p-3 mb-3 border-l-2 border-green-600">
          <p className="text-gray-500 text-xs mb-1">Resolution</p>
          <p className="text-gray-300 text-sm">{dispute.resolution}</p>
        </div>
      )}

      {!isClosed && (
        <div className="mt-3">
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Resolution notes (optional)..."
            rows={2}
            className="w-full bg-gray-800 text-white rounded p-2 text-sm border border-gray-700 mb-2 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => submit('resolved')}
              disabled={submitting}
              className="bg-green-700 hover:bg-green-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => submit('closed')}
              disabled={submitting}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
            >
              Close (No Action)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
