import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getStudentById } from '@/lib/queries';
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

  // Resolve student info for age adaptations
  let studentName = 'Aiden';
  let studentDOB = '2021-08-14'; // default to kid theme age (3-6)
  let resolvedStudentId = studentId || 'mock-child-id';

  if (studentId && studentId !== 'demo' && studentId !== 'mock-child-id') {
    const { data: studentData } = await getStudentById(studentId);
    if (studentData) {
      studentName = studentData.first_name;
      studentDOB = studentData.date_of_birth;
      resolvedStudentId = studentData.id;
    }
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
