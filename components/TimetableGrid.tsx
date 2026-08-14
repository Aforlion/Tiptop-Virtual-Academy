"use client";

import { useState } from "react";
import { IntegrationService } from "../domains/shared/services/integration-service";

export interface ScheduleItem {
  id: string;
  subject: string;
  keyStage: string;
  teacherName: string;
  timeWAT: string; // West Africa Time e.g. "09:00 AM - 10:00 AM"
  timeGMT: string; // GMT e.g. "08:00 AM - 09:00 AM"
  status: "LIVE" | "UPCOMING" | "RECORDED";
  meetUrl: string;
  topic: string;
}

const MOCK_TIMETABLE: ScheduleItem[] = [
  {
    id: "tt-1",
    subject: "Mathematics & Numeracy",
    keyStage: "Primary (KS2)",
    teacherName: "Mr. David Okonjo",
    timeWAT: "09:00 AM - 10:00 AM WAT",
    timeGMT: "08:00 AM - 09:00 AM GMT",
    status: "LIVE",
    meetUrl: "https://meet.google.com/tva-math-ks2",
    topic: "Fractions & Decimals: Equivalents and Word Problems"
  },
  {
    id: "tt-2",
    subject: "English Language & Phonics",
    keyStage: "Primary (KS1-2)",
    teacherName: "Mrs. Victoria Sterling",
    timeWAT: "10:30 AM - 11:30 AM WAT",
    timeGMT: "09:30 AM - 10:30 AM GMT",
    status: "UPCOMING",
    meetUrl: "https://meet.google.com/tva-eng-ks2",
    topic: "Creative Writing: Descriptive Passages and Metaphors"
  },
  {
    id: "tt-3",
    subject: "IGCSE Physics",
    keyStage: "Secondary (KS4)",
    teacherName: "Dr. Emeka Nwachukwu",
    timeWAT: "12:00 PM - 01:00 PM WAT",
    timeGMT: "11:00 AM - 12:00 PM GMT",
    status: "UPCOMING",
    meetUrl: "https://meet.google.com/tva-phy-igcse",
    topic: "Thermal Physics & Heat Capacity Calculations"
  },
  {
    id: "tt-4",
    subject: "Computing & Python Coding",
    keyStage: "Secondary (KS3)",
    teacherName: "Engr. Adebayo Vance",
    timeWAT: "02:00 PM - 03:00 PM WAT",
    timeGMT: "01:00 PM - 02:00 PM GMT",
    status: "RECORDED",
    meetUrl: "https://meet.google.com/tva-cs-ks3",
    topic: "Algorithms: Data Types and Conditional Statements"
  }
];

export function TimetableGrid() {
  const [timezone, setTimezone] = useState<"WAT" | "GMT">("WAT");
  const [joinedSession, setJoinedSession] = useState<string | null>(null);

  const handleJoinClass = (item: ScheduleItem) => {
    setJoinedSession(item.id);
    
    // Trigger WhatsApp notification simulation for parent assurance
    IntegrationService.notifyParentWhatsApp(
      "Student Scholar",
      `Joined live class: ${item.subject} (${item.topic}) at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );

    // Open Google Meet link in new tab
    window.open(item.meetUrl, "_blank");
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <span className="text-[10px] bg-brand-purple/5 text-brand-purple border border-brand-purple/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Synchronous Live Schedule</span>
          <h3 className="font-display text-2xl font-extrabold text-brand-darkviolet mt-1">Interactive Academic Timetable</h3>
        </div>

        {/* Dual Timezone Switcher */}
        <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl self-start">
          <span className="text-[10px] font-bold text-neutral-400 uppercase px-2">Timezone Sync:</span>
          <button 
            onClick={() => setTimezone("WAT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${timezone === "WAT" ? "bg-brand-purple text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-purple"}`}
          >
            🇳🇬 West Africa (WAT)
          </button>
          <button 
            onClick={() => setTimezone("GMT")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${timezone === "GMT" ? "bg-brand-purple text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-purple"}`}
          >
            🇬🇧 London (GMT/BST)
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {MOCK_TIMETABLE.map((item) => (
          <div 
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              item.status === "LIVE"
                ? "bg-gradient-to-r from-emerald-50/80 to-white border-emerald-300 ring-2 ring-emerald-400/20 shadow-md"
                : item.status === "UPCOMING"
                  ? "bg-white border-neutral-200/80 hover:border-brand-purple/30 shadow-sm"
                  : "bg-neutral-50/60 border-neutral-200/60 text-neutral-500 opacity-90"
            }`}
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                {item.status === "LIVE" && (
                  <span className="text-[9px] bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    ● Live Now
                  </span>
                )}
                {item.status === "UPCOMING" && (
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Upcoming
                  </span>
                )}
                {item.status === "RECORDED" && (
                  <span className="text-[9px] bg-neutral-200 text-neutral-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recorded Archive
                  </span>
                )}
                <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/5 px-2.5 py-0.5 rounded-full">
                  {item.keyStage}
                </span>
                <span className="text-xs font-semibold text-neutral-400">• Teacher: {item.teacherName}</span>
              </div>

              <h4 className="font-display font-extrabold text-base text-brand-darkviolet">{item.subject}</h4>
              <p className="text-xs text-neutral-slate">{item.topic}</p>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
              <div className="text-right">
                <span className="text-xs font-black text-brand-darkviolet block">
                  {timezone === "WAT" ? item.timeWAT : item.timeGMT}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium block">Google Calendar Sync Active</span>
              </div>

              <button
                onClick={() => handleJoinClass(item)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                  item.status === "LIVE"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce"
                    : item.status === "UPCOMING"
                      ? "bg-brand-purple hover:bg-brand-purple/90 text-brand-gold"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
              >
                <span>{item.status === "RECORDED" ? "📺 Watch Recording" : "📹 Join Google Meet"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {joinedSession && (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <span>✓ Attendance logged & parent WhatsApp notification queued for active session.</span>
          <button onClick={() => setJoinedSession(null)} className="font-bold text-emerald-900">Dismiss</button>
        </div>
      )}
    </div>
  );
}
