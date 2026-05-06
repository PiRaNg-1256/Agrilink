import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FarmerSpotlight() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-green-400/20 bg-gradient-to-br from-green-950/40 to-[#0d0d1a] p-12 md:p-20 text-center">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">For Farmers</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4 mb-6">
            Your harvest.<br />
            <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">Your price.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            List your produce in minutes. Reach consumers directly. No commission to middlemen — every rupee goes to you.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-bold px-10 text-base">
              Start Selling Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
