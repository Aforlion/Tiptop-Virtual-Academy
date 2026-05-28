import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { 
  getProfile, 
  getStudentsByParent, 
  getUpcomingSessions, 
  getBookingsByParent 
} from '@/lib/queries'
import PageHeader from '@/components/layout/PageHeader'
import CreditBalance from '../components/CreditBalance'
import AddChildForm from '../components/AddChildForm'
import BookSessionForm from '../components/BookSessionForm'
import StudentCards from '../components/StudentCards'
import BookingsTable from '../components/BookingsTable'
import { getMockDateOffset } from '@/lib/utils'
import { Profile, Student, LiveSessionWithCourse, BookingWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ParentDashboardPage() {
  const supabase = await createClient()

  // 1. Get Logged in Parent User
  const { data: { user } } = await supabase.auth.getUser()
  const parentId = user?.id || 'parent-mock-1'

  // Attempt database fetching
  let parentProfile: Profile | null = null
  let students: Student[] = []
  let liveSessions: LiveSessionWithCourse[] = []
  let bookings: BookingWithDetails[] = []
  let schemaError = false

  try {
    const { data: profileData, error: profileErr } = await getProfile(parentId)
    const { data: studentsData, error: studentsErr } = await getStudentsByParent(parentId)
    const { data: sessionsData, error: sessionsErr } = await getUpcomingSessions()
    const { data: bookingsData, error: bookingsErr } = await getBookingsByParent(parentId)

    if (profileErr || studentsErr || sessionsErr || bookingsErr) {
      schemaError = true
    } else {
      parentProfile = profileData
      students = studentsData || []
      liveSessions = sessionsData || []
      bookings = bookingsData || []
    }
  } catch {
    schemaError = true
  }

  // Fallback Mock Data if Schema isn't loaded
  if (schemaError || !parentProfile) {
    parentProfile = { 
      id: parentId, 
      first_name: user?.user_metadata?.first_name || 'Parent', 
      last_name: user?.user_metadata?.last_name || 'User', 
      flexible_credits: 10 
    } as Profile
  }

  if (schemaError || students.length === 0) {
    students = [
      { id: 'kid-1', parent_id: parentId, first_name: 'Aiden', date_of_birth: '2021-08-14', notes: 'Enjoys colors, blocks, and play-doh logic.', created_at: '' },
      { id: 'kid-2', parent_id: parentId, first_name: 'Sophia', date_of_birth: '2016-04-20', notes: 'Enjoys starry cosmos, astrophysics, and simple coding.', created_at: '' }
    ]
  }

  if (schemaError || liveSessions.length === 0) {
    liveSessions = [
      { 
        id: 'session-1', 
        course_id: 'c1',
        teacher_name: 'Ms. Barbara', 
        meeting_token: 'room-astro', 
        scheduled_start: getMockDateOffset(5), // starts in 5 minutes!
        scheduled_end: getMockDateOffset(65),
        session_type: 'flexible',
        max_seats: 15,
        status: 'scheduled',
        created_at: '',
        courses: { id: 'c1', title: 'Cosmic Astrophysics for Tiny Minds', description: 'Early planets & gravity', min_age: 7, max_age: 12, is_published: true, created_at: '' }
      },
      { 
        id: 'session-2', 
        course_id: 'c2',
        teacher_name: 'Dr. Sarah', 
        meeting_token: 'room-coding', 
        scheduled_start: getMockDateOffset(24 * 60), 
        scheduled_end: getMockDateOffset(25 * 60),
        session_type: 'cohort',
        max_seats: 15,
        status: 'scheduled',
        created_at: '',
        courses: { id: 'c2', title: 'Creative Coding & Logic Loops', description: 'Learn logic flow with fun puzzles', min_age: 5, max_age: 8, is_published: true, created_at: '' }
      }
    ]
  }

  if (schemaError || bookings.length === 0) {
    bookings = [
      {
        id: 'booking-1',
        student_id: students[0].id,
        session_id: liveSessions[1].id,
        attended: false,
        created_at: '',
        students: students[0],
        live_sessions: liveSessions[1]
      }
    ]
  }

  const parentName = parentProfile.first_name

  return (
    <>
      {/* Header section */}
      <PageHeader 
        title={`Welcome, ${parentName}!`} 
        subtitle="Your parent mission control dashboard. Add children, book live flex sessions, and launch student environments."
        action={<CreditBalance credits={parentProfile.flexible_credits} />}
      />

      {/* DB Error Notification if tables not set up yet */}
      {schemaError && (
        <div className="glass-card" style={{ 
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 500 }}>
            ⚠️ Running in offline sandbox mode. To connect this live booking form to your actual database, please ensure you copy the Postgres script in **migration_001_foundation.sql** and run it inside your Supabase project&apos;s SQL editor.
          </p>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '2.5rem', alignItems: 'start' }}>
        <AddChildForm />
        <BookSessionForm students={students} liveSessions={liveSessions} />
      </div>

      {/* Manage Children & Switch Dashboard Section */}
      <StudentCards students={students} />

      {/* Active Bookings Tracker */}
      <BookingsTable bookings={bookings} parentId={parentId} schemaError={schemaError} />
    </>
  )
}
