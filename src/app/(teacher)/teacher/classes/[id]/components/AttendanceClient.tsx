'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitAttendanceAndBadges, BookingAttendanceInput } from '@/app/teacher/actions';
import { BADGES } from '@/lib/badges';
import { Check, Loader2, Award, Calendar, UserCheck } from 'lucide-react';

interface StudentBooking {
  id: string;
  student_id: string;
  attended: boolean;
  earned_badges: string[] | null;
  students: {
    first_name: string;
    parent_id: string;
  } | null;
}

interface AttendanceClientProps {
  sessionId: string;
  initialBookings: StudentBooking[];
  courseTitle: string;
  sessionTime: string;
  sessionType: string;
}

export default function AttendanceClient({
  sessionId,
  initialBookings,
  courseTitle,
  sessionTime,
  sessionType
}: AttendanceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bookings, setBookings] = useState<StudentBooking[]>(initialBookings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Toggle attendance for a booking
  const toggleAttendance = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const newAttended = !b.attended;
          // Clear badges if marking as absent
          return {
            ...b,
            attended: newAttended,
            earned_badges: newAttended ? b.earned_badges : []
          };
        }
        return b;
      })
    );
  };

  // Toggle badge for a student booking
  const toggleBadge = (bookingId: string, badgeId: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          // If not attended, don't allow badges
          if (!b.attended) return b;

          const currentBadges = b.earned_badges || [];
          const hasBadge = currentBadges.includes(badgeId);
          const newBadges = hasBadge
            ? currentBadges.filter(id => id !== badgeId)
            : [...currentBadges, badgeId];

          return { ...b, earned_badges: newBadges };
        }
        return b;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const inputData: BookingAttendanceInput[] = bookings.map(b => ({
      bookingId: b.id,
      attended: b.attended,
      badges: b.earned_badges || []
    }));

    startTransition(async () => {
      const result = await submitAttendanceAndBadges(sessionId, inputData);
      if (result.success) {
        setSuccess(result.message || 'Attendance logged successfully!');
        setTimeout(() => {
          router.push('/teacher/dashboard');
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit attendance.');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Session Details Header */}
      <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid hsl(var(--accent-cyan))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-purple" style={{ textTransform: 'capitalize', marginBottom: '0.5rem', display: 'inline-block' }}>
              {sessionType} Session
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>{courseTitle}</h2>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '16px', height: '16px', color: 'hsl(var(--accent-cyan))' }} />
                {sessionTime}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck style={{ width: '16px', height: '16px', color: 'hsl(var(--accent-cyan))' }} />
                {bookings.length} {bookings.length === 1 ? 'Student' : 'Students'} Booked
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {bookings.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>No students booked for this session.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map((booking) => {
              const studentName = booking.students?.first_name || 'Student';
              const isStudentAttended = booking.attended;
              const studentBadges = booking.earned_badges || [];

              return (
                <div 
                  key={booking.id} 
                  className={`glass-card ${isStudentAttended ? 'border-active' : ''}`}
                  style={{
                    padding: '1.75rem 2rem',
                    transition: 'var(--transition-smooth)',
                    border: isStudentAttended ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--glass-border)',
                    boxShadow: isStudentAttended ? '0 0 15px rgba(6, 182, 212, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: isStudentAttended ? '1.5rem' : 0 }}>
                    {/* Student Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div 
                        style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '50%',
                          background: isStudentAttended 
                            ? 'linear-gradient(135deg, hsl(var(--accent-cyan)) 0%, hsl(var(--accent-indigo)) 100%)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.15rem'
                        }}
                      >
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {studentName}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', margin: '0.2rem 0 0 0' }}>
                          Status: {isStudentAttended ? 'Present' : 'Absent'}
                        </p>
                      </div>
                    </div>

                    {/* Attendance Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleAttendance(booking.id)}
                      className={`btn-${isStudentAttended ? 'premium' : 'secondary'}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        background: isStudentAttended 
                          ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isStudentAttended ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {isStudentAttended ? (
                        <>
                          <Check style={{ width: '16px', height: '16px' }} />
                          Marked Present
                        </>
                      ) : (
                        'Mark Present'
                      )}
                    </button>
                  </div>

                  {/* Badge Awarding Section */}
                  {isStudentAttended && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Award style={{ width: '18px', height: '18px', color: 'hsl(var(--accent-cyan))' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Reward Badges for this Session</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '1rem' }}>
                        Select the badges {studentName} earned today. These will appear in their showcase!
                      </p>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                        gap: '0.75rem' 
                      }}>
                        {BADGES.map((badge) => {
                          const isAwarded = studentBadges.includes(badge.id);
                          return (
                            <button
                              key={badge.id}
                              type="button"
                              onClick={() => toggleBadge(booking.id, badge.id)}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                border: isAwarded 
                                  ? '1px solid rgba(6, 182, 212, 0.5)' 
                                  : '1px solid rgba(255, 255, 255, 0.04)',
                                background: isAwarded 
                                  ? 'rgba(6, 182, 212, 0.08)' 
                                  : 'rgba(255, 255, 255, 0.02)',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                textAlign: 'center'
                              }}
                              title={badge.description}
                            >
                              <span style={{ fontSize: '1.75rem' }}>{badge.emoji}</span>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: isAwarded ? '#fff' : 'hsl(var(--text-secondary))' 
                              }}>
                                {badge.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Form Alerts & Actions */}
        {error && (
          <div className="glass-card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '1rem 1.5rem', color: '#f87171' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="glass-card" style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '1rem 1.5rem', color: '#34d399' }}>
            {success}
          </div>
        )}

        {bookings.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => router.push('/teacher/dashboard')}
              className="btn-secondary"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-premium"
              disabled={isPending}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
                  Saving...
                </>
              ) : (
                'Save Attendance & Complete Session'
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
