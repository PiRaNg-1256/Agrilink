'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendMessage } from '@/lib/actions/support'

const STATUS_BADGE: Record<string, string> = {
  open:        'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/50 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/50 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-500 border-gray-700',
}

export default function AdminTicketClient({
  ticket,
  messages,
  adminId,
}: {
  ticket: any
  messages: any[]
  adminId: string
}) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!reply.trim()) return
    setLoading(true)
    await sendMessage(ticket.id, reply.trim(), true)
    setReply('')
    setLoading(false)
    router.refresh()
  }

  const statusLabel = ticket.status?.replace(/_/g, ' ') ?? 'unknown'
  const badgeClass = STATUS_BADGE[ticket.status] ?? STATUS_BADGE.closed

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin/support"
        className="text-gray-400 hover:text-white text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Back to Admin Support
      </Link>

      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mt-4 mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
          <span className={`text-xs px-3 py-1 rounded-full border capitalize whitespace-nowrap ${badgeClass}`}>
            {statusLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">User</p>
            <p className="text-gray-300">{ticket.user?.full_name ?? <span className="text-gray-600">Unknown</span>}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Category</p>
            <p className="text-gray-300 capitalize">{ticket.category?.replace(/_/g, ' ') ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Current Status</p>
            <p className={`font-semibold capitalize ${
              ticket.status === 'open' ? 'text-yellow-400' :
              ticket.status === 'in_progress' ? 'text-blue-400' :
              ticket.status === 'resolved' ? 'text-green-400' :
              'text-gray-400'
            }`}>
              {statusLabel}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Last Updated</p>
            <p className="text-gray-300 text-xs">
              {ticket.updated_at
                ? new Date(ticket.updated_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div className="space-y-3 mb-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 py-8">No messages yet.</div>
        )}
        {messages.map((msg) => {
          const isAdminMsg = msg.is_admin
          return (
            <div
              key={msg.id}
              className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 ${
                  isAdminMsg
                    ? 'bg-green-900/40 border border-green-800'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${isAdminMsg ? 'text-green-400' : 'text-gray-400'}`}>
                    {isAdminMsg ? 'Admin' : (msg.sender?.full_name ?? 'User')}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
                <p className="text-gray-200 text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply Box */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <p className="text-xs text-gray-500 mb-2">Reply as Admin</p>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your admin reply..."
          rows={3}
          className="w-full bg-gray-800 text-white rounded-lg p-3 text-sm border border-gray-700 focus:border-green-600 focus:outline-none resize-none mb-3"
        />
        <button
          onClick={handleSend}
          disabled={loading || !reply.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Sending…' : 'Send Reply'}
        </button>
      </div>
    </div>
  )
}
