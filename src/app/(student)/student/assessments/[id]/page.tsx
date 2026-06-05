import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { calculateAge } from '@/lib/utils';
import QuizPlayer from './components/QuizPlayer';
import { Assessment, AssessmentQuestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentQuizPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const studentId = sParams.studentId as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load assessment metadata
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (!assessment) {
    notFound();
  }

  // Load questions
  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('assessment_id', id)
    .order('created_at', { ascending: true });

  const safeQuestions = (questions as AssessmentQuestion[]) || [];

  // Fetch caller's profile to determine role
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isPrivileged = callerProfile?.role === 'admin' || callerProfile?.role === 'teacher';

  // Resolve student for age-adaptation — with ownership guard (CVE-2 Fix)
  let studentName = 'Student';
  let studentDOB = '2015-01-01'; // default to older-kid bracket
  let resolvedStudentId = '';

  if (studentId && studentId !== 'demo') {
    // ── CVE-2: Verify ownership ─────────────────────────────────────────────
    // Build a query for the student. Supabase RLS already filters by parent_id
    // for non-admin users, but we add an explicit ownership check here for
    // defence-in-depth — the server-action layer also re-verifies on submission.
    const studentQuery = supabase
      .from('students')
      .select('id, first_name, date_of_birth, parent_id')
      .eq('id', studentId);

    // For non-privileged users, add an explicit parent ownership filter
    if (!isPrivileged) {
      studentQuery.eq('parent_id', user.id);
    }

    const { data: studentData, error: studentErr } = await studentQuery.single();

    if (studentErr || !studentData) {
      // Student not found OR does not belong to this parent → hard 404
      notFound();
    }

    studentName = studentData.first_name;
    studentDOB = studentData.date_of_birth;
    resolvedStudentId = studentData.id;
    // ── End ownership check ─────────────────────────────────────────────────
  } else if (studentId === 'demo' && isPrivileged) {
    // Demo mode: only available to admins/teachers for content previewing
    studentName = 'Demo Student';
    studentDOB = '2015-06-01';
    resolvedStudentId = 'demo';
  } else {
    // No valid studentId — cannot render the quiz
    redirect('/parent/dashboard');
  }

  // Bracket logic matching Rule 3: Age Adaptation
  const age = calculateAge(studentDOB);
  const ageBracket = age >= 7 ? 'older-kid' : 'kid';

  return (
    <QuizPlayer
      assessment={assessment as Assessment}
      questions={safeQuestions}
      studentId={resolvedStudentId}
      studentName={studentName}
      ageBracket={ageBracket}
    />
  );
}
