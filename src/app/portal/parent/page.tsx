'use client';

import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  CreditCard,
  Clock,
  BookOpen,
  Download,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Phone,
  ArrowRight
} from 'lucide-react';
import { ParentInvoice } from '@/types';

// Mock billing records for active family
const INITIAL_INVOICES: ParentInvoice[] = [
  {
    id: 'inv-001',
    title: 'Registration & Onboarding Deposit',
    amount: 75000,
    currency: 'NGN',
    status: 'paid',
    due_date: '2026-09-01',
    paid_at: '2026-09-01 10:15 WAT',
    paystack_reference: 'TVA_PSK_829104_REG',
    term_period: 'Term 1 (2026/2027)'
  },
  {
    id: 'inv-002',
    title: 'Term 1 Tuition: British & Nigerian Curriculum (Live Cohorts)',
    amount: 350000,
    currency: 'NGN',
    status: 'paid',
    due_date: '2026-09-15',
    paid_at: '2026-09-12 14:30 WAT',
    paystack_reference: 'TVA_PSK_991823_T1',
    term_period: 'Term 1 (2026/2027)'
  },
  {
    id: 'inv-003',
    title: 'Term 2 Tuition: Live Small Group Cohorts (Max 12 Students)',
    amount: 350000,
    currency: 'NGN',
    status: 'pending',
    due_date: '2027-01-15',
    term_period: 'Term 2 (2026/2027)'
  }
];

export default function ParentPortalPage() {
  const [invoices, setInvoices] = useState<ParentInvoice[]>(INITIAL_INVOICES);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Pay invoice via Paystack trigger simulation
  const handlePayInvoice = async (inv: ParentInvoice) => {
    try {
      setPayingInvoiceId(inv.id);
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'ngozi.adeyemi@example.com',
          amount: inv.amount,
          currency: inv.currency,
          metadata: {
            invoiceId: inv.id,
            studentName: 'David Adeyemi',
            termPeriod: inv.term_period
          }
        })
      });
      const data = await res.json();

      if (data.authorizationUrl) {
        // If live checkout url exists, redirect or simulate immediate payment completion
        setInvoices((prev) =>
          prev.map((item) =>
            item.id === inv.id
              ? {
                  ...item,
                  status: 'paid',
                  paid_at: new Date().toLocaleString(),
                  paystack_reference: data.reference || `TVA_PSK_${Date.now()}`
                }
              : item
          )
        );
        setPaySuccessMsg(`Payment of ₦${inv.amount.toLocaleString()} processed successfully via Paystack!`);
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
    } finally {
      setPayingInvoiceId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Parent Command Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                Parent Command Center
              </span>
              <span className="text-xs text-slate-400">• Family Account #TVA-8291</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dr. Ngozi Adeyemi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Active learner supervision for <strong className="text-amber-400">David Adeyemi (Year 5 Primary)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Enrollment & Tuition Active</span>
            </span>
          </div>
        </div>
      </div>

      {paySuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{paySuccessMsg}</span>
          </div>
          <button
            onClick={() => setPaySuccessMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards: Attendance, Grades, Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance Metric */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Term 1 Attendance Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white block mt-3">98.5%</span>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
            19 of 20 live cohort sessions attended
          </p>
        </div>

        {/* Academic Submissions */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Classroom Submissions</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white block mt-3">100%</span>
          <p className="text-[11px] text-indigo-400 mt-1 font-semibold">
            All homework and lab worksheets submitted
          </p>
        </div>

        {/* Upcoming Tuition */}
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Term 2 Tuition Status</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white block mt-3">₦350,000</span>
          <p className="text-[11px] text-amber-400 mt-1 font-semibold">
            Due 15 January 2027 • Paystack Gateway
          </p>
        </div>
      </div>

      {/* Paystack Financial Ledger & Invoices */}
      <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Tuition Billing & Paystack Statements</span>
            </h2>
            <p className="text-xs text-slate-400">
              Direct Paystack transaction receipts and upcoming school fee schedules.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>256-Bit Encrypted Paystack Processing</span>
          </div>
        </div>

        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <div className="bg-[#090D16] px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Statement Description</span>
            <span>Status & Action</span>
          </div>
          <div className="divide-y divide-slate-800/80 text-xs">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
              >
                <div>
                  <span className="font-extrabold text-white text-sm block">
                    {inv.title}
                  </span>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                    <span>{inv.term_period}</span>
                    <span>•</span>
                    <span>Due: {inv.due_date}</span>
                    {inv.paystack_reference && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-400">Ref: {inv.paystack_reference}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-black text-white text-sm block">
                      {inv.currency === 'GBP' ? '£' : '₦'}
                      {inv.amount.toLocaleString()}
                    </span>
                    <span className={`text-[11px] font-bold block ${inv.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {inv.status === 'paid' ? 'Paid & Reconciled' : 'Pending Payment'}
                    </span>
                  </div>

                  {inv.status === 'pending' ? (
                    <button
                      onClick={() => handlePayInvoice(inv)}
                      disabled={payingInvoiceId === inv.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span>{payingInvoiceId === inv.id ? 'Connecting...' : 'Pay via Paystack'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Receipt Available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Observations & Teacher Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Teacher Notes */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Weekly Academic Observations</span>
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400">Ms. Claire Harrison (Mathematics)</span>
                <span className="text-[11px] text-slate-500">2 days ago</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                &ldquo;David has demonstrated outstanding analytical clarity in our small-group fractions masterclass. He volunteered to explain equivalent percentages on the virtual whiteboard and helped his peers confidently.&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">Mr. Kelechi Balogun (Nigerian Civic Studies)</span>
                <span className="text-[11px] text-slate-500">5 days ago</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                &ldquo;Great contribution during the discussion on Nigerian democratic values and constitutional rights. David completed his Module 1 quiz with high distinction.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 1:1 Teacher Consultation Booking */}
        <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Parent-Teacher Consultation (PTC)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Connect 1-on-1 with David&apos;s teachers for a 15-minute video progress conference.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mt-4 space-y-2">
              <span className="text-xs font-bold text-white block">Next Open Consultation Window:</span>
              <p className="text-xs text-amber-400 font-semibold">
                Thursday, 12th November 2026 • 04:00 PM – 06:30 PM (WAT)
              </p>
              <p className="text-[11px] text-slate-500">
                Conducted privately over Google Meet with Head of Year 5.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Available Slots: <strong className="text-white">3 remaining</strong></span>
            <button
              onClick={() => alert('Parent-Teacher Consultation request submitted! The academic office will confirm your slot via email.')}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Book 1:1 Consultation Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
