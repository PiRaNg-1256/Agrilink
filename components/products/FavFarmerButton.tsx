'use client'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavouriteFarmer, isFavouriteFarmer } from '@/lib/actions/wishlist'
import { toast } from 'sonner'

export default function FavFarmerButton({ farmerId }: { farmerId: string }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    if (!farmerId.startsWith('fake-')) {
      isFavouriteFarmer(farmerId).then(setFav)
    }
  }, [farmerId])

  const handle = async () => {
    if (farmerId.startsWith('fake-')) { toast.info('Demo farmer — save not available'); return }
    try {
      await toggleFavouriteFarmer(farmerId)
      setFav(f => !f)
      toast.success(fav ? 'Removed from favourites' : 'Added to favourites!')
    } catch {
      toast.error('Could not update favourites')
    }
  }

  return (
    <button onClick={handle}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:border-red-400/30 transition-colors text-sm">
      <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      <span className="text-gray-300">{fav ? 'Saved' : 'Save Farmer'}</span>
    </button>
  )
}
