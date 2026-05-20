'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Leaf } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { useCart } from '@/components/cart/CartProvider'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { Locale } from '@/lib/i18n/translations'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { items } = useCart()
  const { t, locale, setLocale } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0d0d1a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-black" />
          </div>
          <span className="font-black text-lg tracking-widest text-white">AGRILINK</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/shop" className="text-sm text-gray-300 hover:text-green-400 transition-colors">{t.nav.shop}</Link>
          <Link href="/map" className="text-sm text-gray-300 hover:text-green-400 transition-colors">Map</Link>
          {profile && (
            <Link href="/support" className="text-sm text-gray-300 hover:text-green-400 transition-colors">Support</Link>
          )}
          {profile?.role === 'farmer' && (
            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-green-400 transition-colors">{t.nav.dashboard}</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-white/10 rounded-full p-0.5">
            {(['en', 'hi', 'kn'] as Locale[]).map(l => (
              <button key={l} onClick={() => setLocale(l)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${locale === l ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'ಕ'}
              </button>
            ))}
          </div>
          {!loading && (
            <>
              {profile ? (
                <>
                  {profile.role === 'consumer' && (
                    <Link href="/cart" className="relative">
                      <ShoppingCart className="w-5 h-5 text-gray-300 hover:text-green-400 transition-colors" />
                      {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                          {items.length}
                        </span>
                      )}
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-300 hover:text-white">
                    {t.nav.signOut}
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button size="sm" className="bg-green-500 hover:bg-green-400 text-black font-bold">
                    {t.nav.getStarted}
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
