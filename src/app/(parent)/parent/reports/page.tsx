import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { getStudentsByParent } from '@/lib/queries';
import { Student, AssessmentSubmission } from '@/lib/types';
import ParentReportsClient from './components/ParentReportsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentReportsPage({ searchParams }: PageProps) {
  const sParams = await searchParams;
  const activeStudentId = sParams.studentId as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load students linked to this parent
  const { data: students } = await getStudentsByParent(user.id);
  const safeStudents = students || [];

  // Determine active student
  const student = safeStudents.find(s => s.id === activeStudentId) || safeStudents[0];

  let submissions: any[] = [];
  let isDemo = true;

  if (student) {
    // Load assessment submissions for this student
    const { data: subData } = await supabase
      .from('assessment_submissions')
      .select(`
        *,
        assessments (
          title,
          description
        )
      `)
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    if (subData && subData.length > 0) {
      submissions = subData;
      isDemo = false;
    }
  }

  // Seeding mock submissions for demo view
  if (isDemo) {
    submissions = [
      {
        id: 'sub-mock-1',
        score: 40,
        percentage: 80.00,
        correct_count: 3,
        incorrect_count: 1,
        skipped_count: 0,
        time_spent_secs: 240,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        assessments: {
          title: 'Logic & Loop Championship Quiz',
          description: 'Test your logic loop power! Tackle MCQs, fill-in puzzles, and a reading comprehension challenge.'
        },
        responses: [
          { question_id: 'q-1', user_answer: 'For Loop', is_correct: true, question_text: 'Which loop structure is designed to repeat a block of code a set number of times?', question_type: 'mcq_single', difficulty: 'easy', points: 10 },
          { question_id: 'q-2', user_answer: ['break', 'continue'], is_correct: true, question_text: 'Identify all keywords commonly used in loops to alter their standard path:', question_type: 'mcq_multiple', difficulty: 'medium', points: 15 },
          { question_id: 'q-3', user_answer: 'false', is_correct: false, question_text: 'An infinite loop runs forever because its conditional check always resolves to _____.', question_type: 'fill_in', difficulty: 'medium', points: 15, correct_answer: 'true' },
          { question_id: 'q-4', user_answer: 'Because it followed the recursive path back to orbit', is_correct: true, question_text: 'According to the passage, why was ADA-1 able to recover the lost space capsule?', question_type: 'reading', difficulty: 'hard', points: 20 }
        ]
      },
      {
        id: 'sub-mock-2',
        score: 10,
        percentage: 50.00,
        correct_count: 1,
        incorrect_count: 1,
        skipped_count: 0,
        time_spent_secs: 180,
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        assessments: {
          title: 'Introductory Loops Quiz',
          description: 'Basic understanding of code repetitions.'
        },
        responses: [
          { question_id: 'q-1', user_answer: 'For Loop', is_correct: true, question_text: 'Which loop structure is designed to repeat a block of code a set number of times?', question_type: 'mcq_single', difficulty: 'easy', points: 10 },
          { question_id: 'q-3', user_answer: 'never', is_correct: false, question_text: 'An infinite loop runs forever because its conditional check always resolves to _____.', question_type: 'fill_in', difficulty: 'medium', points: 15, correct_answer: 'true' }
        ]
      }
    ];
  }

  // Since DB responses only store IDs, let's load question details for real submissions
  if (!isDemo && submissions.length > 0) {
    const enrichedSubmissions = [];
    for (const sub of submissions) {
      const qIds = sub.responses.map((r: any) => r.question_id);
      const { data: questionData } = await supabase
        .from('assessment_questions')
        .select('*')
        .in('id', qIds);

      const qMap = new Map();
      if (questionData) {
        questionData.forEach(q => qMap.set(q.id, q));
      }

      const enrichedResponses = sub.responses.map((r: any) => {
        const question = qMap.get(r.question_id);
        return {
          ...r,
          question_text: question?.question_text || 'Comprehension Question',
          question_type: question?.question_type || 'mcq_single',
          difficulty: question?.difficulty || 'easy',
          points: question?.points || 10,
          correct_answer: question?.correct_answer
        };
      });

      enrichedSubmissions.push({
        ...sub,
        responses: enrichedResponses
      });
    }
    submissions = enrichedSubmissions;
  }

  return (
    <>
      <PageHeader
        title="Learning Progress & Reports"
        subtitle="Track your child's quiz performance, correct ratio details, and session analytics."
      />

      <ParentReportsClient
        students={safeStudents}
        activeStudent={student || { id: 'mock-child-id', first_name: 'Aiden' }}
        submissions={submissions}
        isDemo={isDemo}
      />
    </>
  );
}
