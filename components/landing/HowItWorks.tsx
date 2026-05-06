'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sprout, ShoppingBag, Truck } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { icon: Sprout, number: '01', title: 'Farmers List Produce', desc: 'Small-scale farmers create listings with prices, availability, and delivery options — directly on Agrilink.' },
  { icon: ShoppingBag, number: '02', title: 'Consumers Browse & Order', desc: 'Buyers discover local farmers, browse fresh produce, and place orders with a single click.' },
  { icon: Truck, number: '03', title: 'Direct Delivery or Pickup', desc: 'Farmers deliver to your door or you pick up locally — zero middlemen, maximum freshness.' },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: titleRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      })
      stepsRef.current.forEach((el, i) => {
        gsap.from(el, {
          y: 80, opacity: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.15,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-20">
          <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-4">From field to table,<br /><span className="text-gray-500">simplified.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={el => { if (el) stepsRef.current[i] = el }}
              className="relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-green-400/30 transition-colors"
            >
              <div className="text-6xl font-black text-white/5 absolute top-6 right-6">{step.number}</div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
