import React from 'react'
import { 
  getStudentById, 
  getBookingsByStudent, 
  getStudentChallenges, 
  getLeaderboards, 
  getStudentStreaks 
} from '@/lib/queries'
import { calculateAge, getAgeBracket, getMockDateOffset } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, LogOut, GraduationCap } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import WelcomeHero from '../components/WelcomeHero'
import ClassroomSection from '../components/ClassroomSection'
import SchedulePanel from '../components/SchedulePanel'
import ExplorationPanel from '../components/ExplorationPanel'
import GamificationCenter from '../components/GamificationCenter'
import { Student, BookingWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StudentDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams

  const studentId = params.studentId as string | undefined
  const manualAgeToggle = params.testAge as string | undefined

  let student: Student | null = null
  let bookings: BookingWithDetails[] = []
  
  let challengesData: any[] = []
  let leaderboardData = { allTime: [] as any[], weekly: [] as any[] }
  let streakData = { currentStreak: 0, lastSevenDays: [] as any[] }

  try {
    if (studentId && studentId !== 'demo') {
      const { data: studentData, error: studentErr } = await getStudentById(studentId)
      const { data: bookingsData, error: bookingsErr } = await getBookingsByStudent(studentId)

      if (!studentErr && !bookingsErr && studentData) {
        student = studentData
        bookings = bookingsData || []

        // Fetch student gamification details
        const { data: challs } = await getStudentChallenges(student.id)
        if (challs) challengesData = challs

        const { allTime, weekly } = await getLeaderboards(student.id)
        leaderboardData = { allTime, weekly }

        const { currentStreak, lastSevenDays } = await getStudentStreaks(student.id)
        streakData = { currentStreak, lastSevenDays }
      }
    }
  } catch (err) {
    console.error('Failed to fetch student gamification details:', err)
  }

  if (!student) {
    return (
      <main className="auth-wrapper" style={{ background: 'hsl(var(--bg-primary))', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '480px', padding: '2.5rem', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
          <GraduationCap style={{ width: '48px', height: '48px', color: 'hsl(var(--accent-purple))', margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Profile Access Restricted</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            No registered student profile was found or associated with this session. Please select a child profile from the parent center catalog dashboard.
          </p>
          <Link href="/login" className="btn-premium" style={{ display: 'inline-flex', padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
            Return to Login
          </Link>
        </div>
      </main>
    );
  }

  // Calculate age for age-adaptation (Rule 3)
  const age = calculateAge(student.date_of_birth)
  const ageBracket = getAgeBracket(age)
  const isJunior = ageBracket === 'junior'
  const isTeen = ageBracket === 'teen'

  let activeThemeClass = 'older-kid-theme'
  if (isJunior) {
    activeThemeClass = 'kid-theme'
  } else if (isTeen) {
    activeThemeClass = 'teen-theme'
  }

  const activeBooking = bookings[0]
  const portalTitle = isJunior ? 'Junior Academy Dashboard' : isTeen ? 'Teen Workspace Terminal' : 'Nexus Learner Terminal'

  // Collect all earned badge IDs
  const allEarnedBadgeIds = bookings.flatMap(b => b.earned_badges || [])

  return (
    <div className={activeThemeClass} style={{ transition: 'all 0.5s ease' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Navigation / Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <Link 
            href="/parent/dashboard" 
            className="btn-secondary" 
            style={{
              borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
              background: isJunior ? '#fff' : isTeen ? '#111827' : 'rgba(255,255,255,0.02)',
              borderColor: isJunior ? '#e2e8f0' : isTeen ? '#1f2937' : 'rgba(6, 182, 212, 0.2)',
              color: isJunior ? '#475569' : '#fff'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Return to Parent Room
          </Link>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: isJunior ? '1.5rem' : '1.25rem', color: isJunior ? '#1e1b4b' : isTeen ? '#818cf8' : '#22d3ee' }}>
            {portalTitle}
          </h2>

          <form action={signout}>
            <button 
              type="submit" 
              className="btn-secondary" 
              style={{
                borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
                color: '#ef4444',
                borderColor: isJunior ? '#fca5a5' : isTeen ? '#ef4444' : 'rgba(220, 38, 38, 0.2)',
                background: isJunior ? '#fff' : isTeen ? 'transparent' : 'transparent'
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} /> Leave Academy
            </button>
          </form>
        </div>

        {/* Welcome Header Hero */}
        <WelcomeHero student={student} isJunior={isJunior} isTeen={isTeen} />

        {/* Gamified Achievement Showcase */}
        {!isTeen && (
          <div style={{ marginBottom: '2.5rem' }}>
            <GamificationCenter
              studentName={student.first_name}
              studentXp={student.xp || 0}
              earnedBadgeIds={allEarnedBadgeIds}
              challenges={challengesData}
              leaderboard={leaderboardData}
              streak={streakData}
              isJunior={isJunior}
            />
          </div>
        )}

        {/* Pulsing Live Classroom Section */}
        <ClassroomSection booking={activeBooking} studentName={student.first_name} isJunior={isJunior} />

        {/* Calendar and Logic Panels */}
        <div className="grid-2">
          <SchedulePanel bookings={bookings} isJunior={isJunior} />
          <ExplorationPanel isJunior={isJunior} />
        </div>

      </div>
    </div>
  )
}

