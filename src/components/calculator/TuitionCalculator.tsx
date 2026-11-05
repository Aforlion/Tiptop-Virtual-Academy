'use client';

import React, { useState, useMemo } from 'react';
import { KEY_STAGES } from '@/data/curriculum';
import { KeyStageId, DeliveryFormat, Currency, TuitionQuote } from '@/types';
import { Calculator, Check, ArrowRight, ShieldCheck, Tag, Info, Sparkles } from 'lucide-react';

interface TuitionCalculatorProps {
  initialStageId?: KeyStageId;
  onProceedToAdmissions: (quote: TuitionQuote) => void;
}

export const TuitionCalculator: React.FC<TuitionCalculatorProps> = ({
  initialStageId = 'primary',
  onProceedToAdmissions
}) => {
  const [selectedStageId, setSelectedStageId] = useState<KeyStageId>(initialStageId);
  const [selectedFormat, setSelectedFormat] = useState<DeliveryFormat>('live');
  const [currency, setCurrency] = useState<Currency>('NGN');
  const [termInterval, setTermInterval] = useState<'monthly' | 'termly' | 'annual'>('termly');
  const [hasSiblingDiscount, setHasSiblingDiscount] = useState(false);

  // Get active stage
  const currentStage = KEY_STAGES.find((s) => s.id === selectedStageId) || KEY_STAGES[1];

  // Subject selection for pick-and-mix (default all selected for full bundle)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    currentStage.subjects.map((s) => s.id)
  );

  // Update selected subjects when stage changes
  const handleStageChange = (newStageId: KeyStageId) => {
    setSelectedStageId(newStageId);
    const newStage = KEY_STAGES.find((s) => s.id === newStageId);
    if (newStage) {
      setSelectedSubjectIds(newStage.subjects.map((s) => s.id));
    }
  };

  const toggleSubject = (subjId: string) => {
    if (selectedSubjectIds.includes(subjId)) {
      if (selectedSubjectIds.length > 1) {
        setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subjId));
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subjId]);
    }
  };

  const selectAllSubjects = () => {
    setSelectedSubjectIds(currentStage.subjects.map((s) => s.id));
  };

  // Pricing calculations
  const quote = useMemo((): TuitionQuote => {
    const isFullBundle = selectedSubjectIds.length === currentStage.subjects.length;
    let baseMonthly = 0;

    if (selectedFormat === 'bundle' || (selectedFormat === 'live' && isFullBundle)) {
      baseMonthly = currentStage.pricing.fullBundleMonthly[currency];
    } else if (selectedFormat === 'on-demand' && isFullBundle) {
      baseMonthly = currentStage.pricing.onDemandMonthly[currency];
    } else {
      // Pick-and-mix per subject calculation
      const singleSubjectRate =
        selectedFormat === 'live'
          ? Math.round(currentStage.pricing.liveMonthly[currency] / 3)
          : Math.round(currentStage.pricing.onDemandMonthly[currency] / 3);
      baseMonthly = singleSubjectRate * selectedSubjectIds.length;
    }

    // Multiply by interval
    let intervalMultiplier = 1;
    let termDiscountPercent = 0;

    if (termInterval === 'termly') {
      intervalMultiplier = 3; // 3 months in a term
      termDiscountPercent = 0.05; // 5% termly discount
    } else if (termInterval === 'annual') {
      intervalMultiplier = 9; // 3 terms (9 academic months)
      termDiscountPercent = 0.12; // 12% annual prepayment discount
    }

    const unadjustedTotal = baseMonthly * intervalMultiplier;
    let discountAmount = unadjustedTotal * termDiscountPercent;

    if (hasSiblingDiscount) {
      discountAmount += (unadjustedTotal - discountAmount) * 0.1; // Additional 10% sibling discount
    }

    const finalTotal = Math.round(unadjustedTotal - discountAmount);
    const registrationFee = currentStage.pricing.registrationDeposit[currency];

    return {
      keyStageId: selectedStageId,
      format: selectedFormat,
      selectedSubjectIds,
      currency,
      hasSiblingDiscount,
      termInterval,
      pricing: {
        baseRate: unadjustedTotal,
        discountAmount: Math.round(discountAmount),
        finalTotal,
        registrationFee
      }
    };
  }, [
    selectedStageId,
    selectedFormat,
    currency,
    termInterval,
    hasSiblingDiscount,
    selectedSubjectIds,
    currentStage
  ]);

  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'GBP' ? '£' : '$';

  return (
    <section id="tuition-calculator" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Transparent UK Virtual School Pricing Model
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dynamic Tuition & Subject Calculator
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Configure your child&apos;s educational package, select subjects, apply sibling discounts, and inspect Paystack checkout amounts in real-time.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
            {/* 1. Currency & Sibling Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  1. Select Currency
                </label>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                  {(['NGN', 'GBP', 'USD'] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currency === curr
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {curr === 'NGN' ? '₦ NGN (Naira)' : curr === 'GBP' ? '£ GBP (Pounds)' : '$ USD (Dollars)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Family Discount
                </label>
                <button
                  type="button"
                  onClick={() => setHasSiblingDiscount(!hasSiblingDiscount)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    hasSiblingDiscount
                      ? 'bg-amber-500/10 border-amber-500 text-amber-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sibling Discount (10% Off)</span>
                  {hasSiblingDiscount && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              </div>
            </div>

            {/* 2. Key Stage Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                2. Select Academic Key Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {KEY_STAGES.map((stage) => {
                  const isSelected = stage.id === selectedStageId;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => handleStageChange(stage.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <span className="text-xs font-extrabold block truncate">{stage.name}</span>
                      <span className={`text-[11px] block mt-1 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                        {stage.ageRange}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Delivery Format */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                3. Choose Learning Delivery Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedFormat('live')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFormat === 'live'
                      ? 'border-amber-600 bg-amber-50/40 text-slate-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold">Interactive Live</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Live video, max 10–12 cohort, UK specialist teachers.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedFormat('on-demand')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFormat === 'on-demand'
                      ? 'border-indigo-600 bg-indigo-50/40 text-slate-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold">On-Demand Lessons</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    25-min edited video masterclasses + digital worksheets.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setSelectedFormat('live');
                    selectAllSubjects();
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedSubjectIds.length === currentStage.subjects.length && selectedFormat === 'live'
                      ? 'border-emerald-600 bg-emerald-50/40 text-slate-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold">Complete Bundle</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Best Value
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    All subjects + pastoral coaching & clubs.
                  </p>
                </button>
              </div>
            </div>

            {/* 4. Subject Selection (Pick-and-Mix) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  4. Select Subjects ({selectedSubjectIds.length} of {currentStage.subjects.length} selected)
                </label>
                <button
                  onClick={selectAllSubjects}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  Select All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStage.subjects.map((subj) => {
                  const isChecked = selectedSubjectIds.includes(subj.id);
                  return (
                    <div
                      key={subj.id}
                      onClick={() => toggleSubject(subj.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">{subj.name}</span>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-amber-400 text-slate-900' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Payment Frequency Terms */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                5. Billing Frequency & Term Schedule
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTermInterval('monthly')}
                  className={`py-3 px-3 text-center rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    termInterval === 'monthly'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span>Pay Monthly</span>
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Cancel Anytime</span>
                </button>

                <button
                  onClick={() => setTermInterval('termly')}
                  className={`py-3 px-3 text-center rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    termInterval === 'termly'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span>Termly (3 Months)</span>
                  <span className="block text-[10px] font-semibold text-amber-500 mt-0.5">5% Discount</span>
                </button>

                <button
                  onClick={() => setTermInterval('annual')}
                  className={`py-3 px-3 text-center rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    termInterval === 'annual'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span>Annual (3 Terms)</span>
                  <span className="block text-[10px] font-semibold text-emerald-400 mt-0.5">12% Savings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Quote Summary Card (5 Cols Sticky) */}
          <div className="lg:col-span-5 sticky top-28 bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Tuition Breakdown
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {currentStage.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                {selectedFormat === 'live' ? 'Interactive Live' : 'On-Demand'}
              </span>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Selected Subjects:</span>
                <span className="font-bold text-white">{selectedSubjectIds.length} Subjects</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Period:</span>
                <span className="font-bold text-white capitalize">{termInterval}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Tuition Rate:</span>
                <span className="line-through text-slate-500">
                  {currencySymbol}{quote.pricing.baseRate.toLocaleString()}
                </span>
              </div>

              {quote.pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-800/40">
                  <span>Applied Discounts:</span>
                  <span>- {currencySymbol}{quote.pricing.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Total Tuition Price Callout */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Net Tuition ({termInterval === 'monthly' ? 'per month' : termInterval === 'termly' ? 'per term' : 'per academic year'}):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {currencySymbol}{quote.pricing.finalTotal.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currency}
                </span>
              </div>
            </div>

            {/* Registration Fee Note */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>Admissions Registration Deposit:</span>
                <span>{currencySymbol}{quote.pricing.registrationFee.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                A one-time non-refundable deposit secures your child&apos;s place in a capped live cohort (10–12 learners) and initiates KYC onboarding.
              </p>
            </div>

            {/* Paystack CTA Button */}
            <button
              onClick={() => onProceedToAdmissions(quote)}
              className="w-full py-4 px-6 rounded-xl text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Application & Paystack Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Badges */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Paystack SSL Secured
              </span>
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Instant Receipt Issuance
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

