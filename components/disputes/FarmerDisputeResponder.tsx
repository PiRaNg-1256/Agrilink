'use client'
import { useState } from 'react'
import { farmerRespondToDispute } from '@/lib/actions/disputes'

interface Dispute {
  id: string
  status: string
  reason: string
  farmer_response?: string | null
}

export default function FarmerDisputeResponder({ dispute }: { dispute: Dispute }) {
  const [response, setResponse] = useState(dispute.farmer_response ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const badgeMap: Record<string, string> = {
    open: 'bg-red-900/50 text-red-400',
    under_review: 'bg-yellow-900/50 text-yellow-400',
    resolved: 'bg-green-900/50 text-green-400',
    closed: 'bg-gray-800 text-gray-500',
  }

  async function submit() {
    if (!response.trim()) return
    setSubmitting(true)
    await farmerRespondToDispute(dispute.id, response)
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-orange-900/50">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${badgeMap[dispute.status]}`}>
          {dispute.status.replace('_', ' ')}
        </span>
        <span className="text-gray-400 text-sm">Dispute filed</span>
      </div>
      <p className="text-gray-300 text-sm mb-2"><strong>Consumer says:</strong> {dispute.reason}</p>
      {dispute.status === 'open' && !submitted && (
        <>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Explain your side..."
            rows={2}
            className="w-full bg-gray-900 text-white rounded p-2 text-sm border border-gray-700 mb-2 resize-none"
          />
          <button
            onClick={submit}
            disabled={!response.trim() || submitting}
            className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs px-4 py-1.5 rounded disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Response'}
          </button>
        </>
      )}
      {(submitted || dispute.farmer_response) && (
        <p className="text-gray-400 text-sm">Your response submitted. Admin will review.</p>
      )}
    </div>
  )
}
