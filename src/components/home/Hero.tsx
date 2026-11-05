'use client';

import React from 'react';
import { ArrowRight, Calculator, CheckCircle2, Users, BookOpen, Star, Shield, Sparkles } from 'lucide-react';
import { TRUST_METRICS } from '@/data/curriculum';

interface HeroProps {
  onOpenAdmissions: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAdmissions }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 pt-12 pb-20 border-b border-slate-200">
      {/* Decorative Geometric Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-100/40 via-amber-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-medium text-slate-800">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-amber-600">Now Enrolling:</span>
            <span>Academic Term 2026/2027 • Limited Cohort Places</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-slate-500">Ages 3 to 16</span>
          </div>
        </div>

        {/* Main Headline & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            World-Class British Education.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-indigo-600 to-slate-900">
              Delivered Anywhere in the World.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
            Tiptop Virtual Academy brings the prestige and academic rigor of the British National Curriculum (EYFS to IGCSE) directly to your home. Featuring interactive small-group live classes capped at 10–12 learners, flexible on-demand video masterclasses, and Nigerian curriculum integration.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenAdmissions}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-slate-900 hover:bg-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#tuition-calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs hover:shadow-md transition-all duration-200"
            >
              <Calculator className="w-5 h-5 text-amber-600" />
              <span>Calculate Tuition & Fees</span>
            </a>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Small Classes (10–12 Max)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pearson Edexcel & Cambridge Pathways</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Flexible Monthly Paystack Billing</span>
            </div>
          </div>
        </div>

        {/* Feature Grid / Trust Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 group-hover:bg-amber-500 transition-colors" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {metric.label}
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {metric.value}
              </span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {metric.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

