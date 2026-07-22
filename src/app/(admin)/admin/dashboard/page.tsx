import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { calculateInstitutionalKPIs } from '@/lib/kpi-engine';
import PageHeader from '@/components/layout/PageHeader';
import AdminNavHeader from '../components/AdminNavHeader';
import Link from 'next/link';
import { Users, GraduationCap, DollarSign, Calendar, Clock, CheckCircle2, AlertTriangle, Sparkles, Activity, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExecutiveDashboardPage() {
  const supabase = await createClient();

  let firstName = 'Barbara';
  let role = 'admin';

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, role')
      .eq('id', user.id)
      .single();
    if (profile) {
      firstName = profile.first_name;
      role = profile.role;
    }
  }

  // Calculate institutional KPIs from single source of truth engine
  const kpis = await calculateInstitutionalKPIs();

  return (
    <>
      <AdminNavHeader role={role} userName={firstName} alertsCount={kpis.operational.googleSyncJobsPending} />

      <PageHeader
        title="Institutional Executive Dashboard"
        subtitle="Real-time operational command center monitoring academic, financial, and platform performance."
      />

      {/* DEL-0070 8 Core Metric Cards */}
      <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <Users style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Total Students</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{kpis.operational.totalStudents}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <GraduationCap style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Active Teachers</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{kpis.operational.teachersCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.75rem', borderRadius: '12px' }}>
            <Users style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Parents Registered</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{kpis.operational.parentsCount}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.75rem', borderRadius: '12px' }}>
            <Clock style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Live Classes Today</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{kpis.operational.liveClassesToday}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <DollarSign style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Revenue This Month</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>₦{kpis.financial.monthlyRevenueNgn.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.75rem', borderRadius: '12px' }}>
            <DollarSign style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Outstanding Invoices</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>₦{kpis.financial.outstandingAmountNgn.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Attendance Rate</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{kpis.operational.attendanceRatePercent}%</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Assignment Completion</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>{kpis.operational.assignmentCompletionRatePercent}%</div>
          </div>
        </div>
      </div>

      {/* DEL-0070 Executive Summary Cards */}
      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        
        {/* Platform & Google Workspace Health Summary */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity style={{ width: '20px', height: '20px', color: '#38bdf8' }} /> System Status & Sync Infrastructure
            </h3>
            <span className={`badge ${kpis.operational.platformHealthStatus === 'healthy' ? 'badge-green' : 'badge-yellow'}`}>
              {kpis.operational.platformHealthStatus.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span>Active Google Workspace Sync Queue:</span>
              <strong style={{ color: kpis.operational.googleSyncJobsPending > 0 ? '#f59e0b' : '#10b981' }}>
                {kpis.operational.googleSyncJobsPending} Pending Jobs
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span>Database Collection Efficiency:</span>
              <strong style={{ color: '#10b981' }}>{kpis.financial.collectionRatePercent}%</strong>
            </div>
          </div>

          <Link href="/admin/alerts" style={{ fontSize: '0.85rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 600, marginTop: 'auto' }}>
            Inspect Executive Alerts & Sync Logs $\rightarrow$
          </Link>
        </div>

        {/* Executive AI Copilot Extension Hook */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(232, 28, 255, 0.3)', background: 'rgba(232, 28, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#e81cff' }} /> Executive AI Copilot (Extension Ready)
            </h3>
            <span className="badge badge-pink" style={{ fontSize: '0.7rem' }}>AI Extension Point</span>
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
            Extensible framework hook for Revenue Forecasting, Enrollment Prediction, Student Risk Prediction, and Automated Executive Briefings.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>✦ Revenue Model v1.4</span>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>✦ Risk Predictor v2.1</span>
          </div>
        </div>
      </div>
    </>
  );
}
