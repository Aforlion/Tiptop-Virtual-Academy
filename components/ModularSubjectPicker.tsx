"use client";

import { useState } from "react";

export interface SubjectOption {
  id: string;
  name: string;
  keyStage: string;
  category: "STEM" | "Humanities" | "Languages" | "Technology";
  priceNGN: number;
  priceGBP: number;
  description: string;
}

const AVAILABLE_SUBJECTS: SubjectOption[] = [
  {
    id: "sub-math",
    name: "Mathematics & Numeracy Mastery",
    keyStage: "KS1 - KS4",
    category: "STEM",
    priceNGN: 200000,
    priceGBP: 100,
    description: "Core problem solving, algebra, geometry, and IGCSE exam drills."
  },
  {
    id: "sub-phy",
    name: "Physics (IGCSE Specialization)",
    keyStage: "KS3 - KS4",
    category: "STEM",
    priceNGN: 250000,
    priceGBP: 125,
    description: "Forces, electricity, thermal physics, and lab paper techniques."
  },
  {
    id: "sub-chem",
    name: "Chemistry (IGCSE Specialization)",
    keyStage: "KS3 - KS4",
    category: "STEM",
    priceNGN: 250000,
    priceGBP: 125,
    description: "Atomic structure, stoichiometry, organic chemistry, and reactions."
  },
  {
    id: "sub-eng",
    name: "English Language & Literature",
    keyStage: "KS1 - KS4",
    category: "Humanities",
    priceNGN: 200000,
    priceGBP: 100,
    description: "Comprehension, essay composition, and literary analysis."
  },
  {
    id: "sub-cs",
    name: "Computer Science & Python Coding",
    keyStage: "KS2 - KS4",
    category: "Technology",
    priceNGN: 220000,
    priceGBP: 110,
    description: "Algorithm design, Python programming fundamentals, and data structures."
  },
  {
    id: "sub-french",
    name: "French Language & Conversation",
    keyStage: "KS2 - KS4",
    category: "Languages",
    priceNGN: 180000,
    priceGBP: 90,
    description: "Vocabulary building, conversational drills, and oral assessment prep."
  }
];

export function ModularSubjectPicker() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["sub-math", "sub-phy"]);
  const [currency, setCurrency] = useState<"NGN" | "GBP">("NGN");
  const [enrolled, setEnrolled] = useState(false);

  const toggleSubject = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedSubjects = AVAILABLE_SUBJECTS.filter((s) => selectedIds.includes(s.id));
  const totalNGN = selectedSubjects.reduce((sum, item) => sum + item.priceNGN, 0);
  const totalGBP = selectedSubjects.reduce((sum, item) => sum + item.priceGBP, 0);
  const currencySymbol = currency === "NGN" ? "₦" : "£";
  const totalFee = currency === "NGN" ? totalNGN : totalGBP;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Modular Subject Enrollment</span>
          <h3 className="font-display text-2xl font-extrabold text-brand-darkviolet mt-1">Single Subject Add-On Picker</h3>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl self-start">
          <span className="text-[10px] font-bold text-neutral-400 uppercase px-2">Currency:</span>
          <button 
            onClick={() => setCurrency("NGN")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${currency === "NGN" ? "bg-brand-purple text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-purple"}`}
          >
            🇳🇬 NGN (₦)
          </button>
          <button 
            onClick={() => setCurrency("GBP")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${currency === "GBP" ? "bg-brand-purple text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-purple"}`}
          >
            🇬🇧 GBP (£)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {AVAILABLE_SUBJECTS.map((subject) => {
          const isSelected = selectedIds.includes(subject.id);
          return (
            <div
              key={subject.id}
              onClick={() => toggleSubject(subject.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-brand-purple/5 border-brand-purple ring-2 ring-brand-purple/20 shadow-md"
                  : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                    {subject.category} • {subject.keyStage}
                  </span>
                  <h4 className="font-display font-extrabold text-base text-brand-darkviolet mt-1">{subject.name}</h4>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? "bg-brand-purple text-brand-gold" : "bg-neutral-200 text-transparent"}`}>
                  ✓
                </div>
              </div>

              <p className="text-xs text-neutral-slate leading-relaxed">{subject.description}</p>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Term Add-On Fee</span>
                <span className="text-sm font-black text-brand-purple">
                  {currency === "NGN" ? `₦${subject.priceNGN.toLocaleString()}` : `£${subject.priceGBP}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-brand-purple to-[#8a2be2] text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block">Selected Subjects: {selectedSubjects.length}</span>
          <div className="text-2xl font-black mt-0.5">
            Total Fee: {currencySymbol}{totalFee.toLocaleString()} <span className="text-xs font-normal opacity-80">/ term</span>
          </div>
        </div>

        <button
          onClick={() => setEnrolled(true)}
          disabled={selectedSubjects.length === 0}
          className="w-full md:w-auto px-6 py-3 bg-brand-gold text-brand-darkviolet font-extrabold rounded-xl text-xs hover:bg-brand-gold/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {enrolled ? "✓ Enrolled in Modular Add-ons!" : "Confirm Subject Bundle ➔"}
        </button>
      </div>
    </div>
  );
}
