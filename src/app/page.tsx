'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  UserPlus, 
  UploadCloud, 
  CreditCard, 
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
  Compass,
  Layers,
  Heart,
  Smile,
  Menu,
  X,
  Activity,
  Shield
} from 'lucide-react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0a0a0f', color: '#fff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(130px)',
        opacity: 0.15,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, #e81cff 0%, transparent 70%)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        filter: 'blur(130px)',
        opacity: 0.12,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, #00f2fe 0%, transparent 70%)'
      }}></div>

      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(10, 10, 15, 0.7)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              flexShrink: 0
            }}>
              <Image 
                src="/logo.jpg" 
                alt="Tiptop Academy Logo" 
                fill 
                className="object-cover" 
              />
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #e81cff, #00f2fe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Tiptop Academy
            </span>
          </Link>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <a href="#workspaces" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: '0.2s' }} className="hover-white">Workspaces</a>
            <a href="#curriculum" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: '0.2s' }} className="hover-white">Curriculum</a>
            <a href="#intake" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: '0.2s' }} className="hover-white">Onboarding Funnel</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              Sign In
            </Link>
            <Link href="/signup" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, padding: '0.65rem 1.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #e81cff 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(232, 28, 255, 0.35)' }}>
              Enroll Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '6rem 1.5rem 4rem 1.5rem', position: 'relative', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(232, 28, 255, 0.1)', border: '1px solid rgba(232, 28, 255, 0.25)', padding: '0.5rem 1rem', borderRadius: '30px', marginBottom: '2rem' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#e81cff' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e81cff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Guided Intake & Admissions Onboarding is Live
            </span>
          </div>

          <h1 style={{ fontSize: '3.75rem', fontWeight: 900, lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
            A Modern Virtual Academy Built for{' '}
            <span style={{ background: 'linear-gradient(135deg, #e81cff, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Exceptional Futures
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
            Empowering students ages 3-17 through structural British National Curricula (EYFS & Key Stages 1-4). Seamlessly integrated with Google Workspace, live classrooms, and parent portals.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ color: '#fff', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, padding: '0.85rem 2.25rem', borderRadius: '8px', background: 'linear-gradient(135deg, #e81cff 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(232, 28, 255, 0.35)' }}>
              Get Started (Intake Funnel)
            </Link>
            <Link href="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, padding: '0.85rem 2.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}>
              Secure Client Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Workspaces Section */}
      <section id="workspaces" style={{ padding: '6rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
              One Unified Operational Platform
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              Four specialized client portals collaborating dynamically.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Activity style={{ width: '24px', height: '24px' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Executive Command</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: 0 }}>
                Proprietor dashboard monitoring live classes, curriculum coverage, monthly revenue NGN, conversion pipelines, and platform sync health.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <GraduationCap style={{ width: '24px', height: '24px' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Teacher Workspace</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: 0 }}>
                Operational timetable cockpit. 1-click Google Meet launch, 4-state attendance logs, curriculum objective review, and assignment graders.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Smile style={{ width: '24px', height: '24px' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Student Classroom</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: 0 }}>
                Age-adaptive student portal (junior/teen layouts). Direct Google Classroom homework submissions, progress bars, streaks, and gamified XP badges.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Shield style={{ width: '24px', height: '24px' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Parent Control Hub</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', margin: 0 }}>
                Manage children profiles, verify credit package statements, audit class booking receipts, and inspect real-time academic progress reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intake Funnel Process */}
      <section id="intake" style={{ padding: '6rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '3rem' }}>
            Structured Intake Funnel Pathway
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: '#e81cff', color: '#fff', fontWeight: 800, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>1</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700 }}>Parent Account Registration</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Create a secure controller profile using primary contact information.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: '#818cf8', color: '#fff', fontWeight: 800, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>2</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700 }}>Student Intake Details & Curricula</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Input your children profile details, select EYFS or KS1-4 levels, and upload school transcripts.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: '#00f2fe', color: '#fff', fontWeight: 800, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>3</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700 }}>Pricing Calculator & Payment</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Dynamic fee calculations with automatic sibling discounts and referral checkouts via Paystack.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: '#10b981', color: '#fff', fontWeight: 800, padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}>4</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700 }}>Google Workspace Provisioning</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Automated background sync creation of student logins, emails, and Classroom course enrollments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', background: '#07070a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>Tiptop Virtual Academy</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
            © {new Date().getFullYear()} Tiptop Virtual Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
