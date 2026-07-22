import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import { redirect } from 'next/navigation';
import AssignmentManagerClient from './components/AssignmentManagerClient';

export const dynamic = 'force-dynamic';

export default async function TeacherAssignmentsPage() {
  const supabase = await createClient();

  // 1. Authenticate user
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

  // 2. Fetch assignments created by teacher
  let query = supabase
    .from('assignments')
    .select(`
      *,
      courses(title),
      assignment_submissions(*, students(first_name))
    `)
    .order('created_at', { ascending: false });

  if (profile?.role !== 'admin') {
    query = query.eq('teacher_id', user.id);
  }

  const { data: assignments, error: assignErr } = await query;
  if (assignErr) console.error('Error fetching assignments:', assignErr);

  // 3. Fetch courses for creation dropdown
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title', { ascending: true });

  return (
    <>
      <PageHeader
        title="Homework & Assignment Manager"
        subtitle="Author homework assignments, set due dates, attach resources, and publish to Google Classroom & Parent Portal."
      />
      <AssignmentManagerClient
        initialAssignments={assignments || []}
        courses={courses || []}
      />
    </>
  );
}
