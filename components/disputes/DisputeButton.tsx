'use client'
import { useState } from 'react'
import { fileDispute } from '@/lib/actions/disputes'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-900/50 text-red-400 border-red-800',
  under_review: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  resolved: 'bg-green-900/50 text-green-400 border-green-800',
  closed: 'bg-gray-800 text-gray-500 border-gray-700',
}

interface Props {
  orderId: string
  existingDispute?: { id: string; status: string; reason: string } | null
}

export default function DisputeButton({ orderId, existingDispute }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')

  if (done || existingDispute) {
    const status = existingDispute?.status ?? 'open'
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
        Dispute: {status.replace('_', ' ')}
      </span>
    )
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="text-xs text-red-400 hover:text-red-300 border border-red-900 rounded px-2 py-1"
    >
      File Dispute
    </button>
  )

  async function submit() {
    if (!reason.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const fd = new FormData()
      fd.append('order_id', orderId)
      fd.append('reason', reason)
      await fileDispute(fd)
      setDone(true)
      setOpen(false)
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Failed to file dispute. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-red-900">
      <p className="text-white text-sm font-medium mb-2">Describe the issue:</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Product not delivered, wrong item received..."
        rows={3}
        className="w-full bg-gray-900 text-white rounded p-2 text-sm border border-gray-700 mb-2 resize-none"
      />
      {submitError && <p className="text-red-400 text-xs mt-1">{submitError}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!reason.trim() || submitting}
          className="bg-red-700 hover:bg-red-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Dispute'}
        </button>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5">
          Cancel
        </button>
      </div>
    </div>
  )
}
