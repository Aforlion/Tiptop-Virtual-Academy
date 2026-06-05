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

  // Seed mock certificates if in demo mode or no real ones earned yet
  if (isDemo || earnedCertificates.length === 0) {
    earnedCertificates = [
      {
        id: 'cert-demo-1',
        course_id: 'c1',
        title_text: 'Certificate of Achievement',
        body_text: 'This certifies that {student_name} has successfully completed the curriculum for Creative Coding Foundations.',
        signatory_name: 'Barbara Johnson',
        signatory_title: 'Academy Director',
        accent_color: '#7c3aed',
        course_title: 'Creative Coding Foundations',
        course_description: 'Introduction to JavaScript programming, logic loops, and interactive art.'
      },
      {
        id: 'cert-demo-2',
        course_id: 'c2',
        title_text: 'Honorary Graduate',
        body_text: 'This certifies that {student_name} has successfully navigated the challenges of Cosmic Astrophysics for Tiny Minds.',
        signatory_name: 'Dr. Sarah Patel',
        signatory_title: 'Lead Astrophysicist',
        accent_color: '#06b6d4',
        course_title: 'Cosmic Astrophysics for Tiny Minds',
        course_description: 'An introductory tour of our solar system, gravity, and cosmic anomalies.'
      }
    ];
  }

  return (
    <>
      <PageHeader
        title={`${studentName}'s Certificates`}
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

      {isDemo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem', borderRadius: 'var(--radius-lg)',
          background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)',
          color: '#f59e0b', marginBottom: '2rem', fontSize: '0.9rem'
        }}>
          <ShieldAlert style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          <div>
            <strong>Demo View:</strong> You are viewing sample completion certificates. Earn official certificates by booking, attending classes, and completing course pathways.
          </div>
        </div>
      )}

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
                href={`/student/certificates/${cert.course_id}?studentId=${resolvedStudentId || 'demo'}`}
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
    </>
  );
}
