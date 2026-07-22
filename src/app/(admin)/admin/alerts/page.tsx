import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { calculateInstitutionalKPIs } from '@/lib/kpi-engine';
import PageHeader from '@/components/layout/PageHeader';
import AdminNavHeader from '../components/AdminNavHeader';
import ExecutiveAlertsClient from './components/ExecutiveAlertsClient';

export const dynamic = 'force-dynamic';

export default async function ExecutiveAlertsPage() {
  const supabase = await createClient();
  const kpis = await calculateInstitutionalKPIs();

  // Fetch pending google sync retry queue items
  const { data: syncJobs } = await supabase
    .from('google_sync_retry_queue')
    .select('*, live_sessions(meeting_token)')
    .order('created_at', { ascending: false });

  // Generate synthetic prioritized executive alerts based on live system state
  const alerts = [
    ...(syncJobs || []).map(j => ({
      id: j.id,
      category: 'platform',
      priority: j.retry_count > 3 ? 'critical' : 'high',
      title: `Google Workspace Sync Delay: ${j.action_type}`,
      description: j.last_error || 'Asynchronous queue retry scheduled for background worker.',
      created_at: j.created_at,
      status: j.status
    })),
    {
      id: 'alert-fin-1',
      category: 'financial',
      priority: 'high',
      title: 'Outstanding Tuition Invoices',
      description: `₦${kpis.financial.outstandingAmountNgn.toLocaleString()} across ${kpis.financial.outstandingInvoicesCount} pending student enrollments requires billing follow-up.`,
      created_at: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'alert-acad-1',
      category: 'academic',
      priority: 'medium',
      title: 'At-Risk Student Flagging',
      description: `${kpis.academic.atRiskStudentsCount} students require academic support intervention based on attendance trends.`,
      created_at: new Date().toISOString(),
      status: 'pending'
    }
  ];

  return (
    <>
      <AdminNavHeader alertsCount={syncJobs?.length || 0} />

      <PageHeader
        title="Executive Notifications & Alert Command Centre"
        subtitle="Prioritized operational alerts across Academic, Financial, Platform Sync, and Institutional categories."
      />

      <ExecutiveAlertsClient initialAlerts={alerts} />
    </>
  );
}
