'use client';

import React, { useState } from 'react';
import { UserCheck, Award, AlertCircle, Save, Check } from 'lucide-react';
import { submitAttendanceAndBadges, BookingAttendanceInput } from '@/app/teacher/actions';

export interface StudentBookingItem {
  bookingId: string;
  studentId: string;
  studentName: string;
  parentName?: string;
  attended: boolean;
  attendanceStatus?: 'present' | 'late' | 'absent' | 'excused';
  connectionStatus?: 'joined' | 'never_joined' | 'disconnected_early';
  earnedBadges?: string[];
}

interface AttendanceConsoleProps {
  sessionId: string;
  bookings: StudentBookingItem[];
}

const BADGE_OPTIONS = [
  '⭐ Star Learner',
  '🔥 Top Participation',
  '🚀 Quick Problem Solver',
  '📚 Homework Champion',
  '🎯 100% Focused'
];

export default function AttendanceConsole({ sessionId, bookings }: AttendanceConsoleProps) {
  const [attendanceState, setAttendanceState] = useState<Record<string, {
    attended: boolean;
    attendanceStatus: 'present' | 'late' | 'absent' | 'excused';
    connectionStatus: 'joined' | 'never_joined' | 'disconnected_early';
    badges: string[];
  }>>(() => {
    const initialState: Record<string, any> = {};
    bookings.forEach(b => {
      initialState[b.bookingId] = {
        attended: b.attended ?? true,
        attendanceStatus: b.attendanceStatus || (b.attended ? 'present' : 'absent'),
        connectionStatus: b.connectionStatus || (b.attended ? 'joined' : 'never_joined'),
        badges: b.earnedBadges || []
      };
    });
    return initialState;
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStatusChange = (bookingId: string, status: 'present' | 'late' | 'absent' | 'excused') => {
    setAttendanceState(prev => {
      const isAttended = status === 'present' || status === 'late';
      const defaultConn = status === 'absent' ? 'never_joined' : (prev[bookingId]?.connectionStatus === 'never_joined' ? 'joined' : prev[bookingId]?.connectionStatus || 'joined');

      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          attended: isAttended,
          attendanceStatus: status,
          connectionStatus: defaultConn
        }
      };
    });
  };

  const handleConnectionChange = (bookingId: string, conn: 'joined' | 'never_joined' | 'disconnected_early') => {
    setAttendanceState(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        connectionStatus: conn
      }
    }));
  };

  const toggleBadge = (bookingId: string, badge: string) => {
    setAttendanceState(prev => {
      const currentBadges = prev[bookingId]?.badges || [];
      const updated = currentBadges.includes(badge)
        ? currentBadges.filter(b => b !== badge)
        : [...currentBadges, badge];
      return {
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          badges: updated
        }
      };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setToast(null);

    const payload: BookingAttendanceInput[] = Object.entries(attendanceState).map(([bId, val]) => ({
      bookingId: bId,
      attended: val.attended,
      attendanceStatus: val.attendanceStatus,
      connectionStatus: val.connectionStatus,
      badges: val.badges
    }));

    const result = await submitAttendanceAndBadges(sessionId, payload);
    setSaving(false);

    if (result.success) {
      setToast({ type: 'success', text: result.message || 'Attendance & badges saved successfully!' });
    } else {
      setToast({ type: 'error', text: result.error || 'Failed to save attendance.' });
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck style={{ width: '22px', height: '22px', color: '#38bdf8' }} /> In-Class Attendance & Performance Console
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Record student attendance status, connection behavior, and award badges. Updates sync automatically to Parent Portal.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || bookings.length === 0}
          className="btn-premium"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <Save style={{ width: '18px', height: '18px' }} />
          {saving ? 'Saving & Notifying...' : 'Save & Publish to Parents'}
        </button>
      </div>

      {toast && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {toast.text}
        </div>
      )}

      {bookings.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No enrolled students found for this class session.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map(b => {
            const current = attendanceState[b.bookingId] || {
              attended: true,
              attendanceStatus: 'present',
              connectionStatus: 'joined',
              badges: []
            };

            return (
              <div
                key={b.bookingId}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{b.studentName}</h4>
                    {b.parentName && <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Parent: {b.parentName}</span>}
                  </div>

                  {/* 4-State Attendance Radio Pill */}
                  <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
                    {(['present', 'late', 'absent', 'excused'] as const).map(st => {
                      const isActive = current.attendanceStatus === st;
                      let activeBg = '#10b981';
                      if (st === 'late') activeBg = '#f59e0b';
                      if (st === 'absent') activeBg = '#ef4444';
                      if (st === 'excused') activeBg = '#8b5cf6';

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(b.bookingId, st)}
                          style={{
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            background: isActive ? activeBg : 'transparent',
                            color: isActive ? '#fff' : 'hsl(var(--text-secondary))',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Connection Status Metadata */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Connection Status:</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['joined', 'never_joined', 'disconnected_early'] as const).map(conn => {
                      const isConnActive = current.connectionStatus === conn;
                      return (
                        <button
                          key={conn}
                          type="button"
                          onClick={() => handleConnectionChange(b.bookingId, conn)}
                          style={{
                            border: `1px solid ${isConnActive ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                            background: isConnActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            color: isConnActive ? '#38bdf8' : 'hsl(var(--text-secondary))',
                            borderRadius: '6px',
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {conn.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Badge Allocation Row */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <Award style={{ width: '14px', height: '14px', color: '#e81cff' }} /> Award In-Class Badges (+50 XP Each):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {BADGE_OPTIONS.map(badge => {
                      const isSelected = current.badges.includes(badge);
                      return (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => toggleBadge(b.bookingId, badge)}
                          style={{
                            border: `1px solid ${isSelected ? '#e81cff' : 'rgba(255,255,255,0.1)'}`,
                            background: isSelected ? 'rgba(232, 28, 255, 0.15)' : 'transparent',
                            color: isSelected ? '#e81cff' : 'hsl(var(--text-secondary))',
                            borderRadius: '20px',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          {isSelected && <Check style={{ width: '12px', height: '12px' }} />}
                          {badge}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
