'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendMessage, closeTicket } from '@/lib/actions/support'

interface Props {
  ticket: any
  messages: any[]
  userId: string
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    resolved: 'bg-green-500/20 text-green-400 border border-green-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  }
  const labels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status] ?? styles.closed}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function TicketThreadClient({ ticket, messages, userId }: Props) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  const canReply = ticket.status !== 'closed' && ticket.status !== 'resolved'
  const canResolve = ticket.status === 'open' || ticket.status === 'in_progress'

  async function handleSend() {
    if (!reply.trim()) return
    setLoading(true)
    try {
      await sendMessage(ticket.id, reply)
      setReply('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleClose() {
    setLoading(true)
    try {
      await closeTicket(ticket.id)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/support"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          ← Back to Support
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-white leading-tight">{ticket.subject}</h1>
          <div className="shrink-0 mt-1">
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Message thread */}
        <div className="space-y-4 mb-8">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 py-8">No messages yet.</p>
          )}
          {messages.map((msg: any) => {
            const isAdmin = msg.is_admin === true
            return (
              <div
                key={msg.id}
                className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[75%] ${isAdmin ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                  <span className="text-xs text-gray-500 px-1">
                    {isAdmin ? 'Support Team' : 'You'}
                  </span>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isAdmin
                        ? 'bg-[#1e1e2e] text-gray-200 rounded-tl-sm'
                        : 'bg-[#22c55e] text-white rounded-tr-sm'
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-600 px-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reply form */}
        {canReply && (
          <div className="bg-[#12122a] border border-white/10 rounded-xl p-4 mb-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#22c55e] transition-colors"
            />
            <div className="flex items-center justify-between mt-3">
              <div />
              <button
                onClick={handleSend}
                disabled={loading || !reply.trim()}
                className="px-5 py-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Mark Resolved button */}
        {canResolve && (
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2 bg-transparent border border-[#facc15] text-[#facc15] hover:bg-[#facc15]/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Processing...' : 'Mark Resolved'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
