import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getStudentById } from '@/lib/queries';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CertificatePreview from '@/app/(admin)/admin/certificates/components/CertificatePreview';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentCertificateDetailPage({ params, searchParams }: PageProps) {
  const { courseId } = await params;
  const sParams = await searchParams;
  const studentId = sParams.studentId as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Load template
  const { data: template } = await supabase
    .from('certificate_templates')
    .select(`
      *,
      courses (
        title
      )
    `)
    .eq('course_id', courseId)
    .single();

  let studentName = 'Aiden';
  let courseTitle = template?.courses?.title || 'Creative Coding Foundations';
  let isDemo = true;

  if (studentId && studentId !== 'demo' && studentId !== 'mock-child-id') {
    const { data: studentData } = await getStudentById(studentId);
    if (studentData) {
      studentName = studentData.first_name;
      isDemo = false;
    }
  }

  // Fallback template defaults if none exists yet in the database for this course
  const titleText = template?.title_text || 'Certificate of Completion';
  const bodyText = template?.body_text || 'This certifies that {student_name} has successfully completed {course_title} at Tiptop Virtual Academy with distinction.';
  const signatoryName = template?.signatory_name || 'Barbara Johnson';
  const signatoryTitle = template?.signatory_title || 'Academy Director';
  const accentColor = template?.accent_color || '#7c3aed';

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cert-no-print" style={{ width: '100%', maxWidth: '820px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href={`/student/certificates${studentId ? `?studentId=${studentId}` : ''}`}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Certificates
        </Link>
        {isDemo && (
          <span className="badge badge-purple" style={{ textTransform: 'none' }}>
            Previewing Demo
          </span>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '820px' }}>
        <CertificatePreview
          titleText={titleText}
          bodyText={bodyText}
          signatoryName={signatoryName}
          signatoryTitle={signatoryTitle}
          accentColor={accentColor}
          studentName={studentName}
          courseTitle={courseTitle}
          showPrintButton={true}
        />
      </div>
    </div>
  );
}
