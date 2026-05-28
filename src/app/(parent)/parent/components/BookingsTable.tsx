'use client';

import React, { useTransition } from 'react';
import { deleteBooking } from '@/app/parent/actions';
import { Calendar, Clock } from 'lucide-react';
import DataTable, { Column } from '@/components/ui/DataTable';
import { BookingWithDetails } from '@/lib/types';
import { formatSessionDate } from '@/lib/utils';

interface BookingsTableProps {
  bookings: BookingWithDetails[];
  parentId: string;
  schemaError?: boolean;
}

export default function BookingsTable({ bookings, parentId, schemaError = false }: BookingsTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this live session booking? Your credit will be refunded.')) {
      startTransition(async () => {
        const result = await deleteBooking(bookingId, parentId);
        if (!result.success) {
          alert(result.error);
        }
      });
    }
  };

  const columns: Column<BookingWithDetails>[] = [
    {
      header: 'Student',
      accessor: (row) => <span style={{ fontWeight: 600, color: 'hsl(var(--accent-pink))' }}>{row.students?.first_name || 'My Child'}</span>,
    },
    {
      header: 'Class Title',
      accessor: (row) => <span style={{ fontWeight: 600 }}>{row.live_sessions?.courses?.title || 'Live Session'}</span>,
    },
    {
      header: 'Teacher',
      accessor: (row) => row.live_sessions?.teacher_name || 'Ms. Barbara',
    },
    {
      header: 'Date & Time',
      accessor: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--text-secondary))' }}>
          <Clock style={{ width: '14px', height: '14px', color: 'hsl(var(--accent-purple))' }} />
          {row.live_sessions?.scheduled_start ? formatSessionDate(row.live_sessions.scheduled_start) : 'Scheduled'}
        </span>
      ),
    },
    {
      header: 'Meeting Room',
      accessor: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
          {row.live_sessions?.meeting_token || 'room-astro'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <button
          onClick={() => handleCancel(row.id)}
          disabled={schemaError || isPending}
          className="btn-danger"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: schemaError ? 0.5 : 1 }}
        >
          Cancel Session
        </button>
      ),
    },
  ];

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar style={{ width: '24px', height: '24px', color: 'hsl(var(--accent-purple))' }} /> Registered Class Reservations
      </h2>
      <DataTable 
        columns={columns} 
        data={bookings} 
        emptyMessage="No active live class bookings. Choose a class to get started!" 
      />
    </div>
  );
}
