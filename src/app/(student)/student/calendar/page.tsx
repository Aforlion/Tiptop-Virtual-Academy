import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getStudentById, getBookingsByStudent } from '@/lib/queries';
import StudentNavHeader from '../components/StudentNavHeader';
import { Calendar, Video, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { calculateAge, getAgeBracket } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentCalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const studentId = params.studentId as string | undefined;

  if (!studentId) redirect('/parent/dashboard');

  const supabase = await createClient();
  const { data: student } = await getStudentById(studentId);
  if (!student) redirect('/parent/dashboard');

  const age = calculateAge(student.date_of_birth);
  const ageBracket = getAgeBracket(age);
  const isJunior = ageBracket === 'junior';
  const isTeen = ageBracket === 'teen';

  // 1. Fetch live session bookings for timetable
  const { data: bookings } = await getBookingsByStudent(student.id);
  const allBookings = bookings || [];

  // 2. Fetch homework assignments due dates
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*, courses(title)')
    .order('due_date', { ascending: true });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <StudentNavHeader
        studentName={student.first_name}
        studentId={student.id}
        isJunior={isJunior}
        isTeen={isTeen}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>
            Calendar & Weekly Timetable
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Live Google Meet sessions, weekly timetable, Google Calendar events, and homework deadlines.
          </p>
        </div>
      </div>

      {/* Weekly Live Class Schedule */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Video style={{ width: '20px', height: '20px', color: '#38bdf8' }} /> Scheduled Live Classes & Google Meet Links
      </h3>

      {allBookings.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))', marginBottom: '2.5rem' }}>
          No live classes currently booked on your schedule.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {allBookings.map(b => {
            const session = b.live_sessions;
            const startDate = session ? new Date(session.scheduled_start) : new Date();
            const formattedDate = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const cleanRoom = session?.meeting_token?.replace(/[^a-zA-Z0-9-_]/g, '-') || 'tiptop-room';
            const meetUrl = session?.google_meet_url || `https://meet.google.com/lookup/${cleanRoom}`;

            return (
              <div key={b.id} className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <span className="badge badge-purple" style={{ fontSize: '0.7rem', marginBottom: '0.35rem', display: 'inline-block' }}>
                    {session?.session_type} Session
                  </span>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{session?.courses?.title || 'Live Class'}</h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                    📅 {formattedDate} at {formattedTime} • Instructor: {session?.teacher_name}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                  >
                    <Video style={{ width: '16px', height: '16px' }} /> Join Google Meet Session
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Homework Deadlines & Calendar Milestones */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText style={{ width: '20px', height: '20px', color: '#10b981' }} /> Upcoming Homework Deadlines
      </h3>

      {assignments && assignments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignments.map((asgn: any) => {
            const dueDate = new Date(asgn.due_date);
            return (
              <div key={asgn.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{asgn.courses?.title}</span>
                  <h4 style={{ margin: '0.25rem 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{asgn.title}</h4>
                </div>
                <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock style={{ width: '16px', height: '16px' }} /> Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No upcoming homework deadlines.
        </div>
      )}
    </div>
  );
}
