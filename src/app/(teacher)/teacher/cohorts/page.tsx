import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import CohortsClient from './components/CohortsClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TeacherCohortsPage() {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    redirect('/login');
  }

  // Get distinct courses this teacher is assigned to (via live_sessions)
  const { data: sessionsData } = await supabase
    .from('live_sessions')
    .select('course_id, courses(id, title, min_age, max_age)')
    .eq('teacher_id', user.id)
    .eq('session_type', 'cohort');

  // Deduplicate courses by ID
  const courseMap = new Map<string, { id: string; title: string; min_age: number; max_age: number }>();
  for (const s of sessionsData || []) {
    const c = s.courses as unknown as { id: string; title: string; min_age: number; max_age: number } | null;
    if (c && !courseMap.has(c.id)) courseMap.set(c.id, c);
  }
  const courses = Array.from(courseMap.values());

  // For each course, fetch cohort enrollments + student info
  const courseIds = courses.map(c => c.id);
  let enrollments: any[] = [];

  if (courseIds.length > 0) {
    const { data: enrData, error: enrErr } = await supabase
      .from('cohort_enrollments')
      .select(`
        id,
        student_id,
        course_id,
        enrolled_at,
        students ( id, first_name, date_of_birth ),
        courses ( id, title )
      `)
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false });

    if (enrErr) console.error('Failed to fetch cohort enrollments:', enrErr);
    enrollments = enrData || [];
  }

  // Get all students who belong to parents (for the enrol-new-student dropdown)
  const { data: allStudents } = await supabase
    .from('students')
    .select('id, first_name, date_of_birth')
    .order('first_name', { ascending: true });

  return (
    <>
      <PageHeader
        title="Cohort Rosters"
        subtitle="Manage long-term cohort enrolments for your assigned courses."
      />
      <CohortsClient
        courses={courses}
        enrollments={enrollments}
        allStudents={allStudents || []}
      />
    </>
  );
}
