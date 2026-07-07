import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { Award, ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { getStudentById } from '@/lib/queries';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentCertificatesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const studentId = params.studentId as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch profiles role to verify if parent, admin, or student
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let resolvedStudentId = studentId;

  // If role is student, resolve student record for this user
  if (profile?.role === 'student') {
    const { data: studentRecord } = await supabase
      .from('students')
      .select('id')
      .eq('parent_id', user.id) // Or if students have direct user link, but here parent_id is used.
      .limit(1)
      .single();
    resolvedStudentId = studentRecord?.id;
  }

  // Fallback student info if none found or in demo mode
  let studentName = 'Aiden';
  let isDemo = true;
  let earnedCertificates: any[] = [];

  if (resolvedStudentId && resolvedStudentId !== 'mock-child-id') {
    const { data: studentData } = await getStudentById(resolvedStudentId);
    if (studentData) {
      studentName = studentData.first_name;
      isDemo = false;

      // Fetch attended bookings
      const { data: bookings } = await supabase
        .from('student_bookings')
        .select(`
          attended,
          live_sessions (
            course_id,
            courses (
              id,
              title,
              description
            )
          )
        `)
        .eq('student_id', resolvedStudentId)
        .eq('attended', true);

      // Unique courses attended
      const courseMap = new Map<string, any>();
      if (bookings) {
        bookings.forEach((b: any) => {
          const course = b.live_sessions?.courses;
          if (course) {
            courseMap.set(course.id, course);
          }
        });
      }

      const attendedCourseIds = Array.from(courseMap.keys());

      if (attendedCourseIds.length > 0) {
        // Fetch matching certificate templates
        const { data: templates } = await supabase
          .from('certificate_templates')
          .select('*')
          .in('course_id', attendedCourseIds);

        if (templates) {
          earnedCertificates = templates.map(t => ({
            ...t,
            course_title: courseMap.get(t.course_id)?.title || 'Completed Course',
            course_description: courseMap.get(t.course_id)?.description || '',
          }));
        }
      }
    }
  }

  return (
    <>
      <PageHeader
        title={studentName ? `${studentName}'s Certificates` : 'Certificates'}
        subtitle="View and print earned course completion certificates."
        action={
          <Link
            href={`/student/dashboard${resolvedStudentId ? `?studentId=${resolvedStudentId}` : ''}`}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Dashboard
          </Link>
        }
      />

      {earnedCertificates.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Award style={{ width: '48px', height: '48px', color: 'hsl(var(--text-muted))', margin: '0 auto 1.5rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>No Certificates Earned Yet</h3>
          <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '400px', margin: '0 auto' }}>
            Official certificates will appear here once you complete all class sessions and quizzes in a course pathway.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {earnedCertificates.map(cert => (
            <div key={cert.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between', gap: '1.5rem', borderLeft: `6px solid ${cert.accent_color}` }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <span className="badge" style={{ background: `${cert.accent_color}18`, color: cert.accent_color, border: `1px solid ${cert.accent_color}33` }}>
                    Completed
                  </span>
                  <Award style={{ width: '24px', height: '24px', color: cert.accent_color }} />
                </div>
                <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{cert.course_title}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {cert.course_description || 'No description available.'}
                </p>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                <Link
                  href={`/student/certificates/${cert.course_id}?studentId=${resolvedStudentId}`}
                  className="btn-premium"
                  style={{ flex: 1, textShadow: 'none', background: cert.accent_color, boxShadow: `0 4px 14px ${cert.accent_color}44` }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  View &amp; Print
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
