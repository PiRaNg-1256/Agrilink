import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0d1a] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
              <Leaf className="w-3 h-3 text-black" />
            </div>
            <span className="font-black tracking-widest text-white">AGRILINK</span>
          </div>
          <p className="text-gray-500 text-sm text-center">
            Empowering farmers. Connecting communities. Fresh from the source.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/shop" className="hover:text-green-400 transition-colors">Shop</Link>
            <Link href="/auth" className="hover:text-green-400 transition-colors">Join</Link>
          </div>
        </div>
        <p className="text-center text-gray-600 text-xs mt-8">© 2026 Agrilink. All rights reserved.</p>
      </div>
    </footer>
  )
}
