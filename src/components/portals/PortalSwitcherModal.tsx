'use client';

import React, { useState } from 'react';
import { X, GraduationCap, Users, BookOpen, Clock, Calendar, CheckCircle2, ShieldCheck, Video, FileText, ArrowUpRight } from 'lucide-react';

interface PortalSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalSwitcherModal: React.FC<PortalSwitcherModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'teacher'>('student');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0F172A] text-white px-6 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">
              Tiptop Virtual Academy
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Role-Based Academy Portals
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 sm:px-8 pt-3">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'student'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            Student Workspace
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'parent'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-500" />
            Parent Command Center
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'teacher'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Teacher & Admin Console
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: Student Workspace */}
          {activeTab === 'student' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Welcome back, David (Year 5 Primary)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Your next live class starts in 14 minutes.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xs">
                  <Video className="w-4 h-4" />
                  <span>Launch Live Classroom (Google Meet)</span>
                </div>
              </div>

              {/* Mock Timetable Agenda */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Today&apos;s Class Schedule
                </h5>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">
                          Mathematics: Fractions & Percentages
                        </span>
                        <span className="text-[11px] text-slate-500">10:00 AM – 10:45 AM (WAT) • Ms. Harrison (Cohort A)</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                      Join Room
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">
                          English Literature: Creative Narrative Writing
                        </span>
                        <span className="text-[11px] text-slate-500">11:15 AM – 12:00 PM (WAT) • Mr. Adebayo</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Scheduled</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">
                          General Science: Photosynthesis Lab
                        </span>
                        <span className="text-[11px] text-slate-500">01:00 PM – 01:45 PM (WAT) • Dr. Campbell</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Parent Command Center */}
          {activeTab === 'parent' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Parent Dashboard: Dr. Ngozi Adeyemi
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tracking 1 enrolled learner (David Adeyemi — Year 5)
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Tuition Active via Paystack
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Term Attendance Rate</span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-1 block">98.5%</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">19 of 20 sessions attended</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Homework Completion</span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-1 block">100%</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">All submissions marked</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 block">Next Term Invoice</span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-1 block">₦350,000</span>
                  <span className="text-[11px] text-slate-500">Due: 15 January 2027</span>
                </div>
              </div>

              {/* Recent Invoices Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700">
                  Recent Paystack Billing Statements
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Registration Deposit (Term 1)</span>
                      <span className="text-slate-400 text-[11px]">Paystack Ref: TVA_PSK_829104</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">₦75,000</span>
                      <span className="block text-[11px] text-emerald-600 font-semibold">Paid & Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Teacher & Admin Console */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    Teacher Console: Ms. Claire Harrison
                  </h4>
                  <p className="text-xs text-slate-500">
                    Active Cohort: Year 5 Mathematics (11 of 12 seats filled)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/admin/admissions"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs"
                  >
                    <span>Open Admin Registry Hub</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <button className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800">
                    Save Attendance
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 flex justify-between">
                  <span>Student Name</span>
                  <span>Attendance Status (Click to Toggle)</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { name: 'David Adeyemi', status: 'Present' },
                    { name: 'Sarah Jenkins', status: 'Present' },
                    { name: 'Ibrahim Bello', status: 'Present' },
                    { name: 'Amara Okafor', status: 'Late (5 mins)' }
                  ].map((stu, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <span className="font-bold text-slate-900">{stu.name}</span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        stu.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {stu.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

