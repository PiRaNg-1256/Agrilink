import { adminGetAllTickets } from '@/lib/actions/support'
import AdminSupportClient from './AdminSupportClient'

export default async function AdminSupportPage() {
  const tickets = await adminGetAllTickets()
  return <AdminSupportClient tickets={tickets} />
}
