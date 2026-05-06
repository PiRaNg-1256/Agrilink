'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.from(headlineRef.current, { y: 80, opacity: 0, duration: 1.2, ease: 'power4.out' })
        .from(subRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
        .from(ctaRef.current, { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')

      gsap.to(bgRef.current, {
        yPercent: 40,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.to([headlineRef.current, subRef.current, ctaRef.current], {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: '30% top', end: '60% top', scrub: true },
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f0f] via-[#0d0d1a] to-[#0d0d1a]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-yellow-400/5 rounded-full blur-[80px]" />
      </div>

      <div className="text-center px-4 max-w-5xl mx-auto">
        <div className="mb-4 inline-block">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase border border-green-400/30 px-4 py-1.5 rounded-full">
            Direct Farm to Consumer
          </span>
        </div>
        <h1 ref={headlineRef} className="text-6xl md:text-8xl font-black leading-none mb-6">
          <span className="block text-white">Farm Fresh.</span>
          <span className="block bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            Direct to You.
          </span>
        </h1>
        <p ref={subRef} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Agrilink connects small-scale farmers directly with consumers — no middlemen, fairer prices, fresher produce.
        </p>
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 text-base">
              Shop Fresh Produce
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-base">
              Join as Farmer
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-5 h-5 text-gray-500" />
      </div>
    </section>
  )
}
