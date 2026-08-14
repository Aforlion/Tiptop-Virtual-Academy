"use client";

import { useState } from "react";
import { AdmissionsService } from "../domains/admissions/admissions-service";

interface OpenDayBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenDayBookingModal({ isOpen, onClose }: OpenDayBookingModalProps) {
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [keyStage, setKeyStage] = useState("Primary (KS1-2)");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !parentEmail || !preferredDate) return;

    const booking = await AdmissionsService.bookOpenDay(
      parentName,
      parentEmail,
      phone,
      preferredDate,
      keyStage,
      notes
    );

    setBookingId(booking.id);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-2xl border border-brand-purple/10 space-y-6 relative overflow-hidden">
        {/* Header background accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-purple via-brand-gold to-[#8a2be2]"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Tiptop Virtual Academy Logo" className="w-12 h-12 object-contain rounded-xl shadow-sm border border-neutral-100" />
            <div>
              <span className="text-[10px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider block w-fit">Admissions Consultation</span>
              <h3 className="font-display text-xl font-extrabold text-brand-darkviolet mt-0.5">Book a Live Class Tour</h3>
              <span className="text-[9px] italic text-neutral-400 font-medium">Tiptop mind Tiptop future.</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center font-bold text-base transition-all"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto font-bold shadow-md">
              ✓
            </div>
            <h4 className="font-display text-xl font-bold text-brand-darkviolet">Open Day Reserved!</h4>
            <p className="text-sm text-neutral-slate max-w-xs mx-auto leading-relaxed">
              Thank you, <strong className="text-brand-purple">{parentName}</strong>. Your confirmation and Zoom link have been sent to <strong className="text-brand-purple">{parentEmail}</strong>.
            </p>
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60 text-xs text-neutral-500 font-mono">
              Booking Ref: {bookingId} • Date: {preferredDate}
            </div>
            <button
              onClick={() => { setSubmitted(false); onClose(); }}
              className="w-full py-3 bg-brand-purple text-brand-gold rounded-xl font-bold text-sm hover:bg-brand-purple/90 shadow-md transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1">Parent / Guardian Name *</label>
              <input 
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Mrs. Funke Adeyemi"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1">Email Address *</label>
                <input 
                  type="email"
                  required
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1">WhatsApp / Phone</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1">Preferred Date *</label>
                <input 
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1">Target Key Stage</label>
                <select 
                  value={keyStage}
                  onChange={(e) => setKeyStage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all bg-white"
                >
                  <option value="EYFS (Ages 3-5)">EYFS (Ages 3-5)</option>
                  <option value="Primary (KS1-2)">Primary (KS1-2)</option>
                  <option value="Secondary (KS3)">Secondary (KS3)</option>
                  <option value="IGCSE / KS4">IGCSE / KS4</option>
                  <option value="Homeschooling Support">Homeschooling Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-darkviolet uppercase tracking-wider mb-1">Questions / Specific Needs</label>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about your child's interests or timezone (e.g. WAT, GMT, EST)..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-[#8a2be2] text-brand-gold rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.99]"
            >
              Confirm Virtual Open Day Reservation ➔
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
