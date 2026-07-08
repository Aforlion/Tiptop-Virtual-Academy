'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Activity, 
  Brain, 
  Sparkles, 
  Heart,
  Award,
  Layers
} from 'lucide-react';
import { EYFS_NURSERY_PLAN, EYFS_RECEPTION_PLAN, EYFSWeekPlan } from '@/lib/curriculum-data';

export default function CurriculumPage() {
  const [selectedPlan, setSelectedPlan] = useState<'nursery' | 'reception'>('nursery');
  const [selectedTerm, setSelectedTerm] = useState<'Autumn' | 'Spring' | 'Summer'>('Autumn');

  const currentPlanList = selectedPlan === 'nursery' ? EYFS_NURSERY_PLAN : EYFS_RECEPTION_PLAN;
  const filteredWeeks = currentPlanList.filter(wp => wp.term === selectedTerm);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'hsl(var(--bg-primary))', minHeight: '100vh' }}>
      
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(130px)',
        opacity: 0.1,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, hsl(var(--accent-purple)) 0%, transparent 70%)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(130px)',
        opacity: 0.08,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, hsl(var(--accent-pink)) 0%, transparent 70%)'
      }}></div>

      {/* Header */}
      <header style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)'
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
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
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, hsl(var(--accent-purple)), hsl(var(--accent-pink)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }} className="brand-text-desktop">
              Tiptop Academy
            </span>
          </Link>
          
          <Link href="/" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        
        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.02)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
            color: 'hsl(var(--accent-purple))'
          }}>
            <BookOpen style={{ width: '14px', height: '14px' }} />
            <span>ACADEMIC BLUEPRINTS</span>
          </div>
          
          <h1 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem', lineHeight: '1.2' }}>
            EYFS Long Term Curriculum Map
          </h1>
          <p style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Explore our term-by-term and week-by-week curriculum maps designed under the British Early Years Foundation Stage (EYFS) Development Matters framework.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Plan Selector */}
          <div style={{
            display: 'inline-flex',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <button 
              onClick={() => setSelectedPlan('nursery')}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: 'calc(var(--radius-lg) - 4px)',
                border: 'none',
                cursor: 'pointer',
                background: selectedPlan === 'nursery' ? 'hsl(var(--accent-purple))' : 'transparent',
                color: selectedPlan === 'nursery' ? '#fff' : 'hsl(var(--text-secondary))',
                transition: 'var(--transition-fast)'
              }}
            >
              Nursery (Ages 3-4 Years)
            </button>
            <button 
              onClick={() => setSelectedPlan('reception')}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: 'calc(var(--radius-lg) - 4px)',
                border: 'none',
                cursor: 'pointer',
                background: selectedPlan === 'reception' ? 'hsl(var(--accent-purple))' : 'transparent',
                color: selectedPlan === 'reception' ? '#fff' : 'hsl(var(--text-secondary))',
                transition: 'var(--transition-fast)'
              }}
            >
              Reception (Ages 4-5 Years)
            </button>
          </div>

          {/* Term Selector */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {(['Autumn', 'Spring', 'Summer'] as const).map(term => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: selectedTerm === term ? 'hsl(var(--accent-pink))' : 'var(--glass-border)',
                  background: selectedTerm === term ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                  color: selectedTerm === term ? 'hsl(var(--accent-pink))' : 'hsl(var(--text-secondary))',
                  transition: 'var(--transition-fast)'
                }}
              >
                {term} Term
              </button>
            ))}
          </div>
        </div>

        {/* Weeks Matrix */}
        {filteredWeeks.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            No curriculum entries mapped for {selectedTerm} Term yet. Keep checking back for updates!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {filteredWeeks.map((week) => (
              <div key={week.week} className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid hsl(var(--accent-purple))' }}>
                
                {/* Week Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  paddingBottom: '1rem',
                  marginBottom: '1.5rem'
                }} className="flex-between">
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--accent-pink))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Week {week.week}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginTop: '0.25rem' }}>
                      Theme: {week.theme}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'hsl(var(--text-secondary))',
                    fontWeight: 500
                  }}>
                    {week.term} Term
                  </span>
                </div>

                {/* Grid of Learning Areas */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem'
                }}>
                  {/* Comm & Language */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-purple))', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Communication & Language
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.communication_language}
                    </p>
                  </div>

                  {/* PSED */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-pink))', marginBottom: '0.5rem' }}>
                      Personal, Social & Emotional (PSED)
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.psed}
                    </p>
                  </div>

                  {/* Physical Dev */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-indigo))', marginBottom: '0.5rem' }}>
                      Physical Development
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.physical_development}
                    </p>
                  </div>

                  {/* Literacy */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-cyan))', marginBottom: '0.5rem' }}>
                      Literacy
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.literacy}
                    </p>
                  </div>

                  {/* Math */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--accent-green))', marginBottom: '0.5rem' }}>
                      Mathematics
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.mathematics}
                    </p>
                  </div>

                  {/* World */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>
                      Understanding the World
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.understanding_the_world}
                    </p>
                  </div>

                  {/* Expressive Arts & Design */}
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', gridColumn: 'span 1' }} className="md:col-span-2">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem' }}>
                      Expressive Arts & Design (EAD)
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      {week.expressive_arts_design}
                    </p>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        background: 'hsl(var(--bg-secondary))',
        borderTop: '1px solid var(--glass-border)',
        padding: '3rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          justifyContent: 'between'
        }} className="flex-between md:flex-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)'
            }}>
              <Image 
                src="/logo.jpg" 
                alt="Tiptop Academy Logo" 
                fill 
                className="object-cover" 
              />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              Tiptop Academy
            </span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>
            © {new Date().getFullYear()} Tiptop Virtual Academy. All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
            <Link href="/" className="hover-white">Home</Link>
            <a href="#" className="hover-white">Privacy Policy</a>
            <a href="#" className="hover-white">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
