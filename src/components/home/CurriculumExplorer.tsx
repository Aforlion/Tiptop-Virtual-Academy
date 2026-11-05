'use client';

import React, { useState } from 'react';
import { KEY_STAGES } from '@/data/curriculum';
import { KeyStageId } from '@/types';
import { BookOpen, Clock, Award, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

interface CurriculumExplorerProps {
  onSelectStageForCalculator: (stageId: KeyStageId) => void;
}

export const CurriculumExplorer: React.FC<CurriculumExplorerProps> = ({ onSelectStageForCalculator }) => {
  const [activeStageId, setActiveStageId] = useState<KeyStageId>('primary');
  const activeStage = KEY_STAGES.find((s) => s.id === activeStageId) || KEY_STAGES[1];

  return (
    <section id="curriculum" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Academic Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Curriculum Stages Tailored for Every Learner
          </h2>
          <p className="text-slate-600 text-base mt-3">
            Following the British National Curriculum with Pearson Edexcel & Cambridge international exam pathways, augmented by Nigerian heritage and social studies modules.
          </p>
        </div>

        {/* Stage Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 p-1.5 bg-slate-100 rounded-2xl max-w-3xl mx-auto">
          {KEY_STAGES.map((stage) => {
            const isActive = stage.id === activeStageId;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer text-center ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div>{stage.name}</div>
                <div className={`text-[11px] font-normal mt-0.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                  {stage.ageRange}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Overview Card */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  {activeStage.level}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {activeStage.ageRange}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {activeStage.name}
              </h3>
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                {activeStage.summary}
              </p>
            </div>

            <button
              onClick={() => {
                onSelectStageForCalculator(activeStage.id);
                const el = document.getElementById('tuition-calculator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <span>Calculate Fees for this Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Subjects Inventory Grid */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Featured Subject Modules
              </h4>
              <span className="text-xs text-slate-500">
                {activeStage.subjects.length} Subjects Available in this Key Stage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeStage.subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {subj.name}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        subj.category === 'core'
                          ? 'bg-slate-100 text-slate-700'
                          : subj.category === 'nigerian'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {subj.category === 'nigerian' ? 'Nigerian Curriculum' : subj.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {subj.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {subj.weeklyHours} Hours / Week
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Live & On-Demand
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

