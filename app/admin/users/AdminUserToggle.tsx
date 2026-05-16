'use client'
import { toggleUserActive } from '@/lib/actions/admin'

export default function AdminUserToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  return (
    <button
      onClick={() => toggleUserActive(userId, !isActive)}
      className={`text-xs px-3 py-1 rounded transition-colors
        ${isActive
          ? 'bg-red-900/50 text-red-400 hover:bg-red-900'
          : 'bg-green-900/50 text-green-400 hover:bg-green-900'}`}
    >
      {isActive ? 'Suspend' : 'Restore'}
    </button>
  )
}
