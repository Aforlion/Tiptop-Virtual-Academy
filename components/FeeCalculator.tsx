"use client";

import { useState } from "react";
import { CurriculumService } from "../domains/curriculum/curriculum-service";

export function FeeCalculator() {
  const [keyStage, setKeyStage] = useState<"eyfs" | "primary" | "secondary">("primary");
  const [currency, setCurrency] = useState<"NGN" | "GBP">("NGN");
  const [learningMode, setLearningMode] = useState<"full-time" | "homeschooling" | "modular">("full-time");
  const [siblingCount, setSiblingCount] = useState(1);
  const [isReferral, setIsReferral] = useState(false);

  // Calculate Base
  let baseNGN = 750000;
  if (keyStage === "eyfs") baseNGN = 600000;
  if (keyStage === "secondary") baseNGN = 900000;

  // Learning Mode adjustment
  if (learningMode === "homeschooling") baseNGN *= 0.75;
  if (learningMode === "modular") baseNGN *= 0.50;

  const base = currency === "GBP" ? Math.round(baseNGN / 2000) : baseNGN;
  const siblingDiscount = CurriculumService.calculateSiblingDiscount(base, siblingCount);
  const referralDiscount = isReferral ? CurriculumService.calculateReferralDiscount(base, 1) : 0;
  const finalFee = Math.max(base - siblingDiscount - referralDiscount, 0);

  const currencySymbol = currency === "NGN" ? "₦" : "£";

  return (
    <div className="bg-white p-8 rounded-3xl border border-brand-purple/10 shadow-premium space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <span className="text-[10px] bg-brand-purple/5 text-brand-purple px-3 py-1 rounded-full font-bold uppercase tracking-wider">Interactive Fee Calculator</span>
          <h3 className="font-display text-2xl font-extrabold text-brand-darkviolet mt-1">Estimate Your Tuition</h3>
        </div>
        
        {/* Currency Switcher */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
          <button 
            onClick={() => setCurrency("NGN")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currency === "NGN" ? "bg-brand-purple text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-purple"}`}
          >
            🇳🇬 NGN (₦)
          </button>
          <button 
            onClick={() => setCurrency("GBP")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currency === "GBP" ? "bg-brand-purple text-brand-gold shadow-sm" : "text-neutral-600 hover:text-brand-purple"}`}
          >
            🇬🇧 GBP (£)
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1.5">Academic Key Stage</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setKeyStage("eyfs")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${keyStage === "eyfs" ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                EYFS (Ages 3-5)
              </button>
              <button 
                onClick={() => setKeyStage("primary")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${keyStage === "primary" ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                Primary (KS1-2)
              </button>
              <button 
                onClick={() => setKeyStage("secondary")}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${keyStage === "secondary" ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                Secondary (KS3-4)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1.5">Learning Pathway</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setLearningMode("full-time")}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all ${learningMode === "full-time" ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                Full-Time Virtual
              </button>
              <button 
                onClick={() => setLearningMode("homeschooling")}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all ${learningMode === "homeschooling" ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                Flexible Homeschool
              </button>
              <button 
                onClick={() => setLearningMode("modular")}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all ${learningMode === "modular" ? "border-brand-purple bg-brand-purple/5 text-brand-purple" : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                Modular / Single Sub.
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1.5">Enrolled Children ({siblingCount})</label>
            <div className="flex items-center gap-3">
              <input 
                type="range"
                min={1}
                max={4}
                value={siblingCount}
                onChange={(e) => setSiblingCount(Number(e.target.value))}
                className="w-full accent-brand-purple"
              />
              <span className="text-xs font-bold bg-neutral-100 px-3 py-1 rounded-lg text-brand-purple">{siblingCount} {siblingCount > 1 ? "Kids" : "Child"}</span>
            </div>
            {siblingCount > 1 && (
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ {CurriculumService.getSiblingDiscountPercent(siblingCount)}% Sibling Discount Applied</span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox"
              id="refCheck"
              checked={isReferral}
              onChange={(e) => setIsReferral(e.target.checked)}
              className="rounded border-neutral-300 text-brand-purple focus:ring-brand-purple"
            />
            <label htmlFor="refCheck" className="text-xs text-neutral-700 font-medium">I have a TVA Referral Code (5% Extra Off)</label>
          </div>
        </div>

        {/* Calculation Result Breakdown */}
        <div className="bg-gradient-to-br from-brand-purple/5 via-brand-purple/10 to-brand-gold/10 p-6 rounded-2xl border border-brand-purple/15 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-purple">Term Tuition Breakdown</span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Base Tuition Rate:</span>
                <span className="font-semibold">{currencySymbol}{base.toLocaleString()}</span>
              </div>
              {siblingDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Sibling Discount ({CurriculumService.getSiblingDiscountPercent(siblingCount)}%):</span>
                  <span>-{currencySymbol}{siblingDiscount.toLocaleString()}</span>
                </div>
              )}
              {referralDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Referral Savings (5%):</span>
                  <span>-{currencySymbol}{referralDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-purple/10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Estimated Tuition Per Term</span>
            <div className="text-3xl font-black text-brand-purple mt-1">
              {currencySymbol}{finalFee.toLocaleString()}
            </div>
            <span className="text-[10px] text-neutral-500 block mt-1">
              * Billed termly (3 terms per academic year). Includes Google Workspace, learning portal access, and curriculum resources.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
