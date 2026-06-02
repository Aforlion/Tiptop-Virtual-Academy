import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import LessonPlansClient from './components/LessonPlansClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TeacherLessonsPage() {
  const supabase = await createClient();

  // 1. Get logged in user and verify role
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

  // 2. Fetch lesson plans owned by this teacher
  // (Or all if admin, but typically teacher_id = user.id)
  let plansQuery = supabase
    .from('lesson_plans')
    .select(`
      *,
      courses(title)
    `)
    .order('created_at', { ascending: false });

  if (!isAdmin) {
    plansQuery = plansQuery.eq('teacher_id', user.id);
  }

  const { data: plans, error: plansErr } = await plansQuery;

  if (plansErr) {
    console.error('Error fetching lesson plans:', plansErr);
  }

  // 3. Fetch courses list for blueprint select dropdown
  const { data: courses, error: coursesErr } = await supabase
    .from('courses')
    .select('id, title')
    .eq('is_published', true)
    .order('title', { ascending: true });

  if (coursesErr) {
    console.error('Error fetching courses for select:', coursesErr);
  }

  return (
    <>
      <PageHeader
        title="Lesson Plans Blueprint"
        subtitle="Design, organize, and reference your curriculum guidelines, exercises, and lesson notes."
      />
      <LessonPlansClient 
        initialPlans={plans || []} 
        courses={courses || []} 
      />
    </>
  );
}
