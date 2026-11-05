'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { CurriculumExplorer } from '@/components/home/CurriculumExplorer';
import { DualDeliveryShowcase } from '@/components/home/DualDeliveryShowcase';
import { TuitionCalculator } from '@/components/calculator/TuitionCalculator';
import { AdmissionsProcessSection } from '@/components/home/AdmissionsProcessSection';
import { FaqSection } from '@/components/home/FaqSection';
import { AdmissionsModal } from '@/components/admissions/AdmissionsModal';
import { PortalSwitcherModal } from '@/components/portals/PortalSwitcherModal';
import { KeyStageId, TuitionQuote } from '@/types';

export default function Home() {
  const [admissionsModalOpen, setAdmissionsModalOpen] = useState(false);
  const [portalsModalOpen, setPortalsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<TuitionQuote | null>(null);
  const [calculatorStageId, setCalculatorStageId] = useState<KeyStageId>('primary');

  const handleOpenAdmissionsWithQuote = (quote: TuitionQuote) => {
    setSelectedQuote(quote);
    setAdmissionsModalOpen(true);
  };

  const handleStageSelectFromCurriculum = (stageId: KeyStageId) => {
    setCalculatorStageId(stageId);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 selection:bg-amber-400 selection:text-slate-900">
      {/* Navigation */}
      <Navbar
        onOpenAdmissions={() => setAdmissionsModalOpen(true)}
        onOpenPortals={() => setPortalsModalOpen(true)}
      />

      {/* Main Content Sections */}
      <div className="flex-1">
        {/* 1. Hero Section (virtualschool.co.uk aesthetic) */}
        <Hero onOpenAdmissions={() => setAdmissionsModalOpen(true)} />

        {/* 2. Interactive Curriculum Explorer (British + Nigerian integration) */}
        <CurriculumExplorer onSelectStageForCalculator={handleStageSelectFromCurriculum} />

        {/* 3. Dual Delivery Modes (Live Cohorts vs On-Demand Masterclasses) */}
        <DualDeliveryShowcase />

        {/* 4. Dynamic Tuition & Subject Calculator (ukvirtualschool.co.uk functionality) */}
        <TuitionCalculator
          initialStageId={calculatorStageId}
          onProceedToAdmissions={handleOpenAdmissionsWithQuote}
        />

        {/* 5. Admissions Step-by-Step Walkthrough */}
        <AdmissionsProcessSection onOpenAdmissions={() => setAdmissionsModalOpen(true)} />

        {/* 6. FAQ & Parent Guidance */}
        <FaqSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <AdmissionsModal
        isOpen={admissionsModalOpen}
        onClose={() => setAdmissionsModalOpen(false)}
        initialQuote={selectedQuote}
      />

      <PortalSwitcherModal
        isOpen={portalsModalOpen}
        onClose={() => setPortalsModalOpen(false)}
      />
    </main>
  );
}
