import { createClient } from '@/lib/supabase/server'
import AdminUserToggle from './AdminUserToggle'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, location, is_active, is_admin, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users ({users?.length ?? 0})</h1>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              {['Name', 'Role', 'Location', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left text-gray-400 px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-white">
                  {u.full_name ?? 'No name'}
                  {u.is_admin && <span className="ml-2 text-xs bg-purple-900/60 text-purple-400 px-1.5 py-0.5 rounded">admin</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${u.role === 'farmer' ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.location ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {u.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!u.is_admin && <AdminUserToggle userId={u.id} isActive={!!u.is_active} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
