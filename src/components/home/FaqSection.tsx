'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Which curriculum does Tiptop Virtual Academy follow, and can students sit IGCSE exams?',
      a: 'We strictly follow the British National Curriculum from Early Years Foundation Stage (EYFS) through to Key Stage 4 (Years 10 & 11). Our Upper Secondary syllabus is mapped to the Pearson Edexcel and Cambridge Assessment International Education (CAIE) specifications. Students are fully prepared to sit their official IGCSE exams at any registered British Council or accredited examination centre worldwide.'
    },
    {
      q: 'How large are the live classes?',
      a: 'To guarantee quality, teacher engagement, and academic progress, all interactive live cohorts are strictly capped at a maximum of 10 to 12 students. This ensures that every child receives active attention, can ask questions without hesitation, and builds meaningful peer connections.'
    },
    {
      q: 'How does the Nigerian Curriculum integration work?',
      a: 'For families in Nigeria or the global Nigerian diaspora who wish to maintain strong cultural, civic, and linguistic roots, we offer dedicated modules in Nigerian History, Social Studies, and Civic Education. These are taught alongside the British curriculum and can be selected via our subject picker.'
    },
    {
      q: 'What hardware and technology does my child need?',
      a: 'Learners need a standard desktop computer or laptop (Windows, Mac, or Chromebook) equipped with a working webcam, microphone (or headset), and a stable broadband internet connection. Tablets may be used for on-demand review, but laptops are required for live classes.'
    },
    {
      q: 'How do tuition payments and Paystack billing work?',
      a: 'We use Paystack to process all school transactions securely. Paystack supports Nigerian Naira (₦) debit cards, bank transfers, USSD, as well as international cards (GBP £ and USD $). Parents can choose flexible monthly payments, or termly/annual billing with built-in tuition discounts. Official PDF receipts are issued automatically upon payment.'
    },
    {
      q: 'What happens if a student misses a live class?',
      a: 'Every live class is recorded directly to our cloud infrastructure and archived inside the Student Workspace Lesson Vault within 2 hours of completion. Students can review lesson recordings, check teacher notes, and download worksheets at any time.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Everything you need to know about academic standards, tuition, and admissions.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-slate-900 text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 text-center max-w-lg mx-auto shadow-xs">
          <p className="text-xs text-slate-600">
            Have a specific academic or timetable question not answered here?
          </p>
          <a
            href="mailto:admissions@tiptopvirtualacademy.com"
            className="mt-2 inline-block text-xs font-bold text-amber-600 hover:text-amber-700 underline"
          >
            Email our admissions registry: admissions@tiptopvirtualacademy.com
          </a>
        </div>
      </div>
    </section>
  );
};

