'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, User, Mail, Phone, Calendar, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { TuitionQuote, KeyStageId, DeliveryFormat, Currency } from '@/types';
import { KEY_STAGES } from '@/data/curriculum';

interface AdmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuote?: TuitionQuote | null;
}

export const AdmissionsModal: React.FC<AdmissionsModalProps> = ({
  isOpen,
  onClose,
  initialQuote
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentCountry, setParentCountry] = useState('Nigeria');

  const [studentName, setStudentName] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');

  const [selectedStageId, setSelectedStageId] = useState<KeyStageId>(
    initialQuote?.keyStageId || 'primary'
  );
  const [deliveryFormat, setDeliveryFormat] = useState<DeliveryFormat>(
    initialQuote?.format || 'live'
  );
  const [currency, setCurrency] = useState<Currency>(initialQuote?.currency || 'NGN');

  const [isProcessingPaystack, setIsProcessingPaystack] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  if (!isOpen) return null;

  const currentStage = KEY_STAGES.find((s) => s.id === selectedStageId) || KEY_STAGES[1];
  const depositAmount =
    initialQuote?.pricing.registrationFee || currentStage.pricing.registrationDeposit[currency];
  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'GBP' ? '£' : '$';

  const handleSimulatePaystackPayment = () => {
    setIsProcessingPaystack(true);

    // Simulate Paystack transaction resolution
    setTimeout(() => {
      const mockRef = `TVA_PSK_${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionRef(mockRef);
      setIsProcessingPaystack(false);
      setPaymentSuccess(true);
      setStep(4);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#0F172A] text-white px-6 sm:px-8 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block">
              Tiptop Virtual Academy Admissions
            </span>
            <h3 className="text-xl font-extrabold text-white">
              Student Application & Enrollment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        {!paymentSuccess && (
          <div className="px-6 sm:px-8 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className={step >= 1 ? 'text-amber-600 font-bold' : ''}>1. Parent / Guardian</span>
            <span className="text-slate-300">→</span>
            <span className={step >= 2 ? 'text-amber-600 font-bold' : ''}>2. Student Info</span>
            <span className="text-slate-300">→</span>
            <span className={step >= 3 ? 'text-amber-600 font-bold' : ''}>3. Paystack Deposit</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: Parent Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Step 1: Parent or Guardian Contact Details
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                We use these credentials to issue invoice receipts and grant access to the Parent Command Center.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Dr. Ngozi Adeyemi"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="ngozi@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp / Phone *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Country of Residence</label>
                <select
                  value={parentCountry}
                  onChange={(e) => setParentCountry(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States / Canada</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Other">Other Global Diaspora</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!parentName || !parentEmail}
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Continue to Student Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Student Information */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Step 2: Learner Details & Academic Target
              </h4>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. David Adeyemi"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={studentDob}
                    onChange={(e) => setStudentDob(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Enrolling Key Stage</label>
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value as KeyStageId)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-semibold"
                  >
                    {KEY_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.ageRange})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Previous School / Curriculum (Optional)</label>
                <input
                  type="text"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="e.g. Corona School Lagos / British International"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!studentName || !studentDob}
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Review & Pay Registration Deposit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Paystack Deposit */}
          {step === 3 && (
            <div className="space-y-5">
              <h4 className="text-base font-extrabold text-slate-900 mb-1">
                Step 3: Confirm Registration Deposit via Paystack
              </h4>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Key Stage:</span>
                  <span className="font-bold text-slate-900">{currentStage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Parent / Sponsor:</span>
                  <span className="font-bold text-slate-900">{parentName} ({parentEmail})</span>
                </div>
              </div>

              {/* Deposit Callout */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    One-Time Registration Deposit
                  </span>
                  <span className="text-2xl font-extrabold">
                    {currencySymbol}{depositAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Secures Cohort Placement</span>
                  <span className="block text-emerald-400 font-semibold">Max 10–12 Students / Cohort</span>
                </div>
              </div>

              {/* Paystack Payment Trigger */}
              <button
                type="button"
                disabled={isProcessingPaystack}
                onClick={handleSimulatePaystackPayment}
                className="w-full py-4 rounded-xl text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingPaystack ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Connecting to Paystack Secure Gateway...
                  </span>
                ) : (
                  <>
                    <span>Pay {currencySymbol}{depositAmount.toLocaleString()} with Paystack</span>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-bit Bank Grade Security
                </span>
                <span>Supports Debit Cards, Apple Pay & Bank Transfer</span>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Edit details
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Next Steps */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h4 className="text-2xl font-extrabold text-slate-900">
                Application Received & Confirmed!
              </h4>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{parentName}</strong>. We have registered <strong>{studentName}</strong> for <strong>{currentStage.name}</strong>.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-left max-w-sm mx-auto space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Paystack Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">Deposit Paid (Enrolled)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confirmation Sent:</span>
                  <span className="text-slate-800">{parentEmail}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Our academic registry team will send your Student Portal credentials and Google Classroom invite within 24 hours.
              </p>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

