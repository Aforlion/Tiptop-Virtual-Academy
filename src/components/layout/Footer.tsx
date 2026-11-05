'use client';

import React from 'react';
import { GraduationCap, ShieldCheck, Mail, Globe, MapPin, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#090D16] text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center text-white border border-slate-700">
                <GraduationCap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">
                  TIPTOP VIRTUAL ACADEMY
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-amber-500 uppercase">
                  Accredited British & International Schooling
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Tiptop Virtual Academy provides full-time and supplementary online British education (EYFS through to IGCSE) for global families, expatriates, and home-educating students worldwide, with optional localized Nigerian heritage integration.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paystack Protected Checkout</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs border border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambridge & Edexcel Framework</span>
              </div>
            </div>
          </div>

          {/* Academic Pathways */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Curriculum Pathways</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#curriculum" className="hover:text-amber-400 transition-colors">Early Years Foundation (EYFS)</a></li>
              <li><a href="#curriculum" className="hover:text-amber-400 transition-colors">Primary Key Stage 1 (Years 1–2)</a></li>
              <li><a href="#curriculum" className="hover:text-amber-400 transition-colors">Primary Key Stage 2 (Years 3–6)</a></li>
              <li><a href="#curriculum" className="hover:text-amber-400 transition-colors">Secondary Key Stage 3 (Years 7–9)</a></li>
              <li><a href="#curriculum" className="hover:text-amber-400 transition-colors">IGCSE Key Stage 4 (Years 10–11)</a></li>
              <li><a href="#curriculum" className="hover:text-amber-400 transition-colors">Nigerian History & Social Studies</a></li>
            </ul>
          </div>

          {/* Portals & Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Academy Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#tuition-calculator" className="hover:text-amber-400 transition-colors">Fee & Subject Calculator</a></li>
              <li><a href="#admissions-process" className="hover:text-amber-400 transition-colors">Admissions Guide</a></li>
              <li><a href="#delivery-modes" className="hover:text-amber-400 transition-colors">Interactive Live Classes</a></li>
              <li><a href="#delivery-modes" className="hover:text-amber-400 transition-colors">On-Demand Masterclasses</a></li>
              <li><a href="#faq" className="hover:text-amber-400 transition-colors">School Calendar & Term Dates</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Parent-Teacher Consultations</a></li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-amber-400 transition-colors">Child Safeguarding Policy</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Online Behaviour Code</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">GDPR & NDPA Privacy Notice</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Paystack Refund & Terms</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Equal Opportunities Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Tiptop Virtual Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              Serving Learners Worldwide (UK, Nigeria, Europe, Middle East)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

