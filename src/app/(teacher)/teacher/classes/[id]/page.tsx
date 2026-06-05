import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import AttendanceClient from './components/AttendanceClient';
import ChatPanel from './components/ChatPanel';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherClassPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Get logged in user and role
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';

  if (!isAdmin && !isTeacher) {
    redirect('/login');
  }

  // 2. Fetch session details
  const { data: session, error: sessionErr } = await supabase
    .from('live_sessions')
    .select(`
      *,
      courses(*)
    `)
    .eq('id', id)
    .single();

  if (sessionErr || !session) {
    notFound();
  }

  // 3. Verify user is assigned teacher or an admin
  const isAssignedTeacher = session.teacher_id === user.id;
  if (!isAssignedTeacher && !isAdmin) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You are not authorized to manage attendance for this session.</p>
      </div>
    );
  }

  // 4. Fetch bookings for this session
  const { data: bookings, error: bookingsErr } = await supabase
    .from('student_bookings')
    .select(`
      id,
      student_id,
      attended,
      earned_badges,
      students (
        first_name,
        parent_id
      )
    `)
    .eq('session_id', id);

  if (bookingsErr) {
    console.error('Error fetching bookings:', bookingsErr);
  }

  const formattedBookings = (bookings || []).map(b => {
    const studentInfo = Array.isArray(b.students) ? b.students[0] : b.students;
    return {
      id: b.id,
      student_id: b.student_id,
      attended: b.attended || false,
      earned_badges: b.earned_badges || [],
      students: studentInfo ? {
        first_name: studentInfo.first_name,
        parent_id: studentInfo.parent_id
      } : null
    };
  });

  const startDate = new Date(session.scheduled_start);
  const formattedDate = startDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = startDate.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <>
      <PageHeader
        title="Class Attendance & Rewards"
        subtitle="Mark student attendance and award achievement badges for this live session."
        action={
          <Link href="/teacher/dashboard" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Console
          </Link>
        }
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }} className="teacher-class-layout">
        <div>
          <AttendanceClient
            sessionId={session.id}
            initialBookings={formattedBookings}
            courseTitle={session.courses?.title || 'Unknown Course'}
            sessionTime={`${formattedDate} at ${formattedTime}`}
            sessionType={session.session_type}
          />
        </div>
        <div>
          <ChatPanel
            sessionId={session.id}
            currentUserId={user.id}
            currentUserRole={profile?.role || 'teacher'}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .teacher-class-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
