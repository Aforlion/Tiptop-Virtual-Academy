import React from 'react';
import { getAllCourses, getAllLiveSessions } from '@/lib/queries';
import PageHeader from '@/components/layout/PageHeader';
import SessionsTable from '../components/SessionsTable';
import ScheduleSessionForm from '../components/ScheduleSessionForm';
import { Course, LiveSessionWithCourse } from '@/lib/types';
import { getMockDateOffset } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminSessionsPage() {
  let courses: Course[] = [];
  let liveSessions: LiveSessionWithCourse[] = [];
  let schemaError = false;

  try {
    const { data: coursesData, error: coursesErr } = await getAllCourses();
    const { data: sessionsData, error: sessionsErr } = await getAllLiveSessions();
    
    if (coursesErr || sessionsErr) {
      schemaError = true;
    } else {
      courses = coursesData || [];
      liveSessions = sessionsData || [];
    }
  } catch {
    schemaError = true;
  }

  // Fallback Mock Data
  if (schemaError || courses.length === 0) {
    courses = [
      { id: '1', title: 'Creative Coding & Logic Loops', description: '', min_age: 5, max_age: 8, is_published: true, created_at: '' },
    ];
  }

  if (schemaError || liveSessions.length === 0) {
    liveSessions = [
      { 
        id: '1', 
        course_id: '1',
        teacher_name: 'Professor Barbara', 
        meeting_token: 'room-astro', 
        scheduled_start: getMockDateOffset(5), 
        scheduled_end: getMockDateOffset(65),
        session_type: 'flexible',
        max_seats: 15,
        status: 'scheduled',
        created_at: '',
        courses: courses[0]
      }
    ];
  }

  return (
    <>
      <PageHeader
        title="Class Management"
        subtitle="Schedule live classes and manage upcoming sessions."
      />
      <div className="grid-2" style={{ marginBottom: '2.5rem', alignItems: 'start' }}>
        <ScheduleSessionForm courses={courses} />
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'hsl(var(--accent-purple))' }}>Session Insights</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))' }}>
            Upcoming Sessions: {liveSessions.filter(s => s.status === 'scheduled').length}<br/>
            Live Now: {liveSessions.filter(s => s.status === 'live').length}
          </p>
        </div>
      </div>
      <SessionsTable sessions={liveSessions} schemaError={schemaError} />
    </>
  );
}
