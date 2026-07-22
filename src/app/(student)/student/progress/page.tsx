import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getStudentById, getBookingsByStudent, getStudentChallenges } from '@/lib/queries';
import StudentNavHeader from '../components/StudentNavHeader';
import { Award, CheckCircle2, Calendar, BookOpen, Flame, ShieldAlert, Star } from 'lucide-react';
import { calculateAge, getAgeBracket } from '@/lib/utils';
import { BADGES } from '@/lib/badges';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentProgressPage({ searchParams }: PageProps) {
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

  // 1. Fetch student bookings & attendance metrics
  const { data: bookings } = await getBookingsByStudent(student.id);
  const allBookings = bookings || [];
  const attendedBookings = allBookings.filter(b => b.attended);
  const attendanceRate = allBookings.length > 0 ? Math.round((attendedBookings.length / allBookings.length) * 100) : 100;

  // 2. Fetch homework submissions count
  const { count: totalSubmittedHomework } = await supabase
    .from('assignment_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', student.id);

  // 3. Collect earned badges
  const earnedBadgeIds = allBookings.flatMap(b => b.earned_badges || []);
  const uniqueBadgeIds = Array.from(new Set(earnedBadgeIds));
  const earnedBadgeObjects = BADGES.filter(b => uniqueBadgeIds.includes(b.id));

  // 4. Fetch active challenges
  const { data: challenges } = await getStudentChallenges(student.id);

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
            Progress & Achievement Dashboard
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Centralized Student Achievement domain: Attendance records, completed homework, XP badges, and academic milestones.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <Calendar style={{ width: '28px', height: '28px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', fontWeight: 600 }}>Attendance Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{attendanceRate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{attendedBookings.length} of {allBookings.length} classes attended</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <BookOpen style={{ width: '28px', height: '28px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', fontWeight: 600 }}>Homework Completed</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>{totalSubmittedHomework || 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Tasks submitted & verified</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.75rem', borderRadius: '12px' }}>
            <Award style={{ width: '28px', height: '28px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', fontWeight: 600 }}>Total Earned XP</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e81cff' }}>{student.xp || 0} XP</div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Level {Math.floor((student.xp || 0) / 100) + 1} Academic Rank</div>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award style={{ width: '20px', height: '20px', color: '#e81cff' }} /> Earned Achievement Badges ({earnedBadgeObjects.length})
      </h3>

      {earnedBadgeObjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'hsl(var(--text-secondary))', marginBottom: '2.5rem' }}>
          Attend live classes and participate to unlock achievement badges!
        </div>
      ) : (
        <div className="grid-4" style={{ gap: '1rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {earnedBadgeObjects.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(232, 28, 255, 0.3)', background: 'rgba(232, 28, 255, 0.05)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{b.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{b.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '0.2rem' }}>{b.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Academic Milestone Challenges */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star style={{ width: '20px', height: '20px', color: '#f59e0b' }} /> Academic Quest Milestones
      </h3>

      {challenges && challenges.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {challenges.map((c: any) => {
            const ch = c.challenges;
            const progress = c.progress_count || 0;
            const target = ch?.target_count || 1;
            const percent = Math.min(100, Math.round((progress / target) * 100));

            return (
              <div key={c.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>{ch?.title}</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{ch?.description}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: c.completed ? '#10b981' : '#f59e0b' }}>
                      {c.completed ? 'Completed! 🎉' : `${progress} / ${target} (${percent}%)`}
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>+{ch?.xp_reward} XP Reward</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          Milestones auto-update as classes and assignments are completed.
        </div>
      )}
    </div>
  );
}
