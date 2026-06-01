'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const faqItems = [
    { id: 1, question: t.support.faq.q1, answer: t.support.faq.a1 },
    { id: 2, question: t.support.faq.q2, answer: t.support.faq.a2 },
    { id: 3, question: t.support.faq.q3, answer: t.support.faq.a3 },
    { id: 4, question: t.support.faq.q4, answer: t.support.faq.a4 },
    { id: 5, question: t.support.faq.q5, answer: t.support.faq.a5 },
    { id: 6, question: t.support.faq.q6, answer: t.support.faq.a6 },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/support"
          className="inline-flex items-center text-[#22c55e] hover:text-[#16a34a] mb-8 transition-colors"
        >
          {t.support.backToSupport}
        </Link>

        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-12 text-white">{t.support.faq.title}</h1>

        {/* FAQ Items */}
        <div className="space-y-0">
          {faqItems.map((item, index) => (
            <div key={item.id} className="border-b border-gray-700">
              {/* FAQ Header */}
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full py-6 px-4 flex justify-between items-center transition-colors ${
                  openIndex === index
                    ? 'bg-[#0d0d1a] text-[#22c55e]'
                    : 'bg-[#0d0d1a] text-white hover:bg-gray-900'
                }`}
              >
                <h3 className="text-lg font-semibold text-left">{item.question}</h3>
                <span className={`text-2xl font-light transition-transform ${
                  openIndex === index ? 'text-[#22c55e]' : 'text-gray-400'
                }`}>
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              {/* FAQ Answer */}
              {openIndex === index && (
                <div className="px-4 pb-6 text-gray-300 animate-in fade-in duration-200">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
