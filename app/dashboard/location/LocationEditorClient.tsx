'use client'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createClient } from '@/lib/supabase/client'

// Fix broken Leaflet icons in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

export default function LocationEditorClient() {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [radius, setRadius] = useState(20)
  const [pincode, setPincode] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('lat, lng, pincode').eq('id', user.id).single()
      if (p?.lat) setLat(p.lat)
      if (p?.lng) setLng(p.lng)
      if (p?.pincode) setPincode(p.pincode)
      const { data: z } = await supabase.from('delivery_zones').select('radius_km').eq('farmer_id', user.id).single()
      if (z?.radius_km) setRadius(z.radius_km)
    }
    load()
  }, [])

  async function save() {
    if (!lat || !lng) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ lat, lng, pincode }).eq('id', user.id)
    await supabase.from('delivery_zones').upsert(
      { farmer_id: user.id, center_lat: lat, center_lng: lng, radius_km: radius },
      { onConflict: 'farmer_id' }
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const mapCenter: [number, number] = lat && lng ? [lat, lng] : [20.5937, 78.9629]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Set Your Farm Location</h1>
      <p className="text-gray-400 mb-6">Click anywhere on the map to pin your farm. The green circle shows your delivery area.</p>

      <MapContainer center={mapCenter} zoom={lat ? 10 : 5} style={{ height: '420px', width: '100%', borderRadius: '12px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickPicker onPick={(la, ln) => { setLat(la); setLng(ln) }} />
        {lat && lng && (
          <>
            <Marker position={[lat, lng]} />
            <Circle center={[lat, lng]} radius={radius * 1000} color="#22c55e" fillOpacity={0.12} />
          </>
        )}
      </MapContainer>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-gray-300 text-sm">Pincode:</label>
          <input
            type="text"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 560001"
            className="bg-gray-800 text-white rounded px-3 py-1 w-28 border border-gray-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-300 text-sm">Delivery radius (km):</label>
          <input
            type="number" value={radius} min={1} max={500}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-gray-800 text-white rounded px-3 py-1 w-20 border border-gray-600"
          />
        </div>
        {lat && lng && (
          <p className="text-gray-500 text-sm">Pin: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
        )}
        <button
          onClick={save}
          disabled={!lat || !lng || saving}
          className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Location'}
        </button>
      </div>
      {!lat && (
        <p className="text-yellow-500 text-sm mt-3">Click on the map to place your farm pin.</p>
      )}
    </div>
  )
}
