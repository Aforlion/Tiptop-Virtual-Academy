import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  UserCircle,
  ExternalLink
} from 'lucide-react';

export const metadata = {
  title: 'Academy Learning & Family Portal | Tiptop Virtual Academy',
  description: 'Role-based student learning workspace and parent command center for Tiptop Virtual Academy.'
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-amber-400 selection:text-slate-900">
      {/* Top Portal Header */}
      <header className="bg-[#090D16] border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Portal Switcher */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  TIPTOP
                </span>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mt-0.5">
                  Virtual Academy
                </span>
              </div>
            </Link>

            {/* Role Switcher Tabs */}
            <nav className="hidden sm:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <Link
                href="/portal/student"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Student Hub</span>
              </Link>
              <Link
                href="/portal/parent"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Parent Command Center</span>
              </Link>
            </nav>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/admissions"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <span>Admin Registry</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Academy Site</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="sm:hidden flex border-t border-slate-800/80 bg-[#0B0F19] px-4 py-2 gap-2">
          <Link
            href="/portal/student"
            className="flex-1 text-center py-2 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 text-amber-400"
          >
            Student Hub
          </Link>
          <Link
            href="/portal/parent"
            className="flex-1 text-center py-2 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 text-indigo-400"
          >
            Parent Center
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
