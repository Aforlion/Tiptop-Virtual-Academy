import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import CertificateDesigner from './components/CertificateDesigner';
import { ScrollText } from 'lucide-react';
import { Course, CertificateTemplate } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminCertificatesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/login');

  // Fetch all published courses and existing templates in parallel
  const [{ data: courses }, { data: templates }] = await Promise.all([
    supabase.from('courses').select('*').eq('published', true).order('title'),
    supabase
      .from('certificate_templates')
      .select('*, courses(title)')
      .order('created_at', { ascending: false }),
  ]);

  const safeCourses  = (courses  as Course[]          ) ?? [];
  const safeTemplates= (templates as CertificateTemplate[]) ?? [];

  return (
    <>
      <PageHeader
        title="Certificate Designer"
        subtitle="Design branded completion certificates for each course. Students can download them as PDFs."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399', fontSize: '0.875rem', fontWeight: 600,
            }}>
              <ScrollText style={{ width: '16px', height: '16px' }} />
              {safeTemplates.length} template{safeTemplates.length !== 1 ? 's' : ''} saved
            </div>
          </div>
        }
      />

      {safeCourses.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
          <h3>No Published Courses</h3>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            Publish at least one course to create a certificate template.
          </p>
        </div>
      ) : (
        <CertificateDesigner courses={safeCourses} templates={safeTemplates} />
      )}
    </>
  );
}
