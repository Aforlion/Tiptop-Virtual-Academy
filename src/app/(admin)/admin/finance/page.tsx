import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { calculateInstitutionalKPIs } from '@/lib/kpi-engine';
import PageHeader from '@/components/layout/PageHeader';
import AdminNavHeader from '../components/AdminNavHeader';
import FinanceClient from './components/FinanceClient';
import { DollarSign, CheckCircle2, AlertTriangle, PieChart, TrendingUp, Percent } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage() {
  const supabase = await createClient();
  const kpis = await calculateInstitutionalKPIs();

  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      profiles:parent_id(first_name, last_name),
      credit_packages:package_id(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch payments:', error);
  }

  const formattedPayments = (payments || []).map(p => ({
    id: p.id,
    parentName: p.profiles ? `${p.profiles.first_name} ${p.profiles.last_name}` : 'Unknown Parent',
    packageName: p.credit_packages?.name || 'Guided Tuition Product',
    amount_cents: p.amount_cents,
    status: p.status,
    reference: p.reference,
    created_at: p.created_at
  }));

  return (
    <>
      <AdminNavHeader />

      <PageHeader
        title="Executive Finance & Revenue Dashboard"
        subtitle="Real-time revenue monitoring, tuition billing collection rates, overdue balance audits, and payment transaction logs."
      />

      {/* DEL-0073 Financial Metric Cards */}
      <div className="grid-4" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
            <DollarSign style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Monthly Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>₦{kpis.financial.monthlyRevenueNgn.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle2 style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Collection Rate</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{kpis.financial.collectionRatePercent}%</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.75rem', borderRadius: '12px' }}>
            <AlertTriangle style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Outstanding Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>₦{kpis.financial.outstandingAmountNgn.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.75rem', borderRadius: '12px' }}>
            <Percent style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', fontWeight: 600 }}>Discount Utilization</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e81cff' }}>{kpis.financial.discountUtilizationPercent}%</div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown By Product */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
        Revenue Breakdown by Academic Programme
      </h3>

      <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {kpis.financial.revenueByProduct.map(p => (
          <div key={p.name} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>{p.name}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>₦{Math.round(p.amountNgn).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Transactions Audit Ledger */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
        Recent Payment Transactions
      </h3>
      <FinanceClient initialPayments={formattedPayments} />
    </>
  );
}
