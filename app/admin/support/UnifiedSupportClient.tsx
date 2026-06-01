'use client'
import { useState } from 'react'
import Link from 'next/link'
import AdminDisputeCard from '@/app/admin/disputes/AdminDisputeCard'

type MainTab = 'tickets' | 'disputes'
type FilterType = 'all' | 'open' | 'in_progress' | 'resolved'

const STATUS_BADGE: Record<string, string> = {
  open:        'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  in_progress: 'bg-blue-900/50 text-blue-400 border-blue-800',
  resolved:    'bg-green-900/50 text-green-400 border-green-800',
  closed:      'bg-gray-800 text-gray-500 border-gray-700',
}

const FILTER_TABS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
]

export default function UnifiedSupportClient({
  tickets,
  disputes,
}: {
  tickets: any[]
  disputes: any[]
}) {
  const [mainTab, setMainTab] = useState<MainTab>('tickets')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter)

  const openDisputes = disputes.filter(
    (d) => d.status === 'open' || d.status === 'under_review'
  )
  const closedDisputes = disputes.filter(
    (d) => d.status === 'resolved' || d.status === 'closed'
  )

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Main tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMainTab('tickets')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mainTab === 'tickets'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Support Tickets
        </button>
        <button
          onClick={() => setMainTab('disputes')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            mainTab === 'disputes'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Disputes
          {openDisputes.length > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
              {openDisputes.length}
            </span>
          )}
        </button>
      </div>

      {/* Support Tickets tab */}
      {mainTab === 'tickets' && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-6">Support Tickets</h1>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {FILTER_TABS.map((tab) => (
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
                  (
                  {tab.value === 'all'
                    ? tickets.length
                    : tickets.filter((t) => t.status === tab.value).length}
                  )
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
                        {ticket.user?.full_name ?? (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 capitalize">
                        {ticket.category?.replace(/_/g, ' ') ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                            STATUS_BADGE[ticket.status] ?? STATUS_BADGE.closed
                          }`}
                        >
                          {ticket.status?.replace(/_/g, ' ') ?? 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {ticket.updated_at
                          ? new Date(ticket.updated_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
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
      )}

      {/* Disputes tab */}
      {mainTab === 'disputes' && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-6">
            Disputes —{' '}
            <span className="text-red-400">{openDisputes.length} open</span>
          </h1>

          {openDisputes.length === 0 && (
            <p className="text-gray-500 text-center py-12">No open disputes</p>
          )}

          <div className="space-y-4 mb-8">
            {openDisputes.map((d) => (
              <AdminDisputeCard key={d.id} dispute={d} />
            ))}
          </div>

          {closedDisputes.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-500 mb-4">
                Closed Disputes
              </h2>
              <div className="space-y-3">
                {closedDisputes.map((d) => (
                  <AdminDisputeCard key={d.id} dispute={d} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
