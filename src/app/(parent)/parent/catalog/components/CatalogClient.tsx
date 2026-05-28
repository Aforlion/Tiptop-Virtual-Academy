'use client';

import React, { useState, useTransition } from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { Course, LiveSessionWithCourse, Student } from '@/lib/types';
import { calculateAge, formatSessionDate } from '@/lib/utils';
import { bookSession } from '@/app/parent/actions';
import SubmitButton from '@/components/ui/SubmitButton';

interface CatalogClientProps {
  courses: Course[];
  liveSessions: LiveSessionWithCourse[];
  students: Student[];
}

export default function CatalogClient({ courses, liveSessions, students }: CatalogClientProps) {
  const [filter, setFilter] = useState<'all' | 'junior' | 'senior'>('all');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Filter courses by selected age bracket
  const filteredCourses = courses.filter((c) => {
    if (filter === 'junior') return c.min_age <= 6;
    if (filter === 'senior') return c.max_age >= 7;
    return true;
  });

  const getSessionsForCourse = (courseId: string) => {
    return liveSessions.filter((s) => s.course_id === courseId);
  };

  const handleBook = (formData: FormData) => {
    setBookingSuccess(null);
    setBookingError(null);
    startTransition(async () => {
      const result = await bookSession(null, formData);
      if (result.success) {
        setBookingSuccess(result.message || 'Seat booked successfully!');
      } else {
        setBookingError(result.error);
      }
    });
  };

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
        >
          All Curriculum
        </button>
        <button
          onClick={() => setFilter('junior')}
          className={filter === 'junior' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
        >
          Junior (Ages 3-6)
        </button>
        <button
          onClick={() => setFilter('senior')}
          className={filter === 'senior' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
        >
          Senior (Ages 7-12)
        </button>
      </div>

      {/* Booking Notifications */}
      {(bookingSuccess || bookingError) && (
        <div style={{
          background: bookingSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${bookingSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: bookingSuccess ? '#a7f3d0' : '#fca5a5',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          marginBottom: '2rem',
          maxWidth: '600px'
        }}>
          {bookingSuccess || bookingError}
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid-2">
        {filteredCourses.map((course) => {
          const sessions = getSessionsForCourse(course.id);
          const isJuniorCourse = course.min_age <= 6;

          return (
            <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <span className={`badge ${isJuniorCourse ? 'badge-purple' : 'badge-blue'}`}>
                  Ages {course.min_age}-{course.max_age}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star style={{ width: '14px', height: '14px', fill: 'currentColor', color: '#fbbf24' }} /> 5.0 Rating
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'white' }}>
                {course.title}
              </h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
                {course.description || 'No description provided. Step inside this custom educational pathway.'}
              </p>

              {/* Upcoming Session list inside Card */}
              <div style={{ borderTop: '1px solid hsl(var(--border-soft))', paddingTop: '1.25rem', marginTop: 'auto' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar style={{ width: '16px', height: '16px', color: 'hsl(var(--accent-pink))' }} /> Upcoming Live Broadcasters
                </h4>
                
                {sessions.length === 0 ? (
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    No sessions scheduled for this course yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {sessions.map((session) => (
                      <form key={session.id} action={handleBook} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid hsl(var(--border-soft))', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        
                        <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: 'white', fontWeight: 500 }}>{session.teacher_name}</span>
                          <span style={{ color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock style={{ width: '12px', height: '12px' }} />
                            {formatSessionDate(session.scheduled_start)}
                          </span>
                        </div>

                        {students.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <select 
                              name="studentId" 
                              required 
                              className="form-select" 
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', height: 'auto', flexGrow: 1 }}
                            >
                              {students.map((kid) => (
                                <option key={kid.id} value={kid.id}>
                                  {kid.first_name} (Age {calculateAge(kid.date_of_birth)})
                                </option>
                              ))}
                            </select>
                            <SubmitButton 
                              variant="premium" 
                              style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', height: 'auto' }}
                              loadingText="Booking..."
                            >
                              Book
                            </SubmitButton>
                          </div>
                        )}
                      </form>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
