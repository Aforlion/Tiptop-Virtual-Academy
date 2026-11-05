'use client';

import React, { useState } from 'react';
import { GraduationCap, ArrowRight, UserCircle, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAdmissions: () => void;
  onOpenPortals: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmissions, onOpenPortals }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Advisory Banner */}
      <div className="bg-[#090D16] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ADMISSIONS OPEN
            </span>
            <span className="hidden sm:inline">British National Curriculum (EYFS to IGCSE) • Live Cohorts Capped at 10–12 Students</span>
            <span className="sm:hidden">British & Nigerian Curriculum (EYFS–IGCSE)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Classes Active
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Paystack Verified School
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  TIPTOP
                </span>
                <span className="text-[11px] font-semibold tracking-widest text-amber-600 uppercase mt-0.5">
                  Virtual Academy
                </span>
              </div>
            </a>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
              <a href="#curriculum" className="hover:text-amber-600 transition-colors">
                Curriculum
              </a>
              <a href="#delivery-modes" className="hover:text-amber-600 transition-colors">
                How It Works
              </a>
              <a href="#tuition-calculator" className="hover:text-amber-600 transition-colors">
                Tuition & Fees
              </a>
              <a href="#admissions-process" className="hover:text-amber-600 transition-colors">
                Admissions
              </a>
              <a href="#faq" className="hover:text-amber-600 transition-colors">
                FAQ
              </a>
            </nav>

            {/* Action CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="/admin/admissions"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
              >
                <span>Admin Hub</span>
              </a>
              <button
                onClick={onOpenPortals}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <UserCircle className="w-4 h-4 text-indigo-600" />
                Portals Login
              </button>
              <button
                onClick={onOpenAdmissions}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-amber-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onOpenAdmissions}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg"
              >
                Apply
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
            <a
              href="#curriculum"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
            >
              Curriculum & Key Stages
            </a>
            <a
              href="#delivery-modes"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
            >
              How It Works (Live vs On-Demand)
            </a>
            <a
              href="#tuition-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
            >
              Dynamic Tuition Calculator
            </a>
            <a
              href="#admissions-process"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
            >
              Admissions Steps
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
            >
              Frequently Asked Questions
            </a>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <a
                href="/admin/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg"
              >
                Admin Registry Console
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortals();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                <UserCircle className="w-4 h-4 text-indigo-600" />
                Access Portals (Student / Parent / Teacher)
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmissions();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Apply for Admission Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

