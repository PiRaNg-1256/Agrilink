'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'How do I place an order?',
    answer: 'Browse products in the Shop, add items to your cart, then proceed to Checkout. Fill in your delivery details and confirm your order.',
  },
  {
    id: 2,
    question: 'How do I track my order?',
    answer: 'Go to Orders in your account to see real-time status updates from the farmer. You can also view delivery details for each order.',
  },
  {
    id: 3,
    question: 'How do I contact a farmer?',
    answer: 'Visit the farmer\'s profile page from any product listing. You can view their contact information and farm location on the map.',
  },
  {
    id: 4,
    question: 'How do I file a dispute?',
    answer: 'On your order detail page, click "File Dispute" and describe the issue. Our team reviews all disputes within 48 hours.',
  },
  {
    id: 5,
    question: 'How do I become a farmer on Agrilink?',
    answer: 'Sign up and select "Farmer" as your role. Complete your profile, add your farm location, and start listing your produce.',
  },
  {
    id: 6,
    question: 'What payment methods are accepted?',
    answer: 'We currently accept UPI and card payments at checkout. All transactions are secured.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          ← Back to Support
        </Link>

        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-12 text-white">Frequently Asked Questions</h1>

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
