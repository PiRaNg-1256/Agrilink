'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const { t, locale } = useLanguage()
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.fromTo(
        contentRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: '20% top',
            end: '60% top',
            scrub: true,
          },
        }
      )
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

      <div ref={contentRef} className="text-center px-4 max-w-5xl mx-auto">
        <div className="mb-4 inline-block animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className={`text-xs font-bold text-green-400 border border-green-400/30 px-4 py-1.5 rounded-full ${locale === 'en' ? 'tracking-[0.3em] uppercase' : 'tracking-normal'}`}>
            {t.hero.badge}
          </span>
        </div>
        <h1
          className={`font-black mb-6 animate-fade-in-up ${locale === 'en' ? 'text-6xl md:text-8xl leading-none' : 'text-4xl md:text-6xl leading-snug'}`}
          style={{ animationDelay: '150ms' }}
        >
          <span className="block text-white">{t.hero.headline1}</span>
          <span className="block bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
            {t.hero.headline2}
          </span>
        </h1>
        <p
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          {t.hero.sub}
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: '450ms' }}
        >
          <Link href="/shop">
            <Button size="lg" className="bg-green-500 hover:bg-green-400 text-black font-bold px-8 text-base">
              {t.hero.cta1}
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-base">
              {t.hero.cta2}
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
