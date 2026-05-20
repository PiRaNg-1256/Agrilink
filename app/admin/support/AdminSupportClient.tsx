'use client'
import { useState } from 'react'
import Link from 'next/link'

type FilterType = 'all' | 'open' | 'in_progress' | 'resolved'

const STATUS_BADGE: Record<string, string> = {
  open:        'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/50 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/50 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-500 border-gray-700',
}

const TABS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
]

export default function AdminSupportClient({ tickets }: { tickets: any[] }) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Support Tickets</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">
              ({tab.value === 'all' ? tickets.length : tickets.filter(t => t.status === tab.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-500 text-lg">No tickets match this filter.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Last Update</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket, i) => (
                <tr
                  key={ticket.id}
                  className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-gray-900/50'
                  }`}
                >
                  <td className="px-4 py-3 text-white font-medium max-w-xs truncate">
                    {ticket.subject}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {ticket.user?.full_name ?? <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize">
                    {ticket.category?.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[ticket.status] ?? STATUS_BADGE.closed}`}>
                      {ticket.status?.replace(/_/g, ' ') ?? 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {ticket.updated_at
                      ? new Date(ticket.updated_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/support/${ticket.id}`}
                      className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
