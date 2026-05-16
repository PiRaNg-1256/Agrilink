'use client'
import dynamic from 'next/dynamic'
import { Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

const DynamicMap = dynamic(() => import('@/components/map/BaseMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-gray-800 rounded-xl animate-pulse" />,
})

interface MapFarmer {
  id: string
  full_name: string
  location: string
  lat: number
  lng: number
}

export default function MapPageClient({ farmers }: { farmers: MapFarmer[] }) {
  return (
    <main className="min-h-screen bg-[#0d0d1a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Farmers on the Map</h1>
          <p className="text-gray-400 mb-8">Click a pin to see farmer details and browse their products</p>
          <DynamicMap height="600px" zoom={5}>
            {farmers.map((farmer) => (
              <Marker key={farmer.id} position={[farmer.lat, farmer.lng]}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-gray-900">{farmer.full_name}</p>
                    <p className="text-sm text-gray-600 mb-1">{farmer.location}</p>
                    <Link
                      href={`/farmer/${farmer.id}`}
                      className="text-green-600 text-sm font-semibold hover:underline"
                    >
                      View Products →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </DynamicMap>
          <p className="text-center text-gray-600 text-sm mt-4">{farmers.length} farmers shown</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
