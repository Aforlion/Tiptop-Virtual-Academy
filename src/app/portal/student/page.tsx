'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Video,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  Layers,
  PlayCircle
} from 'lucide-react';
import { LearningResource, StudentTimetableSession } from '@/types';

// Mock Today's Schedule for Year 5 Primary
const TODAY_SESSIONS: StudentTimetableSession[] = [
  {
    id: 'sess-01',
    subject_code: 'MATH',
    subject_name: 'Mathematics: Fractions & Percentages',
    teacher_name: 'Ms. Claire Harrison',
    start_time: '10:00 AM',
    end_time: '10:45 AM',
    room_url: 'https://meet.google.com/sample-room-tva-math',
    cohort_name: 'Year 5 Cohort A (11 Learners)',
    status: 'live_now'
  },
  {
    id: 'sess-02',
    subject_code: 'ENG',
    subject_name: 'English Literature: Creative Narrative Writing',
    teacher_name: 'Mr. Babatunde Adebayo',
    start_time: '11:15 AM',
    end_time: '12:00 PM',
    room_url: 'https://meet.google.com/sample-room-tva-eng',
    cohort_name: 'Year 5 Cohort A',
    status: 'upcoming'
  },
  {
    id: 'sess-03',
    subject_code: 'SCI',
    subject_name: 'General Science: Photosynthesis Lab',
    teacher_name: 'Dr. Evelyn Campbell',
    start_time: '01:00 PM',
    end_time: '01:45 PM',
    room_url: 'https://meet.google.com/sample-room-tva-sci',
    cohort_name: 'Year 5 Cohort A',
    status: 'upcoming'
  },
  {
    id: 'sess-04',
    subject_code: 'NIG-SOC',
    subject_name: 'Nigerian Social Studies: National Constitution & Civic Rights',
    teacher_name: 'Mr. Kelechi Balogun',
    start_time: '02:15 PM',
    end_time: '03:00 PM',
    room_url: 'https://meet.google.com/sample-room-tva-soc',
    cohort_name: 'Year 5 Cohort A',
    status: 'upcoming'
  }
];

export default function StudentPortalPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeVideoModal, setActiveVideoModal] = useState<LearningResource | null>(null);

  // Fetch learning resources from vault
  useEffect(() => {
    async function fetchVaultResources() {
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        if (data.resources) {
          setResources(data.resources);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoadingResources(false);
      }
    }
    fetchVaultResources();
  }, []);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      if (selectedSubject !== 'all' && item.subject_code !== selectedSubject) return false;
      if (selectedType !== 'all' && item.resource_type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = item.title.toLowerCase();
        const desc = (item.description || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
  }, [resources, selectedSubject, selectedType, searchQuery]);

  const getResourceTypeIcon = (type: LearningResource['resource_type']) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-rose-400" />;
      case 'slides':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'worksheet':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Learner Welcome Header & Live Countdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#111C38] to-[#0F172A] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                Student Learning Workspace
              </span>
              <span className="text-xs text-slate-400">• Year 5 Primary (Cohort A)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, David Adeyemi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Your next live interactive class starts in <strong className="text-amber-400">14 minutes</strong>. Live cohorts are limited to 11 classmates for active engagement.
            </p>
          </div>

          {/* Large Live Class Launch Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-amber-400/20 transition-all cursor-pointer group"
            >
              <Video className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Launch Live Room (Google Meet)</span>
            </a>
          </div>
        </div>

        {/* Ambient Decorative Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Two Columns: Class Timetable & Academic Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Synchronous Timetable (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Today&apos;s Class Schedule</span>
              </h2>
              <p className="text-xs text-slate-400">4 live sessions scheduled for West Africa Time (WAT)</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Term 1 • Week 3
            </span>
          </div>

          <div className="space-y-3">
            {TODAY_SESSIONS.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-2xl border transition-all ${
                  sess.status === 'live_now'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-[#0F172A] border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {sess.status === 'live_now' ? (
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse block" />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-slate-600 block" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {sess.subject_name}
                        </span>
                        {sess.subject_code.startsWith('NIG') && (
                          <span className="text-xs" title="Nigerian Heritage Curriculum">🇳🇬</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {sess.start_time} – {sess.end_time}
                        </span>
                        <span>•</span>
                        <span>{sess.teacher_name}</span>
                        <span>•</span>
                        <span className="text-slate-500">{sess.cohort_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    {sess.status === 'live_now' ? (
                      <a
                        href={sess.room_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Room Now</span>
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-semibold text-xs">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Homework & Progress Status (1 Col) */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Assignments & Tasks</span>
          </h2>

          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Maths: Fraction Decimals Sheet</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    Submitted
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Grade: 95% (Exceeding Expectations)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">English: Descriptive Essay</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                    Due Tomorrow
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Submit via Google Classroom Dropbox</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Civic: Nigerian Rights Quiz</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                    Due Friday
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Review Module 1 Slides in Vault</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Overall Term Attendance</span>
              <span className="text-2xl font-black text-emerald-400 block mt-0.5">98.5%</span>
              <span className="text-[10px] text-slate-500">19 of 20 classes attended</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Vault: Slides, Masterclasses & Worksheets */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Academy Resource Vault</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access recorded video masterclasses, lesson presentation slides, and downloadable revision worksheets.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources, topics..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F172A] border border-slate-800 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedSubject === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedSubject('MATH')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedSubject === 'MATH' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mathematics
            </button>
            <button
              onClick={() => setSelectedSubject('ENG')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedSubject === 'ENG' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedSubject('SCI')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedSubject === 'SCI' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Science
            </button>
            <button
              onClick={() => setSelectedSubject('NIG-SOC')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedSubject === 'NIG-SOC' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nigerian Civic 🇳🇬
            </button>
            <button
              onClick={() => setSelectedSubject('NIG-HIST')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                selectedSubject === 'NIG-HIST' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nigerian History 🇳🇬
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0F172A] border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('video')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'video' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setSelectedType('slides')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'slides' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Slides
            </button>
            <button
              onClick={() => setSelectedType('worksheet')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'worksheet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Worksheets
            </button>
          </div>
        </div>

        {/* Resources Grid */}
        {loadingResources ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading Resource Vault materials...
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 text-slate-400 text-xs">
            No resources found matching the selected subject or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-900 border border-slate-800 capitalize text-slate-300">
                      {getResourceTypeIcon(res.resource_type)}
                      <span>{res.resource_type}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Week {res.week_number || 1} • Term {res.term_number || 1}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {res.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider">
                    {res.subject_code} {res.subject_code.startsWith('NIG') && '🇳🇬'}
                  </span>

                  {res.resource_type === 'video' ? (
                    <button
                      onClick={() => setActiveVideoModal(res)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Watch Masterclass</span>
                    </button>
                  ) : (
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Open Material</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Masterclass Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0F172A] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#090D16] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  On-Demand Video Masterclass
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-lg">
                  {activeVideoModal.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8 space-y-3">
                <PlayCircle className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
                <p className="text-sm font-semibold text-white">Video Lesson Stream</p>
                <p className="text-xs text-slate-400 max-w-md">
                  {activeVideoModal.description}
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                  Dual-Delivery Video Engine • Tiptop Virtual Academy
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#090D16] flex justify-end">
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

