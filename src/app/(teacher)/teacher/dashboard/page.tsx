import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { Clock, CheckCircle, Award, Users, BookOpen, MessageSquare, AlertCircle, FileText } from 'lucide-react';
import GoogleMeetLauncher from '@/components/teacher/GoogleMeetLauncher';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
  const supabase = await createClient();

  // 1. Get logged in teacher profile
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please log in to access the Teacher Operational Workspace.</p>
      </div>
    );
  }

  // 2. Fetch assigned live sessions
  const { data: sessions } = await supabase
    .from('live_sessions')
    .select(`
      *,
      courses(*)
    `)
    .eq('teacher_id', user.id)
    .order('scheduled_start', { ascending: true });

  const allSessions = sessions || [];
  const today = new Date().toDateString();

  // Sessions today & metrics calculation
  const sessionsToday = allSessions.filter(s => new Date(s.scheduled_start).toDateString() === today);
  const upcomingSessions = allSessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled');
  const completedSessions = allSessions.filter(s => s.status === 'completed');

  // 3. Fetch pending grading assignments
  const { count: pendingGradingCount } = await supabase
    .from('assignment_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('graded', false);

  // 4. Fetch recent parent notifications/messages
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  // 5. Total unique students taught across bookings
  const { count: totalStudentsTaught } = await supabase
    .from('student_bookings')
    .select('student_id', { count: 'exact', head: true });

  return (
    <>
      <PageHeader
        title="Teacher Operational Workspace"
        subtitle="Unified teaching cockpit: Today's timetable, curriculum delivery, live Google Meet sessions, and attendance."
      />

      {/* DEL-0063: Quick Statistics Banner */}
      <div className="grid-4" style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <Clock style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Classes Today</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{sessionsToday.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <Users style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Students Taught</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{totalStudentsTaught || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}>
            <FileText style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Pending Grading</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{pendingGradingCount || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.75rem', borderRadius: '12px' }}>
            <MessageSquare style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Parent Messages</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{notifications?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Access Navigation Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <Link href="/teacher/lessons" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen style={{ width: '18px', height: '18px', color: '#38bdf8' }} /> Open Lesson Workspace
        </Link>
        <Link href="/teacher/assignments" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText style={{ width: '18px', height: '18px', color: '#10b981' }} /> Homework & Assignment Manager
        </Link>
        <Link href="/teacher/availability" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock style={{ width: '18px', height: '18px', color: '#f59e0b' }} /> Set Weekly Availability
        </Link>
        <Link href="/teacher/cohorts" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users style={{ width: '18px', height: '18px', color: '#e81cff' }} /> View Student Roster
        </Link>
      </div>

      {/* DEL-0058: Today's Timetable & Live Classrooms */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: '#fff' }}>
        Today's Timetable & Upcoming Live Classes
      </h2>

      {upcomingSessions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>No upcoming sessions scheduled for today.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
          {upcomingSessions.map((session) => {
            const startDate = new Date(session.scheduled_start);
            const formattedDate = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={session.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  padding: '1.5rem 2rem'
                }}>
                  <div>
                    <span className="badge badge-purple" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', marginBottom: '0.35rem', display: 'inline-block' }}>
                      {session.courses?.min_age}-{session.courses?.max_age} yrs • {session.session_type}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                      {session.courses?.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0' }}>
                      📅 {formattedDate} at {formattedTime}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link
                      href={`/teacher/classes/${session.id}`}
                      className="btn-premium"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                    >
                      <Award style={{ width: '18px', height: '18px' }} /> Attendance & Badges Console
                    </Link>
                  </div>
                </div>

                {/* DEL-0060 Google Meet Launcher integrated directly */}
                <GoogleMeetLauncher
                  sessionId={session.id}
                  meetingToken={session.meeting_token}
                  existingMeetUrl={session.google_meet_url}
                  syncStatus={session.sync_status}
                  status={session.status}
                  startedAt={session.actual_started_at}
                  endedAt={session.actual_ended_at}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Session History */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: '#fff' }}>
        Completed Session History
      </h2>

      {completedSessions.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>No completed sessions found.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-secondary))' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Course</th>
                <th style={{ padding: '1rem 1.5rem' }}>Date Completed</th>
                <th style={{ padding: '1rem 1.5rem' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {completedSessions.map((session) => (
                <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#fff' }}>{session.courses?.title}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'hsl(var(--text-secondary))' }}>
                    {new Date(session.scheduled_start).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {session.session_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
