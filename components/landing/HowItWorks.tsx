'use client'
import { Sprout, ShoppingBag, Truck } from 'lucide-react'
import { useInView } from '@/hooks/useInView'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const STEP_ICONS = [Sprout, ShoppingBag, Truck]
const STEP_NUMBERS = ['01', '02', '03']
const delays = ['0ms', '150ms', '300ms']

function StepCard({ icon: Icon, number, title, desc, delay }: { icon: typeof Sprout; number: string; title: string; desc: string; delay: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`relative p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-green-400/30 transition-colors ${
        visible ? 'animate-fade-in-up' : 'invisible-until-visible'
      }`}
      style={{ animationDelay: delay }}
    >
      <div className="text-6xl font-black text-white/5 absolute top-6 right-6">{number}</div>
      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function TitleSection({ label, title, titleGray, locale }: { label: string; title: string; titleGray: string; locale: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={`text-center mb-20 ${visible ? 'animate-fade-in-up' : 'invisible-until-visible'}`}
    >
      <span className={`text-xs font-bold text-green-400 uppercase ${locale === 'en' ? 'tracking-[0.3em]' : 'tracking-normal'}`}>{label}</span>
      <h2 className="text-4xl md:text-5xl font-black text-white mt-4">
        {title}<br /><span className="text-gray-500">{titleGray}</span>
      </h2>
    </div>
  )
}

export default function HowItWorks() {
  const { t, locale } = useLanguage()
  const steps = [
    { title: t.howItWorks.step1Title, desc: t.howItWorks.step1Desc },
    { title: t.howItWorks.step2Title, desc: t.howItWorks.step2Desc },
    { title: t.howItWorks.step3Title, desc: t.howItWorks.step3Desc },
  ]
  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <TitleSection label={t.howItWorks.label} title={t.howItWorks.title} titleGray={t.howItWorks.titleGray} locale={locale} />
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <StepCard key={STEP_NUMBERS[i]} icon={STEP_ICONS[i]} number={STEP_NUMBERS[i]} title={step.title} desc={step.desc} delay={delays[i]} />
          ))}
        </div>
      </div>
    </section>
  )
}
