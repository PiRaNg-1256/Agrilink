import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/disputes', label: 'Disputes' },
    { href: '/admin/support', label: 'Support' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="text-green-400 font-bold text-lg mr-4">⚙ Admin</span>
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-300 hover:text-white text-sm">
            {l.label}
          </Link>
        ))}
        <span className="ml-auto text-gray-500 text-sm">{profile.full_name}</span>
      </nav>
      <div className="p-6">{children}</div>
    </div>
  )
}
