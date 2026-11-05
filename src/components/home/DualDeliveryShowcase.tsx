'use client';

import React from 'react';
import { Video, PlayCircle, Users, Sparkles, Check, Laptop, Clock, ShieldCheck } from 'lucide-react';

export const DualDeliveryShowcase: React.FC = () => {
  return (
    <section id="delivery-modes" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Flexible British Schooling
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            Two Modern Learning Formats. Zero Compromise.
          </h2>
          <p className="text-slate-400 text-base mt-3 leading-relaxed">
            Inspired by proven UK virtual schooling models, choose between synchronous interactive small-cohort classrooms or self-paced on-demand video masterclasses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Format 1: Interactive Live Cohort */}
          <div className="bg-slate-800/80 rounded-3xl p-8 sm:p-10 border border-slate-700/80 shadow-xl flex flex-col justify-between relative group hover:border-amber-500/50 transition-colors">
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Most Popular
              </span>
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <Video className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2">
                Interactive Live Classes
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Live synchronous lessons led by qualified British curriculum subject specialists. Classes are strictly capped at 10–12 learners to ensure every student participates actively.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Small-group cohorts:</strong> Maximum 10–12 students per live room.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Active participation:</strong> Direct questions, audio discussions, and hand-raising.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Cloud recordings:</strong> Every live session is recorded and archived in the student vault.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Structured timetable:</strong> Regular term schedule to maintain academic discipline.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>Best for: Full-time virtual schooling</span>
              <span className="text-amber-400 font-bold">1-Click Meeting Launch</span>
            </div>
          </div>

          {/* Format 2: On-Demand Video Masterclasses */}
          <div className="bg-slate-800/80 rounded-3xl p-8 sm:p-10 border border-slate-700/80 shadow-xl flex flex-col justify-between relative group hover:border-indigo-500/50 transition-colors">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <PlayCircle className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2">
                On-Demand Masterclasses
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Purpose-edited 20–25 minute video lessons paired with guided digital worksheets and auto-graded quizzes. Perfect for independent learners, travelling families, and athletes.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Self-paced flexibility:</strong> Pause, rewind, and re-watch concepts at will.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Attached worksheets:</strong> High-yield practice exercises and answer keys.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Automated quizzes:</strong> Instant feedback on comprehension and mastery.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Budget friendly:</strong> Premium British education at a reduced monthly rate.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>Best for: Home-schoolers & supplemental study</span>
              <span className="text-indigo-400 font-bold">24/7 Portal Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

