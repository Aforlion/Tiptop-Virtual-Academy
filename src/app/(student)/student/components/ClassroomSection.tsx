import React from 'react';
import ClassroomDock from '@/components/classroom/ClassroomDock';
import { Video } from 'lucide-react';
import { BookingWithDetails } from '@/lib/types';
import { isSessionStartingSoon } from '@/lib/utils';

interface ClassroomSectionProps {
  booking: BookingWithDetails | null;
  studentName: string;
  isJunior: boolean;
}

export default function ClassroomSection({ booking, studentName, isJunior }: ClassroomSectionProps) {
  if (!booking) return null;

  const session = booking.live_sessions;
  if (!session) return null;

  const startsSoon = isSessionStartingSoon(session.scheduled_start, session.scheduled_end);

  if (!startsSoon) {
    return (
      <div className="glass-card" style={{ marginBottom: '3rem', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: isJunior ? '#ff7e5f' : '#22d3ee', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {isJunior ? '🧸 Your playroom is resting' : '🛸 Secured Uplink Offline'}
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
          Your class is scheduled for {new Date(session.scheduled_start).toLocaleString()}. Return here 10 minutes before class starts!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ marginBottom: '3rem' }}>
      <h2 style={{
        fontSize: isJunior ? '2rem' : '1.5rem',
        fontWeight: 800,
        marginBottom: '1.5rem',
        fontFamily: 'var(--font-display)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isJunior ? 'center' : 'flex-start',
        gap: '0.5rem',
        color: isJunior ? '#1e1b4b' : '#22d3ee'
      }}>
        <Video style={{ width: '28px', height: '28px', color: isJunior ? '#ff7e5f' : '#22d3ee' }} />
        {isJunior ? '🚀 Your Live Playroom Dock' : '🛸 Secured Video Classroom Uplink'}
      </h2>

      <ClassroomDock 
        meetingToken={session.meeting_token} 
        studentName={studentName} 
        isJunior={isJunior} 
      />
    </div>
  );
}
