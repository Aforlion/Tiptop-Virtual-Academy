import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CreditCard,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Bell,
  Clock,
  Layers
} from 'lucide-react';

export const metadata = {
  title: 'Admin Registry Console | Tiptop Virtual Academy',
  description: 'Admissions management, Paystack reconciliation, and student enrollments for Tiptop Virtual Academy.'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#090D16] border-r border-slate-800 flex flex-col shrink-0 hidden md:flex">
        {/* Academy Crest Header */}
        <div className="p-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                TIPTOP
              </span>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mt-1 block">
                Registry Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 text-xs font-semibold">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Admissions & SIS
          </div>

          <Link
            href="/admin/admissions"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold transition-all"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Admissions Hub</span>
          </Link>

          <div className="px-3 pt-6 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Academic Delivery
          </div>

          <Link
            href="/#delivery-modes"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Cohorts & Timetable</span>
          </Link>

          <Link
            href="/#curriculum"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Curriculum Vault</span>
          </Link>

          <div className="px-3 pt-6 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Commercial & Billing
          </div>

          <Link
            href="/#tuition-calculator"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Paystack Transactions</span>
          </Link>
        </nav>

        {/* Back to Public Site */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Website</span>
          </Link>
        </div>

        {/* Admin Officer Profile Card */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
            AO
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-white block truncate">
              Admissions Officer
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              admissions@tiptop.ac
            </span>
          </div>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F19]">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-[#090D16]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Link href="/" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden sm:inline font-semibold text-slate-500">Console</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-bold text-white">Admissions & Enrollment Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live System Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase & Paystack Active</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline text-[11px]">West Africa Time (WAT)</span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

