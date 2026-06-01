'use client'
import { createClient } from '@/lib/supabase/client'

export default function AdminSignOut() {
  return (
    <button
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/auth'
      }}
      className="text-gray-400 hover:text-white text-sm transition-colors"
    >
      Sign Out
    </button>
  )
}
