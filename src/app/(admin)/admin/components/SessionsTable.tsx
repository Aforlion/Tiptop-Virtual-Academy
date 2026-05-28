'use client';

import React, { useTransition } from 'react';
import { deleteLiveSession } from '@/app/admin/actions';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { LiveSessionWithCourse } from '@/lib/types';
import { formatSessionDate } from '@/lib/utils';

interface SessionsTableProps {
  sessions: LiveSessionWithCourse[];
  schemaError?: boolean;
}

export default function SessionsTable({ sessions, schemaError = false }: SessionsTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this live session?')) {
      startTransition(async () => {
        const result = await deleteLiveSession(id);
        if (!result.success) {
          alert(result.error);
        }
      });
    }
  };

  const columns: Column<LiveSessionWithCourse>[] = [
    {
      header: 'Course Title',
      accessor: (row) => <span style={{ fontWeight: 600 }}>{row.courses?.title || 'Unknown Course'}</span>,
    },
    {
      header: 'Teacher',
      accessor: (row) => row.teacher_name,
    },
    {
      header: 'Date & Time',
      accessor: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--text-secondary))' }}>
          <Clock style={{ width: '14px', height: '14px', color: 'hsl(var(--accent-pink))' }} />
          {formatSessionDate(row.scheduled_start)}
        </span>
      ),
    },
    {
      header: 'Session Type',
      accessor: (row) => (
        <span className={`badge ${row.session_type === 'cohort' ? 'badge-blue' : 'badge-purple'}`}>
          {row.session_type}
        </span>
      ),
    },
    {
      header: 'Meeting Room',
      accessor: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
          {row.meeting_token}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          disabled={schemaError || isPending}
          className="btn-danger"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: schemaError ? 0.5 : 1 }}
        >
          <Trash2 style={{ width: '14px', height: '14px' }} />
        </button>
      ),
    },
  ];

  return (
    <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-purple))' }} /> Active Scheduled Live Classes
      </h2>
      <DataTable 
        columns={columns} 
        data={sessions} 
        emptyMessage="No live sessions scheduled. Associate sessions above!" 
      />
    </div>
  );
}
