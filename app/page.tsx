"use client";

import { useState, useEffect } from "react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { CurriculumService } from "../domains/curriculum/curriculum-service";
import { IdentityService, UserRole, MOCK_USERS, StudentProfile } from "../domains/shared/services/identity-service";
import type { EnrollmentRequest } from "../domains/admissions/admissions-service";
import type { Invoice } from "../domains/finance/finance-service";
import type { Session, AttendanceRecord } from "../domains/students/learning-service";
import { AssessmentService, Assignment, Submission } from "../domains/assessment/assessment-service";
import { IntegrationService, IntegrationLog } from "../domains/shared/services/integration-service";
import { OracleService, AIRole } from "../domains/academy-intelligence/oracle-service";
import { OpenDayBookingModal } from "../components/OpenDayBookingModal";
import { FeeCalculator } from "../components/FeeCalculator";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Navigation & Role State
  const [activeView, setActiveView] = useState<"landing" | "student" | "parent" | "teacher" | "executive">("landing");
  const [activeStudentMode, setActiveStudentMode] = useState<"junior" | "senior">("junior");

  // Admissions & UKVS State
  const [isOpenDayModalOpen, setIsOpenDayModalOpen] = useState(false);
  const [landingCurrency, setLandingCurrency] = useState<"NGN" | "GBP">("NGN");
  const [learningMode, setLearningMode] = useState<"full-time" | "homeschooling" | "modular">("full-time");
  const [studentName, setStudentName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [programKey, setProgramKey] = useState("primary");
  const [siblings, setSiblings] = useState(1);
  const [referral, setReferral] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  // Student Dashboard State
  const [wellbeingEmoji, setWellbeingEmoji] = useState("");
  const [activeStudentId, setActiveStudentId] = useState("10111111-1111-1111-1111-111111111111");
  const [studentSessions, setStudentSessions] = useState<Session[]>([]);

  // Parent State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Executive State
  const [syncLogs, setSyncLogs] = useState<IntegrationLog[]>([]);

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiRole, setAiRole] = useState<AIRole>("ADMISSIONS");
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string; escalated?: boolean }[]>([]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        const userRole = (user.publicMetadata?.role as string) || "student";
        if (["student", "parent", "teacher", "executive"].includes(userRole)) {
          setActiveView(userRole as any);
        } else {
          setActiveView("student");
        }
      } else {
        setActiveView("landing");
      }
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then(setInvoices)
      .catch((err) => console.error("Error loading invoices:", err));

    fetch("/api/learning/sessions")
      .then((res) => res.json())
      .then(setStudentSessions)
      .catch((err) => console.error("Error loading sessions:", err));

    setSyncLogs(IntegrationService.getLogs());
    
    // Set initial AI role based on active view
    updateAiRole(activeView);
  }, [activeView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const invoiceId = params.get("invoiceId");
      
      // Update UI invoices immediately
      fetch("/api/invoices")
        .then((res) => res.json())
        .then(setInvoices);

      // Trigger Integration sync outbox log
      IntegrationService.triggerSync("invoice.paid", { invoiceId });
      setSyncLogs(IntegrationService.getLogs());

      alert(`Payment Successful! Thank you. Invoice ${invoiceId} has been credited.`);
      
      // Remove query parameters from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const updateAiRole = (view: typeof activeView) => {
    switch(view) {
      case "landing": setAiRole("ADMISSIONS"); break;
      case "student": setAiRole("COMPANION"); break;
      case "parent": setAiRole("ADVISOR"); break;
      case "teacher": setAiRole("PARTNER"); break;
      case "executive": setAiRole("EXEC"); break;
    }
  };

  // Admissions Submission
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !birthDate) return;
    
    try {
      const enrollRes = await fetch("/api/admissions/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: "Sarah Smith",
          parentEmail: "parent.smith@gmail.com",
          studentName,
          studentBirthDate: birthDate,
          programKey,
          siblingCount: siblings,
          referralCode: referral
        })
      });
      const request = await enrollRes.json();

      // Create corresponding invoice in database
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: "Sarah Smith",
          studentName,
          amount: request.tuitionAmount
        })
      });

      const invRes = await fetch("/api/invoices");
      const updatedInvoices = await invRes.json();
      setInvoices(updatedInvoices);

      // Trigger Outbox Integration event
      const integrationLog = IntegrationService.triggerSync("student.enrolled", {
        studentName,
        programKey,
        tuitionAmount: request.tuitionAmount
      });
      setSyncLogs(IntegrationService.getLogs());

      setEnrollmentStatus(`Registration Successful! Invoice generated: N${request.tuitionAmount.toLocaleString()}`);
      setStudentName("");
      setBirthDate("");
    } catch (err) {
      console.error("Enrollment error:", err);
      setEnrollmentStatus("Registration failed. Please check connection.");
    }
  };

  // Invoice Payment Processing
  const handlePayInvoice = async (id: string) => {
    try {
      const payRes = await fetch("/api/checkout/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id, email: user?.primaryEmailAddress?.emailAddress || "parent.smith@gmail.com" })
      });
      const payData = await payRes.json();

      if (payData.authorizationUrl) {
        // Redirect to Paystack secure payment sandbox page
        window.location.href = payData.authorizationUrl;
      } else {
        alert(payData.error || "Paystack sandbox initialization failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment initialization error. Check console.");
    }
  };

  // AI Assistant Interaction
  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: chatPrompt }];
    setChatHistory(newHistory);
    const userQuery = chatPrompt;
    setChatPrompt("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: aiRole, prompt: userQuery })
      });

      const data = await response.json();
      setChatHistory([...newHistory, { role: "assistant", content: data.content, escalated: data.escalated }]);

      if (data.escalated) {
        // Trigger local visual alert logs sync
        IntegrationService.triggerSync("alert.safeguarding", { message: "AI escalated student prompt." });
        setSyncLogs(IntegrationService.getLogs());
      }
    } catch (err) {
      console.error("AI response fetch error:", err);
      setChatHistory([...newHistory, { role: "assistant", content: "Sorry, I had trouble communicating with the Oracle. Please check your network connection." }]);
    }
  };

  // Wellbeing Check-in Handler
  const handleWellbeingClick = async (emoji: string) => {
    setWellbeingEmoji(emoji);
    const activeSessionId = studentSessions.length > 0 
      ? studentSessions[0].id 
      : "20111111-1111-1111-1111-111111111111";

    try {
      await fetch("/api/learning/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          studentId: activeStudentId,
          status: "PRESENT"
        })
      });
    } catch (err) {
      console.error("Error logging attendance:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2c3e50] font-sans antialiased selection:bg-brand-gold selection:text-white pb-20">
      {/* Premium Gradient Top Arc (Open Book Motif) */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-brand-purple/15 via-brand-purple/5 to-transparent -z-10 book-curve-top"></div>

      {/* Floating Developer Switcher Controller (Glassmorphic) */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/80 backdrop-blur-lg border border-brand-purple/10 p-4 rounded-3xl shadow-premium flex flex-col gap-2 max-w-xs transition-all hover:scale-[1.02]">
        <span className="text-[10px] font-bold text-brand-purple/60 uppercase tracking-widest">Digital Sandbox Manager</span>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { setActiveView("landing"); }} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeView === "landing" ? "bg-brand-purple text-brand-gold shadow-md" : "bg-neutral-100/60 hover:bg-neutral-200/60"}`}>Landing</button>
          <button onClick={() => { setActiveView("student"); }} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeView === "student" ? "bg-brand-purple text-brand-gold shadow-md" : "bg-neutral-100/60 hover:bg-neutral-200/60"}`}>Student</button>
          <button onClick={() => { setActiveView("parent"); }} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeView === "parent" ? "bg-brand-purple text-brand-gold shadow-md" : "bg-neutral-100/60 hover:bg-neutral-200/60"}`}>Parent</button>
          <button onClick={() => { setActiveView("teacher"); }} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeView === "teacher" ? "bg-brand-purple text-brand-gold shadow-md" : "bg-neutral-100/60 hover:bg-neutral-200/60"}`}>Teacher</button>
          <button onClick={() => { setActiveView("executive"); }} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${activeView === "executive" ? "bg-brand-purple text-brand-gold shadow-md animate-pulse" : "bg-neutral-100/60 hover:bg-neutral-200/60"}`}>Executive</button>
        </div>
      </div>

      {/* Main Header navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-brand-purple/5 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center text-brand-gold font-bold text-xl shadow-lg shadow-brand-purple/20 transition-all hover:rotate-6">T</div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-brand-darkviolet leading-none tracking-tight">TIPTOP</h1>
            <span className="text-[9px] uppercase font-bold text-brand-gold tracking-[0.25em]">Virtual Academy</span>
          </div>
        </div>

        {/* Public Navigation Links */}
        {activeView === "landing" && (
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-neutral-600">
            <a href="#curriculum" className="hover:text-brand-purple transition-all">Key Stages</a>
            <a href="#pathways" className="hover:text-brand-purple transition-all">Flexible Pathways</a>
            <a href="#calculator" className="hover:text-brand-purple transition-all">Fee Calculator</a>
            <a href="#diaspora" className="hover:text-brand-purple transition-all">Diaspora & WA</a>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Virtual Open Day Quick Button */}
          {activeView === "landing" && (
            <button 
              onClick={() => setIsOpenDayModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold bg-brand-gold text-brand-darkviolet rounded-xl hover:bg-brand-gold/90 shadow-md transition-all animate-pulse"
            >
              📅 Book Open Day
            </button>
          )}

          <span className="text-[10px] bg-brand-purple/5 text-brand-purple border border-brand-purple/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
            {activeView} Portal
          </span>

          {/* Clerk Auth Integration */}
          {isLoaded && (
            <>
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-slate font-medium hidden md:inline">Hello, {user.firstName || "Scholar"}</span>
                  <UserButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="px-3 py-1.5 text-xs font-bold text-brand-purple hover:text-brand-purple/80 transition-all">Sign In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-3.5 py-1.5 text-xs font-bold bg-brand-purple text-brand-gold rounded-xl hover:bg-brand-purple/90 shadow-md transition-all">Register</button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}

          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-10 h-10 bg-brand-purple hover:bg-brand-purple/90 text-brand-gold rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 text-lg"
            title="Open AI Companion"
          >
            🤖
          </button>
        </div>
      </header>

      {/* Viewport Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* PUBLIC LANDING VIEW */}
        {activeView === "landing" && (
          <div className="space-y-20 animate-fadeIn">
            {/* Hero Section */}
            <section className="text-center py-12 space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-brand-purple/5 text-brand-purple border border-brand-purple/10 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide">
                <span>🇳🇬 West Africa & Global Diaspora Portal</span>
                <span className="text-neutral-300">•</span>
                <span className="text-brand-gold font-black">British Curriculum Accredited</span>
              </div>
              
              <h2 className="font-display text-5xl md:text-7xl font-black text-brand-darkviolet tracking-tight leading-[1.1]">
                World-Class Online Schooling, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-[#8a2be2] to-brand-gold">Built for African Excellence.</span>
              </h2>
              
              <p className="text-base md:text-lg text-neutral-slate max-w-2xl mx-auto leading-relaxed font-normal">
                Structured live online classes, flexible homeschooling backlogs, and Cambridge/Pearson IGCSE preparation—engineered for families across Nigeria, the UK, and North America.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setIsOpenDayModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-brand-purple to-[#8a2be2] text-brand-gold rounded-2xl font-extrabold text-sm shadow-xl shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>📅 Book Virtual Open Day</span>
                  <span className="text-xs">➔</span>
                </button>
                <a
                  href="#calculator"
                  className="px-6 py-3.5 bg-white text-brand-purple border border-brand-purple/20 rounded-2xl font-bold text-sm shadow-sm hover:bg-neutral-50 transition-all"
                >
                  🧮 Estimate Tuition Fees
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-neutral-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
                <div className="bg-white/60 p-3 rounded-2xl border border-neutral-100">
                  <span className="text-xs font-extrabold text-brand-purple block">Pearson / Cambridge</span>
                  <span className="text-[10px] text-neutral-500">IGCSE Pathway</span>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-neutral-100">
                  <span className="text-xs font-extrabold text-brand-purple block">Dual Timezones</span>
                  <span className="text-[10px] text-neutral-500">WAT & GMT Sync</span>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-neutral-100">
                  <span className="text-xs font-extrabold text-brand-purple block">Dual Currency</span>
                  <span className="text-[10px] text-neutral-500">NGN (₦) & GBP (£)</span>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-neutral-100">
                  <span className="text-xs font-extrabold text-brand-purple block">Live + Offline</span>
                  <span className="text-[10px] text-neutral-500">Bandwidth Optimized</span>
                </div>
              </div>
            </section>

            {/* Flexible Learning Pathways Section */}
            <section id="pathways" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[10px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Tailored Academic Pathways</span>
                <h3 className="font-display text-3xl font-extrabold text-brand-darkviolet tracking-tight">Three Ways to Learn with TVA</h3>
                <p className="text-xs text-neutral-slate">Whether your child needs a full-time school, flexible homeschooling, or extra subject mastery.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-4 hover:border-brand-purple/20 transition-all">
                  <div className="w-12 h-12 bg-brand-purple/10 text-brand-purple rounded-2xl flex items-center justify-center text-2xl font-bold">🏫</div>
                  <h4 className="font-display text-xl font-bold text-brand-darkviolet">Full-Time Virtual School</h4>
                  <p className="text-xs text-neutral-slate leading-relaxed">Daily structured live classes, real-time teacher feedback, assembly, form period, and full report cards.</p>
                  <span className="inline-block text-[10px] font-bold text-brand-purple bg-brand-purple/5 px-2.5 py-1 rounded-lg">Primary & Secondary</span>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-brand-gold/30 shadow-premium space-y-4 hover:border-brand-gold transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-brand-gold text-white text-[9px] font-bold px-3 py-1 uppercase rounded-bl-xl">Popular</div>
                  <div className="w-12 h-12 bg-brand-gold/10 text-brand-darkviolet rounded-2xl flex items-center justify-center text-2xl font-bold">🏡</div>
                  <h4 className="font-display text-xl font-bold text-brand-darkviolet">Flexible Homeschooling</h4>
                  <p className="text-xs text-neutral-slate leading-relaxed">Asynchronous video lesson library, self-paced assignment milestones, and tutor drop-in office hours.</p>
                  <span className="inline-block text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-lg">Self-Paced & Asynchronous</span>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-4 hover:border-brand-purple/20 transition-all">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-2xl font-bold">🧪</div>
                  <h4 className="font-display text-xl font-bold text-brand-darkviolet">Modular Subject Master</h4>
                  <p className="text-xs text-neutral-slate leading-relaxed">Enroll in individual target subjects (e.g., Mathematics, Coding, Science) for IGCSE exam mastery.</p>
                  <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">Single Subject Add-On</span>
                </div>
              </div>
            </section>

            {/* Programs and Key Stages Section */}
            <section id="curriculum" className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] bg-brand-purple/5 text-brand-purple px-3 py-1 rounded-full font-bold uppercase tracking-wider">National Curriculum for England</span>
                  <h3 className="font-display text-3xl font-extrabold text-brand-darkviolet tracking-tight mt-1">Curriculum Key Stages</h3>
                </div>
                
                {/* Landing Currency Toggle */}
                <div className="flex items-center gap-1 bg-white border border-neutral-200 p-1 rounded-xl shadow-sm self-start">
                  <span className="text-[10px] font-bold text-neutral-400 px-2 uppercase">Display Fee:</span>
                  <button 
                    onClick={() => setLandingCurrency("NGN")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${landingCurrency === "NGN" ? "bg-brand-purple text-brand-gold" : "text-neutral-600 hover:text-brand-purple"}`}
                  >
                    ₦ NGN
                  </button>
                  <button 
                    onClick={() => setLandingCurrency("GBP")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${landingCurrency === "GBP" ? "bg-brand-purple text-brand-gold" : "text-neutral-600 hover:text-brand-purple"}`}
                  >
                    £ GBP
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* EYFS */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-5 hover:scale-[1.02] hover:shadow-xl transition-all page-stack">
                  <span className="text-[10px] bg-brand-purple/5 text-brand-purple px-3 py-1 rounded-full font-bold uppercase tracking-wider">Ages 3-5</span>
                  <h4 className="font-display text-xl font-extrabold text-brand-darkviolet">Early Years Foundation (EYFS)</h4>
                  <p className="text-sm text-neutral-slate leading-relaxed">Play-centric sensory development, early literacy steps, and active social coordination.</p>
                  <div className="pt-4 border-t border-brand-purple/5 flex items-baseline justify-between">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Tuition per term</span>
                    <span className="text-xl font-black text-brand-purple">
                      {landingCurrency === "NGN" ? "₦600,000" : "£300"}
                    </span>
                  </div>
                </div>
                {/* Primary */}
                <div className="bg-white p-8 rounded-3xl border border-brand-gold/20 shadow-premium space-y-5 hover:scale-[1.02] hover:shadow-xl transition-all page-stack relative overflow-hidden ring-4 ring-brand-purple/5">
                  <div className="absolute top-0 right-0 bg-brand-gold text-white text-[9px] font-bold px-3 py-1.5 uppercase rounded-bl-xl tracking-widest">Flagship</div>
                  <span className="text-[10px] bg-brand-purple/5 text-brand-purple px-3 py-1 rounded-full font-bold uppercase tracking-wider">Ages 5-11</span>
                  <h4 className="font-display text-xl font-extrabold text-brand-darkviolet">Primary Years (KS1-2)</h4>
                  <p className="text-sm text-neutral-slate leading-relaxed">Critical literacy, core mathematics, computing, and inquiry-led scientific modules.</p>
                  <div className="pt-4 border-t border-brand-purple/5 flex items-baseline justify-between">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Tuition per term</span>
                    <span className="text-xl font-black text-brand-purple">
                      {landingCurrency === "NGN" ? "₦750,000" : "£375"}
                    </span>
                  </div>
                </div>
                {/* Secondary */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-5 hover:scale-[1.02] hover:shadow-xl transition-all page-stack">
                  <span className="text-[10px] bg-brand-purple/5 text-brand-purple px-3 py-1 rounded-full font-bold uppercase tracking-wider">Ages 11-16</span>
                  <h4 className="font-display text-xl font-extrabold text-brand-darkviolet">Secondary (KS3-4 / IGCSE)</h4>
                  <p className="text-sm text-neutral-slate leading-relaxed">Advanced academic subject specialization preparing students for Cambridge international exams.</p>
                  <div className="pt-4 border-t border-brand-purple/5 flex items-baseline justify-between">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Tuition per term</span>
                    <span className="text-xl font-black text-brand-purple">
                      {landingCurrency === "NGN" ? "₦900,000" : "£450"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Fee Calculator */}
            <section id="calculator">
              <FeeCalculator />
            </section>

            {/* Diaspora & West African Support Banner */}
            <section id="diaspora" className="bg-gradient-to-r from-brand-darkviolet to-brand-purple text-white p-8 md:p-12 rounded-3xl shadow-xl space-y-6">
              <div className="max-w-2xl space-y-3">
                <span className="text-[10px] bg-brand-gold text-brand-darkviolet font-bold px-3 py-1 rounded-full uppercase tracking-wider">Cross-Border & Diaspora Ready</span>
                <h3 className="font-display text-3xl font-extrabold text-brand-gold">Built for Nigerian & Diaspora Families</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Whether living in Lagos, Abuja, London, or Toronto, TVA provides seamless multi-currency tuition billing, dual-timezone live class schedules, and WhatsApp parent notification digests.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm space-y-1">
                  <span className="font-bold text-brand-gold block">💳 Dual Checkout</span>
                  <span className="text-white/70">Paystack for NGN & Stripe for International GBP/USD cards.</span>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm space-y-1">
                  <span className="font-bold text-brand-gold block">📱 Parent WhatsApp Digest</span>
                  <span className="text-white/70">Instant attendance alerts and weekly progress summaries.</span>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm space-y-1">
                  <span className="font-bold text-brand-gold block">🌍 Flexible Timezones</span>
                  <span className="text-white/70">Live lessons in WAT with recorded archives for Diaspora zones.</span>
                </div>
              </div>
            </section>

            {/* Guided Enrollment Form (Premium Glass Panel) */}
            <section className="glass-panel p-8 md:p-10 rounded-3xl max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full font-bold uppercase tracking-wider">Online Application</span>
                <h3 className="font-display text-2xl font-extrabold text-brand-darkviolet tracking-tight">Guided Registration Intake</h3>
              </div>
              {enrollmentStatus && (
                <div className="bg-green-50 text-green-700 text-xs p-4 rounded-2xl border border-green-200 font-semibold shadow-sm">
                  🎉 {enrollmentStatus}
                </div>
              )}
              <form onSubmit={handleEnrollSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Student Full Name</label>
                  <input 
                    type="text" 
                    value={studentName} 
                    onChange={(e) => setStudentName(e.target.value)} 
                    className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all" 
                    placeholder="Enter child's full name" 
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Date of Birth</label>
                    <input 
                      type="date" 
                      value={birthDate} 
                      onChange={(e) => setBirthDate(e.target.value)} 
                      className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Academic Stage</label>
                    <select 
                      value={programKey} 
                      onChange={(e) => setProgramKey(e.target.value)}
                      className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all"
                    >
                      <option value="eyfs">Early Years (EYFS)</option>
                      <option value="primary">Primary Years (KS1-2)</option>
                      <option value="secondary">Secondary (KS3-4)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Learning Pathway</label>
                    <select 
                      value={learningMode} 
                      onChange={(e) => setLearningMode(e.target.value as any)}
                      className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all"
                    >
                      <option value="full-time">Full-Time Virtual</option>
                      <option value="homeschooling">Flexible Homeschool</option>
                      <option value="modular">Modular Subject</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Payment Currency</label>
                    <select 
                      value={landingCurrency} 
                      onChange={(e) => setLandingCurrency(e.target.value as any)}
                      className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all"
                    >
                      <option value="NGN">Naira (NGN ₦)</option>
                      <option value="GBP">Pounds (GBP £)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Sibling Enrollees</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={siblings} 
                      onChange={(e) => setSiblings(parseInt(e.target.value))} 
                      className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-darkviolet/60 uppercase tracking-widest mb-1.5">Referral Tag</label>
                    <input 
                      type="text" 
                      value={referral} 
                      onChange={(e) => setReferral(e.target.value)} 
                      className="w-full bg-white/90 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5 text-sm transition-all" 
                      placeholder="e.g. REF-109"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple/90 text-brand-gold py-3.5 rounded-xl font-bold shadow-lg shadow-brand-purple/20 transition-all hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wider text-xs">
                  Calculate Tuition and Register
                </button>
              </form>
            </section>
          </div>
        )}

        {/* STUDENT PORTLET VIEW */}
        {activeView === "student" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Age selector toggle */}
            <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm">
              <h3 className="font-display font-bold text-brand-darkviolet">Student Academy Home</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveStudentMode("junior")} 
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${activeStudentMode === "junior" ? "bg-brand-gold text-white border-transparent shadow-sm" : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600"}`}
                >
                  Playful Mode (Ages 3-6)
                </button>
                <button 
                  onClick={() => setActiveStudentMode("senior")} 
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${activeStudentMode === "senior" ? "bg-brand-purple text-brand-gold border-transparent shadow-sm" : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600"}`}
                >
                  Standard Mode (Ages 7-12)
                </button>
              </div>
            </div>

            {/* Dashboard grids */}
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Left Column: Calendar & Today's sessions */}
              <div className="md:col-span-2 space-y-8">
                <div className={`p-8 rounded-3xl border shadow-premium space-y-5 transition-all duration-300 ${activeStudentMode === "junior" ? "bg-amber-50/40 border-brand-gold/30" : "bg-white border-neutral-100"}`}>
                  <h4 className={`font-display text-xl font-black ${activeStudentMode === "junior" ? "text-amber-800" : "text-brand-darkviolet"}`}>Today's Interactive Classes</h4>
                  <div className="space-y-4">
                    {studentSessions.map((ses) => (
                      <div key={ses.id} className="bg-white border border-neutral-100 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                        <div>
                          <h5 className="font-display font-extrabold text-sm text-brand-darkviolet">{ses.title}</h5>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">Starts: {new Date(ses.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <a href={ses.meetUrl} target="_blank" rel="noopener noreferrer" className="bg-brand-purple hover:bg-brand-purple/90 text-brand-gold px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105">
                          Join Live Meet
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Socratic learning progression helper box */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-4">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">My Core Learning Progression</h4>
                  <div className="bg-brand-purple/5 border border-brand-purple/10 p-5 rounded-2xl space-y-2">
                    <span className="text-[9px] font-bold text-brand-purple uppercase tracking-widest block">Mathematics - Year 5 Progress Node</span>
                    <p className="text-sm text-brand-darkviolet"><strong>Active Concept:</strong> Equivalent fractions & adding denominators.</p>
                    <p className="text-xs text-neutral-slate"><strong>Next Step Milestone:</strong> Multiply and divide simple fractions; simplify expressions.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Wellbeing and Badges */}
              <div className="space-y-8">
                {/* Wellbeing check */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-premium space-y-4">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">Wellbeing Check-in</h4>
                  <p className="text-xs text-neutral-slate leading-relaxed">How does learning make you feel today?</p>
                  <div className="flex justify-around text-4xl py-2">
                    {["😊", "🌟", "😐", "😢", "😰"].map((emoji) => (
                      <button 
                        key={emoji}
                        onClick={() => handleWellbeingClick(emoji)}
                        className={`hover:scale-135 active:scale-95 transition-all p-2 rounded-xl ${wellbeingEmoji === emoji ? "bg-brand-gold/15 shadow-sm" : ""}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {wellbeingEmoji && (
                    <div className="text-xs text-center text-amber-800 bg-amber-50/50 border border-brand-gold/10 py-2 rounded-xl">
                      Wellbeing check logged: {wellbeingEmoji}! Feed dispatched to tutor log.
                    </div>
                  )}
                </div>

                {/* Badge cabinets */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-premium space-y-4">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">Achievement Badges</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-brand-purple/5 border border-brand-purple/5 rounded-2xl flex flex-col items-center hover:scale-105 transition-all">
                      <span className="text-3xl">🥇</span>
                      <span className="text-[9px] font-bold text-brand-darkviolet/70 mt-2 leading-tight">Attendance Hero</span>
                    </div>
                    <div className="p-3 bg-brand-purple/5 border border-brand-purple/5 rounded-2xl flex flex-col items-center hover:scale-105 transition-all">
                      <span className="text-3xl">📚</span>
                      <span className="text-[9px] font-bold text-brand-darkviolet/70 mt-2 leading-tight">Book Worm</span>
                    </div>
                    <div className="p-3 bg-brand-purple/5 border border-brand-purple/5 rounded-2xl flex flex-col items-center hover:scale-105 transition-all">
                      <span className="text-3xl">💡</span>
                      <span className="text-[9px] font-bold text-brand-darkviolet/70 mt-2 leading-tight">Solution Finder</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PARENT VIEW */}
        {activeView === "parent" && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="font-display text-2xl font-bold text-brand-darkviolet">Parent Portal Dashboard</h3>
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Children Status */}
              <div className="md:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-5">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">Active Student Profiles</h4>
                  <div className="space-y-4">
                    <div className="border border-neutral-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all">
                      <div>
                        <h5 className="font-display font-extrabold text-sm text-brand-darkviolet">Alice Smith</h5>
                        <span className="text-xs text-neutral-slate">Primary Year 3 • Attendance Tracker: 98%</span>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold">Standard Met</span>
                    </div>
                    <div className="border border-neutral-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all">
                      <div>
                        <h5 className="font-display font-extrabold text-sm text-brand-darkviolet">James Smith</h5>
                        <span className="text-xs text-neutral-slate">Primary Year 5 • Attendance Tracker: 96%</span>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold">Standard Met</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Ledgers & Stripe trigger */}
              <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-5 page-stack">
                <h4 className="font-display text-lg font-bold text-brand-darkviolet">Tuition Accounts Ledger</h4>
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="border border-neutral-100 p-5 rounded-2xl space-y-3 bg-[#faf9f6]/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-display font-bold text-sm text-brand-darkviolet">{inv.studentName}</h5>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">Ref: {inv.id}</span>
                        </div>
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-extrabold tracking-wider ${inv.status === "PAID" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-brand-gold/20"}`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-brand-purple/5">
                        <span className="text-sm font-extrabold text-brand-purple">N{inv.amount.toLocaleString()}</span>
                        {inv.status === "UNPAID" && (
                          <button onClick={() => handlePayInvoice(inv.id)} className="bg-brand-purple hover:bg-brand-purple/90 text-brand-gold text-[10px] font-bold px-4 py-2 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95">
                            Authorize Payment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TEACHER WORKSPACE VIEW */}
        {activeView === "teacher" && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="font-display text-2xl font-bold text-brand-darkviolet">Teacher Professional Workspace</h3>
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Schedules & class loader */}
              <div className="md:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-5">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">Active Session Schedule</h4>
                  <div className="space-y-4">
                    <div className="border border-neutral-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all bg-[#faf9f6]/30">
                      <div>
                        <h5 className="font-display font-extrabold text-sm text-brand-darkviolet">Primary Year 5 Mathematics</h5>
                        <span className="text-xs text-neutral-slate">Friday Agenda • 09:00 - 10:00 UTC</span>
                      </div>
                      <button className="bg-white hover:bg-neutral-50 text-xs font-bold px-4 py-2 rounded-xl border border-neutral-200 shadow-sm transition-all">
                        Manage Lesson
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Calculator & Wellbeing Alerts */}
              <div className="space-y-8">
                {/* Earnings */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-4 page-stack">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">Tutor Revenue Ledger</h4>
                  <p className="text-xs text-neutral-slate leading-relaxed">Calculate projected termly earnings based on active student tuition counts.</p>
                  <div className="space-y-2 pt-2 border-t border-brand-purple/5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Rate (1-on-1 monthly):</span>
                      <span className="text-brand-purple">N70,000</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Active Class Cohorts:</span>
                      <span className="text-brand-purple">2 classes</span>
                    </div>
                  </div>
                </div>

                {/* Safeguarding alerts feed */}
                <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-4">
                  <h4 className="font-display text-lg font-bold text-brand-darkviolet">Live Wellbeing alerts</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs leading-relaxed">
                      <strong>Safeguarding Alert:</strong> Student profile (std-1) flagged safe-search boundary trigger. Pastoral action logged.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* EXECUTIVE VIEW */}
        {activeView === "executive" && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="font-display text-2xl font-bold text-brand-darkviolet">Executive Leadership Command</h3>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-premium">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-widest">Total Attendance</span>
                <span className="text-3xl font-black text-brand-purple mt-1 block">97.4%</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-premium">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-widest">Syllabus Coverage</span>
                <span className="text-3xl font-black text-brand-purple mt-1 block">92.1%</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-premium">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-widest">Mastery Index</span>
                <span className="text-3xl font-black text-brand-purple mt-1 block">84.8%</span>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-premium">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-widest">Active Cohort Count</span>
                <span className="text-3xl font-black text-brand-purple mt-1 block">341</span>
              </div>
            </div>

            {/* Google Sync Live Console logs */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-premium space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-display text-lg font-bold text-brand-darkviolet">Google Workspace Sync Pipeline Logs</h4>
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              </div>
              <div className="bg-brand-darkviolet font-mono text-[10px] text-green-400 p-5 rounded-2xl h-48 overflow-y-auto space-y-2 border border-brand-purple/20 shadow-inner">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex gap-2 leading-relaxed">
                    <span className="text-white/40">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`font-bold ${log.status === "SUCCESS" ? "text-green-300" : "text-amber-300"}`}>
                      {log.eventType.toUpperCase()}
                    </span>
                    <span className="text-white/80">- {log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* AI Assistant Chat Drawer Overlay (Glassmorphism Modal) */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-96 bg-white/95 backdrop-blur-md rounded-3xl border border-brand-purple/10 shadow-2xl flex flex-col h-[500px] overflow-hidden animate-slideUp">
          <header className="bg-brand-purple text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <h4 className="font-display font-extrabold text-sm text-brand-gold">Academy Oracle</h4>
                <span className="text-[9px] uppercase tracking-wider text-brand-gold/60 font-bold">Role: {aiRole}</span>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white font-bold transition-all text-sm">✕</button>
          </header>

          {/* Chat message display */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#faf9f6]/40">
            {chatHistory.length === 0 && (
              <div className="text-center text-xs text-neutral-400 mt-20 space-y-3">
                <span className="text-2xl block">💬</span>
                <span className="font-bold text-brand-darkviolet/60">Ask the AI Oracle anything.</span>
                <p className="px-6 text-[10px] text-neutral-slate leading-relaxed">
                  Companion details fractions; Advisor explains invoices; Partner builds plans; Exec handles metrics data.
                </p>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-brand-purple text-white rounded-br-none shadow-md" 
                    : msg.escalated 
                      ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-none font-semibold shadow-sm"
                      : "bg-white border border-neutral-100 text-[#2c3e50] rounded-bl-none shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleAiChatSubmit} className="p-3 bg-white border-t border-brand-purple/5 flex gap-2">
            <input 
              type="text" 
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              className="flex-1 bg-[#faf9f6] border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/5"
              placeholder="Ask the Oracle..."
              required
            />
            <button type="submit" className="bg-brand-purple text-brand-gold px-4 rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition-all active:scale-95">
              Send
            </button>
          </form>
        </div>
      )}

      {/* Open Day Booking Modal */}
      <OpenDayBookingModal 
        isOpen={isOpenDayModalOpen} 
        onClose={() => setIsOpenDayModalOpen(false)} 
      />
    </div>
  );
}
