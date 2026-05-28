import React from 'react';
import { Calendar } from 'lucide-react';
import { BookingWithDetails } from '@/lib/types';
import { formatSessionDate } from '@/lib/utils';

interface SchedulePanelProps {
  bookings: BookingWithDetails[];
  isJunior: boolean;
}

export default function SchedulePanel({ bookings, isJunior }: SchedulePanelProps) {
  // Take first 3 bookings for display
  const displayBookings = bookings.slice(0, 3);

  return (
    <div className="glass-card">
      <h2 style={{
        fontSize: isJunior ? '1.75rem' : '1.35rem',
        fontWeight: 800,
        marginBottom: '1.25rem',
        fontFamily: 'var(--font-display)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: isJunior ? '#ff7e5f' : '#818cf8'
      }}>
        <Calendar style={{ width: '22px', height: '22px' }} />
        {isJunior ? '📅 My Learning Calendar' : '📅 Flight Timetable Overview'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayBookings.map((booking, index) => {
          const session = booking.live_sessions;
          const course = session?.courses;
          const emoji = isJunior ? (index === 0 ? '🦄' : index === 1 ? '🎨' : '🧩') : (index === 0 ? '🛰️' : index === 1 ? '🧬' : '👾');

          return (
            <div 
              key={booking.id}
              style={{
                background: isJunior ? 'white' : 'rgba(255,255,255,0.02)',
                border: isJunior ? '3px solid #ffe4e6' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                opacity: index > 0 ? 0.6 : 1
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
              <div>
                <h4 style={{ fontWeight: 700, color: isJunior ? '#1e1b4b' : 'white' }}>
                  {course?.title || 'Live Learning Session'}
                </h4>
                <p style={{ color: isJunior ? '#475569' : 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  Hosted by {session?.teacher_name || 'Ms. Barbara'} • {session?.scheduled_start ? formatSessionDate(session.scheduled_start) : 'Scheduled'}
                </p>
              </div>
            </div>
          );
        })}

        {bookings.length === 0 && (
          <div style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
            No sessions scheduled yet. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
