import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import FinanceClient from './components/FinanceClient';

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage() {
  const supabase = await createClient();

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

  // Format data
  const formattedPayments = (payments || []).map(p => ({
    id: p.id,
    parentName: p.profiles ? `${p.profiles.first_name} ${p.profiles.last_name}` : 'Unknown',
    packageName: p.credit_packages?.name || 'Unknown Package',
    amount_cents: p.amount_cents,
    status: p.status,
    reference: p.reference,
    created_at: p.created_at
  }));

  const totalRevenueCents = formattedPayments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <>
      <PageHeader
        title="Finance & Payments"
        subtitle="Audit credit package purchases and revenue metrics."
      />
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Total Revenue</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'hsl(var(--accent-cyan))' }}>
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalRevenueCents / 100)}
          </p>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Successful Transactions</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'hsl(var(--accent-pink))' }}>
            {formattedPayments.filter(p => p.status === 'success').length}
          </p>
        </div>
      </div>
      <FinanceClient initialPayments={formattedPayments} />
    </>
  );
}
