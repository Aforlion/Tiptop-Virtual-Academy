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
import { ArrowLeft, LogOut } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import AgeSwitcher from '../components/AgeSwitcher'
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

  // Fallback default student if none provided in search param (for direct link testing)
  if (!student) {
    student = {
      id: 'mock-child-id',
      parent_id: 'parent-mock-1',
      first_name: 'Aiden',
      date_of_birth: manualAgeToggle === 'older' ? '2015-05-15' : '2021-08-14',
      notes: 'Loves stars and simple puzzles.',
      xp: 240,
      created_at: ''
    }
  }

  // Fallback gamification details for demonstration / testing
  if (challengesData.length === 0) {
    challengesData = [
      { id: 'c1', title: 'Class Explorer', description: 'Attend 3 live learning sessions', xp_reward: 300, target_count: 3, progress_count: 1, completed: false },
      { id: 'c2', title: 'Logic Wizard', description: 'Earn the Logic Wizard badge (🧠) for writing bug-free loops', xp_reward: 150, target_count: 1, progress_count: 0, completed: false },
      { id: 'c3', title: 'Science Explorer', description: 'Earn the Space Explorer badge (🚀) for stellar calculations', xp_reward: 150, target_count: 1, progress_count: 0, completed: false },
      { id: 'c4', title: 'Dino Hunter', description: 'Earn the Dino Discovery badge (🦖) for digging up history secrets', xp_reward: 150, target_count: 1, progress_count: 0, completed: false }
    ]
  }

  if (leaderboardData.allTime.length === 0) {
    leaderboardData = {
      allTime: [
        { rank: 1, student_id: 's-1', first_name: 'Tiana', total_xp: 3200, weekly_xp: 600, league_tier: 'Gold', is_current_student: false },
        { rank: 2, student_id: student.id, first_name: student.first_name, total_xp: student.xp || 240, weekly_xp: 100, league_tier: 'Bronze', is_current_student: true },
        { rank: 3, student_id: 's-3', first_name: 'Mateo', total_xp: 150, weekly_xp: 150, league_tier: 'Bronze', is_current_student: false }
      ],
      weekly: [
        { rank: 1, student_id: 's-1', first_name: 'Tiana', total_xp: 3200, weekly_xp: 600, league_tier: 'Gold', is_current_student: false },
        { rank: 2, student_id: 's-3', first_name: 'Mateo', total_xp: 150, weekly_xp: 150, league_tier: 'Bronze', is_current_student: false },
        { rank: 3, student_id: student.id, first_name: student.first_name, total_xp: student.xp || 240, weekly_xp: 100, league_tier: 'Bronze', is_current_student: true }
      ]
    }
  }

  if (streakData.lastSevenDays.length === 0) {
    streakData = {
      currentStreak: 2,
      lastSevenDays: [
        { dayName: 'Sat', dateString: '2026-05-30', active: false },
        { dayName: 'Sun', dateString: '2026-05-31', active: false },
        { dayName: 'Mon', dateString: '2026-06-01', active: false },
        { dayName: 'Tue', dateString: '2026-06-02', active: false },
        { dayName: 'Wed', dateString: '2026-06-03', active: true },
        { dayName: 'Thu', dateString: '2026-06-04', active: true },
        { dayName: 'Fri', dateString: '2026-06-05', active: false }
      ]
    }
  }

  // Calculate age for age-adaptation (Rule 3)
  let age = calculateAge(student.date_of_birth)
  if (manualAgeToggle === 'older') {
    age = 9 // force 7-12 senior layout
  } else if (manualAgeToggle === 'younger') {
    age = 4 // force 3-6 junior layout
  }

  const isJunior = getAgeBracket(age) === 'junior'
  const activeThemeClass = isJunior ? 'kid-theme' : 'older-kid-theme'

  // Fallback booked sessions for demonstration
  if (bookings.length === 0) {
    bookings = [
      {
        id: 'booking-mock-1',
        student_id: student.id,
        session_id: 'session-mock-1',
        attended: false,
        earned_badges: [],
        created_at: '',
        students: student,
        live_sessions: {
          id: 'session-mock-1',
          course_id: 'c-mock',
          teacher_name: 'Ms. Barbara',
          meeting_token: 'room-astro',
          scheduled_start: getMockDateOffset(5), // starts in 5 minutes!
          scheduled_end: getMockDateOffset(65),
          session_type: 'flexible',
          max_seats: 15,
          status: 'scheduled',
          created_at: '',
          courses: {
            id: 'c-mock',
            title: isJunior ? 'Creative Coding & Logic Loops' : 'Cosmic Astrophysics for Tiny Minds',
            description: isJunior ? 'Learn code using playful color loops and puzzles!' : 'Explore stars, gravity, and the quantum cosmos.',
            min_age: isJunior ? 3 : 7,
            max_age: isJunior ? 12 : 12,
            is_published: true,
            created_at: ''
          }
        }
      }
    ]
  }

  const activeBooking = bookings[0]
  const portalTitle = isJunior ? 'Junior Academy Dashboard' : 'Nexus Learner Terminal'

  // Collect all earned badge IDs
  const allEarnedBadgeIds = bookings.flatMap(b => b.earned_badges || [])

  return (
    <div className={activeThemeClass} style={{ transition: 'all 0.5s ease' }}>
      
      {/* Dev Switcher */}
      <AgeSwitcher studentId={studentId || 'demo'} isJunior={isJunior} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Navigation / Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <Link 
            href="/parent/dashboard" 
            className="btn-secondary" 
            style={{
              borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
              background: isJunior ? '#fff' : 'rgba(255,255,255,0.02)',
              borderColor: isJunior ? '#e2e8f0' : 'rgba(6, 182, 212, 0.2)',
              color: isJunior ? '#475569' : '#fff'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Return to Parent Room
          </Link>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: isJunior ? '1.5rem' : '1.25rem', color: isJunior ? '#1e1b4b' : '#22d3ee' }}>
            {portalTitle}
          </h2>

          <form action={signout}>
            <button 
              type="submit" 
              className="btn-secondary" 
              style={{
                borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
                color: '#ef4444',
                borderColor: isJunior ? '#fca5a5' : 'rgba(220, 38, 38, 0.2)',
                background: isJunior ? '#fff' : 'transparent'
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} /> Leave Academy
            </button>
          </form>
        </div>

        {/* Welcome Header Hero */}
        <WelcomeHero student={student} isJunior={isJunior} />

        {/* Gamified Achievement Showcase */}
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

