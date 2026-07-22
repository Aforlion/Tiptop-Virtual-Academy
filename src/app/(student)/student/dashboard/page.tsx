import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { 
  getStudentById, 
  getBookingsByStudent, 
  getStudentChallenges, 
  getLeaderboards, 
  getStudentStreaks 
} from '@/lib/queries';
import { calculateAge, getAgeBracket } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, LogOut, GraduationCap, Video, BookOpen, Clock, FileText, Sparkles, Bell, CheckCircle2, Award } from 'lucide-react';
import { signout } from '@/app/auth/actions';
import WelcomeHero from '../components/WelcomeHero';
import ClassroomSection from '../components/ClassroomSection';
import SchedulePanel from '../components/SchedulePanel';
import ExplorationPanel from '../components/ExplorationPanel';
import GamificationCenter from '../components/GamificationCenter';
import StudentNavHeader from '../components/StudentNavHeader';
import { Student, BookingWithDetails } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const studentId = params.studentId as string | undefined;

  let student: Student | null = null;
  let bookings: BookingWithDetails[] = [];
  let challengesData: any[] = [];
  let leaderboardData = { allTime: [] as any[], weekly: [] as any[] };
  let streakData = { currentStreak: 0, lastSevenDays: [] as any[] };

  const supabase = await createClient();

  try {
    if (studentId && studentId !== 'demo') {
      const { data: studentData, error: studentErr } = await getStudentById(studentId);
      const { data: bookingsData, error: bookingsErr } = await getBookingsByStudent(studentId);

      if (!studentErr && !bookingsErr && studentData) {
        student = studentData;
        bookings = bookingsData || [];

        const { data: challs } = await getStudentChallenges(student.id);
        if (challs) challengesData = challs;

        const { allTime, weekly } = await getLeaderboards(student.id);
        leaderboardData = { allTime, weekly };

        const { currentStreak, lastSevenDays } = await getStudentStreaks(student.id);
        streakData = { currentStreak, lastSevenDays };
      }
    }
  } catch (err) {
    console.error('Failed to fetch student dashboard details:', err);
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

  const age = calculateAge(student.date_of_birth);
  const ageBracket = getAgeBracket(age);
  const isJunior = ageBracket === 'junior';
  const isTeen = ageBracket === 'teen';

  let activeThemeClass = 'older-kid-theme';
  if (isJunior) {
    activeThemeClass = 'kid-theme';
  } else if (isTeen) {
    activeThemeClass = 'teen-theme';
  }

  const activeBooking = bookings[0];
  const allEarnedBadgeIds = bookings.flatMap(b => b.earned_badges || []);

  // Fetch pending homework due today
  const { data: homeworkDue } = await supabase
    .from('assignments')
    .select('*, courses(title)')
    .order('due_date', { ascending: true })
    .limit(3);

  // Fetch announcements
  const { data: announcements } = await supabase
    .from('notifications')
    .select('*')
    .or(`profile_id.eq.${student.parent_id}`)
    .order('created_at', { ascending: false })
    .limit(2);

  return (
    <div className={activeThemeClass} style={{ transition: 'all 0.5s ease' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Student Navigation Bar */}
        <StudentNavHeader
          studentName={student.first_name}
          studentId={student.id}
          isJunior={isJunior}
          isTeen={isTeen}
          unreadNotificationsCount={announcements?.filter(a => !a.read).length || 0}
        />

        {/* Welcome Header Hero */}
        <WelcomeHero student={student} isJunior={isJunior} isTeen={isTeen} />

        {/* DEL-0064 Quick Dashboard Widgets Row */}
        <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          
          {/* Homework Due Today Widget */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FileText style={{ width: '16px', height: '16px', color: '#10b981' }} /> Homework Due Today
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{homeworkDue?.length || 0} Tasks</span>
            </div>
            {homeworkDue && homeworkDue.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {homeworkDue.slice(0, 2).map((h: any) => (
                  <div key={h.id} style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{h.title}</div>
                    <div>Due: {new Date(h.due_date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>No pending homework due today!</p>
            )}
            <Link href={`/student/dashboard/assignments?studentId=${student.id}`} style={{ fontSize: '0.8rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 600, marginTop: 'auto' }}>
              Open Homework Portal $\rightarrow$
            </Link>
          </div>

          {/* Attendance Summary Widget */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 style={{ width: '16px', height: '16px', color: '#38bdf8' }} /> Attendance Summary
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Good Standing</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {bookings.filter(b => b.attended).length} Classes Attended
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              Keep attending live classes to maintain your academic streak!
            </p>
            <Link href={`/student/progress?studentId=${student.id}`} style={{ fontSize: '0.8rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 600, marginTop: 'auto' }}>
              View Progress & Badges $\rightarrow$
            </Link>
          </div>

          {/* Future AI Learning Assistant Hook Widget */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(232, 28, 255, 0.3)', background: 'rgba(232, 28, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles style={{ width: '16px', height: '16px', color: '#e81cff' }} /> AI Study Assistant (Ready)
              </span>
              <span className="badge badge-pink" style={{ fontSize: '0.65rem' }}>v2 Extension</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              Modular AI study coach extension point. Prepared for interactive homework explanations & revision planning.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#e81cff', fontWeight: 600, marginTop: 'auto' }}>
              ✦ Framework Extension Ready
            </div>
          </div>
        </div>

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

        {/* Live Classroom Section */}
        <ClassroomSection booking={activeBooking} studentName={student.first_name} isJunior={isJunior} />

        {/* Calendar and Logic Panels */}
        <div className="grid-2">
          <SchedulePanel bookings={bookings} isJunior={isJunior} />
          <ExplorationPanel isJunior={isJunior} />
        </div>

      </div>
    </div>
  );
}
