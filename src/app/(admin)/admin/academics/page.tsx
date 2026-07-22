import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { calculateInstitutionalKPIs } from '@/lib/kpi-engine';
import PageHeader from '@/components/layout/PageHeader';
import AdminNavHeader from '../components/AdminNavHeader';
import { GraduationCap, BookOpen, Clock, AlertTriangle, CheckCircle2, Award, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAcademicsPage() {
  const supabase = await createClient();
  const kpis = await calculateInstitutionalKPIs();

  // Fetch curriculum subjects
  const { data: subjects } = await supabase.from('curriculum_subjects').select('*');

  return (
    <>
      <AdminNavHeader />

      <PageHeader
        title="Academic Operations Dashboard"
        subtitle="Institutional curriculum delivery metrics, teacher workload analytics, attendance trends, and at-risk student monitoring."
      />

      {/* Curriculum & Teaching Overview Banner */}
      <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <BookOpen style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Curriculum Coverage</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{kpis.academic.curriculumCoveragePercent}%</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Lessons Delivered</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{kpis.academic.lessonsDelivered}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}>
            <Clock style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Avg Teacher Workload</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{kpis.academic.averageTeacherWorkloadHours} hrs/wk</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.75rem', borderRadius: '12px' }}>
            <AlertTriangle style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>At-Risk Students</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>{kpis.academic.atRiskStudentsCount}</div>
          </div>
        </div>
      </div>

      {/* Curriculum Coverage Breakdown & Attendance Trends */}
      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700, fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen style={{ width: '20px', height: '20px', color: '#38bdf8' }} /> Subject Curriculum Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subjects?.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{s.name} ({s.code})</div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Category: {s.category}</div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>On Schedule</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700, fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ width: '20px', height: '20px', color: '#10b981' }} /> Weekly Attendance Trend (%)
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', paddingTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {kpis.academic.studentAttendanceTrend.map(t => (
              <div key={t.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{t.rate}%</span>
                <div style={{ height: `${t.rate * 0.9}px`, width: '28px', background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{t.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
