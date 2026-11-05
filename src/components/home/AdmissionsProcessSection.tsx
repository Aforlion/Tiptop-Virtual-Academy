'use client';

import React from 'react';
import { Calculator, FileText, CreditCard, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AdmissionsProcessSectionProps {
  onOpenAdmissions: () => void;
}

export const AdmissionsProcessSection: React.FC<AdmissionsProcessSectionProps> = ({ onOpenAdmissions }) => {
  const steps = [
    {
      num: '01',
      title: 'Calculate & Choose Subjects',
      desc: 'Use our dynamic calculator to pick your child’s Key Stage, select subjects, and configure termly or monthly Paystack tuition.',
      icon: Calculator
    },
    {
      num: '02',
      title: 'Submit Application Form',
      desc: 'Provide basic parent/guardian details, student academic history, and upload identification for registry KYC checks.',
      icon: FileText
    },
    {
      num: '03',
      title: 'Paystack Registration Deposit',
      desc: 'Pay the one-time registration deposit via Paystack to secure your child’s seat in a small-group cohort (capped at 10–12 learners).',
      icon: CreditCard
    },
    {
      num: '04',
      title: 'Onboarding & Classroom Access',
      desc: 'Receive your Student Workspace credentials, timetable calendar, and Google Classroom invitation links within 24 hours.',
      icon: Sparkles
    }
  ];

  return (
    <section id="admissions-process" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Admissions Made Simple
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How to Enrol in 4 Transparent Steps
          </h2>
          <p className="text-slate-600 text-base mt-2">
            No endless paperwork or delayed decisions. Our streamlined digital intake gets your learner ready for class in under 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-3xl p-7 border border-slate-200 relative flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-300">
                      {st.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully Automated & Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={onOpenAdmissions}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-extrabold text-white bg-slate-900 hover:bg-amber-600 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Start Your Child&apos;s Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

