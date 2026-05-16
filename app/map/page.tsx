import { createClient } from '@/lib/supabase/server'
import MapPageClient from './MapPageClient'
import { FAKE_FARMER_COORDS } from '@/lib/fakeData'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: realFarmers } = await supabase
    .from('profiles')
    .select('id, full_name, location, lat, lng')
    .eq('role', 'farmer')
    .eq('is_active', true)
    .not('lat', 'is', null)

  type MapFarmer = { id: string; full_name: string; location: string; lat: number; lng: number }

  const allFarmers: MapFarmer[] = [
    ...(realFarmers?.filter(f => f.lat && f.lng) ?? []),
    ...FAKE_FARMER_COORDS,
  ]

  return <MapPageClient farmers={allFarmers} />
}
