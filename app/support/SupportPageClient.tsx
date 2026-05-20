'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTicket } from '@/lib/actions/support'

interface Props {
  tickets: any[]
}

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-400 border border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
}

export default function SupportPageClient({ tickets }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('order')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await createTicket(subject, category, message)
      if (result?.error) {
        setError(result.error)
      } else if (result?.ticketId) {
        router.push(`/support/${result.ticketId}`)
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setSubject('')
    setCategory('order')
    setMessage('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : 'New Ticket'}
          </button>
        </div>

        {/* FAQ link */}
        <p className="mb-8 text-gray-400 text-sm">
          <Link href="/support/faq" className="text-green-400 hover:text-green-300 transition-colors">
            Browse our FAQ →
          </Link>
        </p>

        {/* New Ticket Form */}
        {showForm && (
          <div className="bg-[#12122a] border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-5">Open a New Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Briefly describe your issue"
                  className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="order">Order</option>
                  <option value="product">Product</option>
                  <option value="account">Account</option>
                  <option value="delivery">Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Opening…' : 'Open Ticket'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Your Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No tickets yet. Need help? Open a ticket above.
            </p>
          ) : (
            <ul className="space-y-3">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/support/${ticket.id}`}
                    className="block bg-[#12122a] border border-white/10 hover:border-green-500/40 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-white">{ticket.subject}</span>
                      <span
                        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                          STATUS_BADGE[ticket.status] ?? STATUS_BADGE.closed
                        }`}
                      >
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">
                        {ticket.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
