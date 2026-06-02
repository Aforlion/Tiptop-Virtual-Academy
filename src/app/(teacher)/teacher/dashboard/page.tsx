import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { Video, Award, Clock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
  const supabase = await createClient();

  // 1. Get logged in teacher user
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please log in to access the Teacher Portal.</p>
      </div>
    );
  }

  // 2. Fetch assigned classes
  const { data: sessions, error } = await supabase
    .from('live_sessions')
    .select(`
      *,
      courses(*)
    `)
    .eq('teacher_id', user.id)
    .order('scheduled_start', { ascending: true });

  if (error) {
    console.error('Failed to fetch teacher sessions:', error);
  }

  const allSessions = sessions || [];
  const now = new Date();

  // Categorize sessions
  const upcomingSessions = allSessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled');
  const completedSessions = allSessions.filter(s => s.status === 'completed');

  return (
    <>
      <PageHeader
        title="Teacher Console"
        subtitle="Manage your assigned sessions, take attendance, and reward student badges."
      />

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <Clock style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Scheduled Classes</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{upcomingSessions.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Classes Completed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{completedSessions.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.75rem', borderRadius: '12px' }}>
            <Award style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Account Level</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e81cff', marginTop: '0.25rem' }}>Verified Instructor</div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: '#fff' }}>
        Upcoming Assigned Live Rooms
      </h2>

      {upcomingSessions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>You have no upcoming sessions scheduled.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {upcomingSessions.map((session) => {
            const startDate = new Date(session.scheduled_start);
            const formattedDate = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const cleanRoom = session.meeting_token.replace(/[^a-zA-Z0-9-_]/g, '-');
            const jitsiUrl = `https://meet.jit.si/${cleanRoom}`;

            return (
              <div key={session.id} className="glass-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
                padding: '1.5rem 2rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span className="badge badge-purple" style={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}>
                    {session.courses?.min_age}-{session.courses?.max_age} yrs • {session.session_type}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                    {session.courses?.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                    📅 {formattedDate} at {formattedTime}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a 
                    href={jitsiUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-premium" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
                  >
                    <Video style={{ width: '18px', height: '18px' }} /> Open Live Room
                  </a>
                  <Link 
                    href={`/teacher/classes/${session.id}`}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                  >
                    <Award style={{ width: '18px', height: '18px' }} /> Log Attendance & Badges
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed History */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: '#fff' }}>
        Completed Class History
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
