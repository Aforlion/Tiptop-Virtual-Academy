import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getStudentById } from '@/lib/queries';
import StudentNavHeader from '../components/StudentNavHeader';
import { BookOpen, Award, FileText, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { calculateAge, getAgeBracket } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentLearningHubPage({ searchParams }: PageProps) {
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

  // Fetch enrolled courses & cohort enrollments
  const { data: enrollments } = await supabase
    .from('cohort_enrollments')
    .select('*, courses(*)')
    .eq('student_id', student.id);

  // Fetch British curriculum subjects and topics
  const { data: subjects } = await supabase
    .from('curriculum_subjects')
    .select('*, subject_topics(*, learning_objectives(*))');

  // Fetch lesson plans / teaching materials created for courses
  const { data: lessonPlans } = await supabase
    .from('lesson_plans')
    .select('*, courses(title)');

  const enrolledCourses = enrollments?.map(e => e.courses) || [];

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
            My Learning Hub & Curriculum Roadmap
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Browse your enrolled subjects, curriculum objectives, teacher materials, and lesson blueprints.
          </p>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BookOpen style={{ width: '20px', height: '20px', color: '#38bdf8' }} /> Enrolled Subjects & Cohorts
      </h3>

      {enrolledCourses.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>No active subject enrollments found.</p>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {enrolledCourses.map((c: any) => (
            <div key={c?.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span className="badge badge-purple" style={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}>
                Ages {c?.min_age}-{c?.max_age}
              </span>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{c?.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{c?.description || 'British Curriculum Course'}</p>
            </div>
          ))}
        </div>
      )}

      {/* British Curriculum Framework & Topics */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award style={{ width: '20px', height: '20px', color: '#e81cff' }} /> National British Curriculum Roadmap
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {subjects?.map((sub: any) => (
          <div key={sub.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {sub.name} ({sub.code})
              </h4>
              <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{sub.category}</span>
            </div>

            {sub.subject_topics && sub.subject_topics.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sub.subject_topics.map((t: any) => (
                  <div key={t.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#38bdf8' }}>Term {t.term_number}: {t.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '0.2rem' }}>{t.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>Core curriculum objectives loaded.</p>
            )}
          </div>
        ))}
      </div>

      {/* Teacher Uploaded Lesson Plans & Materials */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText style={{ width: '20px', height: '20px', color: '#10b981' }} /> Teacher Lesson Materials & Notes
      </h3>

      {lessonPlans && lessonPlans.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessonPlans.map((plan: any) => (
            <div key={plan.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{plan.title}</h4>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{plan.courses?.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                {plan.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No teacher lesson notes uploaded yet.
        </div>
      )}
    </div>
  );
}
