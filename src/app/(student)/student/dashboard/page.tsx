import React from 'react'
import { getStudentById, getBookingsByStudent } from '@/lib/queries'
import { calculateAge, getAgeBracket, getMockDateOffset } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, LogOut } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import AgeSwitcher from '../components/AgeSwitcher'
import WelcomeHero from '../components/WelcomeHero'
import ClassroomSection from '../components/ClassroomSection'
import SchedulePanel from '../components/SchedulePanel'
import ExplorationPanel from '../components/ExplorationPanel'
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

  try {
    if (studentId && studentId !== 'demo') {
      const { data: studentData, error: studentErr } = await getStudentById(studentId)
      const { data: bookingsData, error: bookingsErr } = await getBookingsByStudent(studentId)

      if (!studentErr && !bookingsErr && studentData) {
        student = studentData
        bookings = bookingsData || []
      }
    }
  } catch {
    // Ignore error, fallback below handles it
  }

  // Fallback default student if none provided in search param (for direct link testing)
  if (!student) {
    student = {
      id: 'mock-child-id',
      parent_id: 'parent-mock-1',
      first_name: 'Aiden',
      date_of_birth: manualAgeToggle === 'older' ? '2015-05-15' : '2021-08-14',
      notes: 'Loves stars and simple puzzles.',
      created_at: ''
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
            max_age: isJunior ? 6 : 12,
            is_published: true,
            created_at: ''
          }
        }
      }
    ]
  }

  const activeBooking = bookings[0]
  const portalTitle = isJunior ? 'Junior Academy Dashboard' : 'Nexus Learner Terminal'

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
