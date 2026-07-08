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
  Sparkle,
  Heart,
  Smile,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'early' | 'primary'>('early');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const registrationSteps = [
    {
      icon: <UserPlus style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-purple))' }} />,
      title: "1. Create Account",
      desc: "Register securely on our platform with basic parental contact details."
    },
    {
      icon: <Users style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-pink))' }} />,
      title: "2. Student Info",
      desc: "Provide details about your child, including name, age, and grade level."
    },
    {
      icon: <BookOpen style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-indigo))' }} />,
      title: "3. Choose Program",
      desc: "Select the curriculum tier that matches your child's developmental age."
    },
    {
      icon: <UploadCloud style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-cyan))' }} />,
      title: "4. Upload Records",
      desc: "Upload required identity verification documents and past school transcripts."
    },
    {
      icon: <CreditCard style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-green))' }} />,
      title: "5. Complete Setup",
      desc: "Verify payment details and choose a flexible subscription that fits your schedule."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'hsl(var(--bg-primary))', minHeight: '100vh' }}>
      
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.15,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, hsl(var(--accent-purple)) 0%, transparent 70%)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.12,
        pointerEvents: 'none',
        background: 'radial-gradient(circle, hsl(var(--accent-pink)) 0%, transparent 70%)'
      }}></div>

      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
          
          <nav className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>
            <a href="#about" style={{ transition: 'var(--transition-fast)' }} className="hover-white">About</a>
            <a href="#curriculum" style={{ transition: 'var(--transition-fast)' }} className="hover-white">Curriculum</a>
            <a href="#process" style={{ transition: 'var(--transition-fast)' }} className="hover-white">Registration</a>
            <a href="#structure" style={{ transition: 'var(--transition-fast)' }} className="hover-white">Class Structure</a>
          </nav>

          <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              Sign In
            </Link>
            <Link href="/signup" className="btn-premium" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              Get Started
            </Link>
          </div>

          {/* Hamburger menu for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="nav-mobile-toggle btn-secondary"
            style={{ 
              padding: '0.5rem', 
              borderRadius: 'var(--radius-sm)', 
              borderColor: 'var(--glass-border)',
              background: 'rgba(255,255,255,0.02)',
              cursor: 'pointer'
            }}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X style={{ width: '20px', height: '20px', color: '#fff' }} /> : <Menu style={{ width: '20px', height: '20px', color: '#fff' }} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div 
            className="flex md:hidden"
            style={{
              position: 'absolute',
              top: '80px',
              left: 0,
              right: 0,
              background: 'rgba(13, 13, 18, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--glass-border)',
              padding: '1.5rem',
              flexDirection: 'column',
              gap: '1.25rem',
              zIndex: 49
            }}
          >
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>About</a>
            <a href="#curriculum" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>Curriculum</a>
            <a href="#process" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>Registration</a>
            <a href="#structure" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>Class Structure</a>
            <hr style={{ borderColor: 'var(--glass-border)', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn-premium" style={{ width: '100%', justifyContent: 'center' }}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6rem 1.5rem 5rem 1.5rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
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
          marginBottom: '2rem'
        }}>
          <Sparkle style={{ width: '14px', height: '14px', color: 'hsl(var(--accent-purple))' }} />
          <span style={{ color: 'hsl(var(--text-secondary))' }}>
            NOW ENROLLING FOR THE UPCOMING TERM
          </span>
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: '1.15',
          fontFamily: 'var(--font-display)',
          marginBottom: '1.5rem'
        }}>
          Tiptop minds,<br />
          <span style={{
            background: 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, hsl(var(--accent-pink)) 50%, hsl(var(--accent-cyan)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Tiptop futures!
          </span>
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: 'hsl(var(--text-secondary))',
          maxWidth: '650px',
          marginBottom: '2.5rem',
          lineHeight: '1.6'
        }}>
          Empowering young minds through play-based education, creativity, and individualized care. Bridging structured learning with a hybrid-live virtual classroom.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <Link href="/signup" className="btn-premium" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Enroll Your Child <ArrowRight style={{ width: '20px', height: '20px' }} />
          </Link>
          <a href="#curriculum" className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Explore Programs
          </a>
        </div>

        {/* Visual Showcase Glass Card */}
        <div className="glass-card" style={{
          width: '100%',
          maxWidth: '850px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent-purple))'
            }}>
              <GraduationCap style={{ width: '32px', height: '32px' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Age-Optimized Dashboard Customization</h3>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', maxWidth: '480px', lineHeight: '1.5' }}>
              Automatic UI theme shifting adapts interface maturity dynamically from tactile early-stage play cards to advanced senior dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'hsl(var(--accent-purple))', display: 'block', marginBottom: '0.5rem' }}>
                Our Core Slogan
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
                Mission & Vision Statement
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Heart style={{ width: '18px', height: '18px', color: '#f87171' }} /> Mission Statement
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
                    Empowering young minds through play-based education, creativity, and individualized care.
                  </p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Compass style={{ width: '18px', height: '18px', color: '#38bdf8' }} /> Vision Statement
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
                    To cultivate a community of lifelong learners who are curious, confident, and equipped to thrive in an ever-changing world.
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Smile style={{ width: '28px', height: '28px', color: 'hsl(var(--accent-purple))' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Play-Based</h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                  Early stages focus on play, physical development, and creative expression.
                </p>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Sparkles style={{ width: '28px', height: '28px', color: 'hsl(var(--accent-pink))' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Balanced Growth</h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                  Curricula customized for screen-time thresholds and healthy habits.
                </p>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <ShieldCheck style={{ width: '28px', height: '28px', color: 'hsl(var(--accent-cyan))' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Absolute Security</h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                  Role-based locks, proctored exams, and parent approval pipelines.
                </p>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Calendar style={{ width: '28px', height: '28px', color: 'hsl(var(--accent-green))' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Everyday Classes</h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                  Virtual classes open every day of the week to suit any family calendar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" style={{
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'hsl(var(--accent-pink))', display: 'block', marginBottom: '0.5rem' }}>
              Academic Programs
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
              British Curriculum & EYFS Standards
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              We adapt study schedules and content for different age categories. Select a program tier below to explore.
            </p>
          </div>

          {/* Custom Tab Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <button 
                onClick={() => setActiveTab('early')}
                style={{
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'early' ? 'hsl(var(--accent-purple))' : 'transparent',
                  color: activeTab === 'early' ? '#fff' : 'hsl(var(--text-secondary))',
                  transition: 'var(--transition-fast)'
                }}
              >
                Early Years (Ages 3-5)
              </button>
              <button 
                onClick={() => setActiveTab('primary')}
                style={{
                  padding: '0.6rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'primary' ? 'hsl(var(--accent-purple))' : 'transparent',
                  color: activeTab === 'primary' ? '#fff' : 'hsl(var(--text-secondary))',
                  transition: 'var(--transition-fast)'
                }}
              >
                Primary School (Ages 6-11)
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* Schedule Details Card */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
              <div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--accent-indigo))',
                  marginBottom: '1.5rem'
                }}>
                  <Clock style={{ width: '20px', height: '20px' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
                  Pacing & Timing Guidelines
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  Our live classes balance curriculum depth with healthy attention spans. Classes are open every day of the week.
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Frequency</span>
                  <span style={{ fontWeight: 600 }}>{activeTab === 'early' ? '2-3 times / week' : '3-4 times / week'}</span>
                </div>
                <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Session Duration</span>
                  <span style={{ fontWeight: 600 }}>{activeTab === 'early' ? '20-30 minutes' : '30-45 minutes'}</span>
                </div>
                <div className="flex-between" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'hsl(var(--text-muted))' }}>Availability</span>
                  <span style={{ fontWeight: 600, color: 'hsl(var(--accent-cyan))' }}>Open 7 Days a week</span>
                </div>
              </div>
            </div>

            {/* Subjects / Key Learning Areas Card */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award style={{ width: '20px', height: '20px', color: 'hsl(var(--accent-pink))' }} />
                {activeTab === 'early' ? 'EYFS curriculum - 7 Key Areas' : 'British Curriculum - Key Subjects'}
              </h3>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {activeTab === 'early' ? (
                  <>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>1. Communication and Language</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Developing children's listening, speaking, reading, and writing skills.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>2. Personal, Social & Emotional Development</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Fostering children's emotional intelligence, social skills, and self-awareness.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>3. Physical Development</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Encouraging children's gross/fine motor skills, health, and well-being.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>4. Literacy & 5. Mathematics</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Reading, phonics, number sequences, shape recognition, and puzzle solving.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>6. Understanding the World & 7. Expressive Arts</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Exploring nature, technology, community roles, and musical/artistic creativity.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>English, Math & Science</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Grammar, composition, arithmetic, biology, physics and chemical basics.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>Computing & Coding</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Digital literacy, introductory coding, logic, and basic computer science.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>History, Geography & Arts</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Timelines, world maps, environmental systems, drawing, and music appreciation.</span>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.15rem' }}>PSHE & RE (Ethics & Well-being)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Ethics, global beliefs, physical education, social skills and relationships.</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <Link href="/curriculum" className="btn-premium" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
              View Detailed 12-Week Curriculum Maps <ChevronRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Class Structure Section */}
      <section id="structure" style={{
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'hsl(var(--accent-cyan))', display: 'block', marginBottom: '0.5rem' }}>
              Methodology
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
              Flexible Learning Structure
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              We balance screen-time and student focus through a hybrid virtual structure.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent-purple))',
                margin: '0 auto 1.5rem auto'
              }}>
                <Users style={{ width: '24px', height: '24px' }} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                Synchronous Live Classes
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                Real-time interactive online classroom sessions with professional educators and peers.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent-pink))',
                margin: '0 auto 1.5rem auto'
              }}>
                <Layers style={{ width: '24px', height: '24px' }} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                Asynchronous Lessons
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                Pre-recorded visual explanations and materials accessible for learning at your own pace.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent-cyan))',
                margin: '0 auto 1.5rem auto'
              }}>
                <Sparkles style={{ width: '24px', height: '24px' }} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                Interactive Activities
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                Gamified quizzes, practical assignments, and child-oriented milestones to trigger excitement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Process Section */}
      <section id="process" style={{
        padding: '5rem 1.5rem',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 4rem auto' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'hsl(var(--accent-green))', display: 'block', marginBottom: '0.5rem' }}>
              Admissions
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
              5-Step Registration Pathway
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              How to securely onboard your child in our virtual cohort database.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {registrationSteps.map((step, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {step.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
            * Enrollment complies fully with early stage virtual schooling guidelines.
          </p>
        </div>
      </section>

      {/* CTA section */}
      <section style={{ padding: '4rem 1.5rem 6rem 1.5rem' }}>
        <div className="glass-card" style={{
          maxWidth: '850px',
          margin: '0 auto',
          padding: '3.5rem 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
            Ready to give your child a{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--accent-purple)), hsl(var(--accent-pink)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Tiptop Start?
            </span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', maxWidth: '520px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            Create an account to select curricula, specify teacher scheduling slots, and setup student workspaces.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/signup" className="btn-premium" style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}>
              Create Parent Account
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}>
              Secure Sign In
            </Link>
          </div>
        </div>
      </section>

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
            © {new Date().getFullYear()} Tiptop Virtual Academy. All rights reserved. Registered Stage Virtual Education Cohorts.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
            <a href="#" className="hover-white">Privacy Policy</a>
            <a href="#" className="hover-white">Terms</a>
            <a href="#" className="hover-white">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
