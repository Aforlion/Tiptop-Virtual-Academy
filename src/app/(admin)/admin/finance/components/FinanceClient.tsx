'use client';

import React from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';

interface PaymentData {
  id: string;
  parentName: string;
  packageName: string;
  amount_cents: number;
  status: string;
  reference: string;
  created_at: string;
}

interface FinanceClientProps {
  initialPayments: PaymentData[];
}

export default function FinanceClient({ initialPayments }: FinanceClientProps) {

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'rgba(34, 197, 94, 0.2)'; // green
      case 'pending': return 'rgba(245, 158, 11, 0.2)'; // amber
      case 'failed': return 'rgba(239, 68, 68, 0.2)'; // red
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'success': return '#4ade80';
      case 'pending': return '#fbbf24';
      case 'failed': return '#f87171';
      default: return '#fff';
    }
  };

  const columns: Column<PaymentData>[] = [
    {
      header: 'Date',
      accessor: (payment) => payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Parent Name',
      accessor: (payment) => <span style={{ fontWeight: 500 }}>{payment.parentName}</span>,
    },
    {
      header: 'Package',
      accessor: (payment) => payment.packageName,
    },
    {
      header: 'Amount',
      accessor: (payment) => (
        <span style={{ fontWeight: 600 }}>
          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(payment.amount_cents / 100)}
        </span>
      ),
      align: 'right'
    },
    {
      header: 'Status',
      accessor: (payment) => (
        <span style={{
          background: getStatusBadgeColor(payment.status),
          color: getStatusTextColor(payment.status),
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          {payment.status}
        </span>
      ),
      align: 'center'
    },
    {
      header: 'Reference',
      accessor: (payment) => <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-mono)' }}>{payment.reference}</span>,
    }
  ];

  return (
    <div className="glass-card">
      <DataTable columns={columns} data={initialPayments} emptyMessage="No transactions found." />
    </div>
  );
}
