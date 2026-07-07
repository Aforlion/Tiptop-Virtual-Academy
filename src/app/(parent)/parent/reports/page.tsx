import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
  const isDemo = false;

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
    }
  }

  // Since DB responses only store IDs, let's load question details for real submissions
  if (submissions.length > 0) {
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

      {safeStudents.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>No Registered Children Found</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Please register your child first to access learning progress reports and metrics.
          </p>
          <Link href="/parent/dashboard" className="btn-premium">Register Student</Link>
        </div>
      ) : (
        <ParentReportsClient
          students={safeStudents}
          activeStudent={student}
          submissions={submissions}
          isDemo={isDemo}
        />
      )}
    </>
  );
}
