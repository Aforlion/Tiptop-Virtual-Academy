'use client';

import React, { useState, useTransition } from 'react';
import { Calendar, Clock, Star, X, Check, Award, BookOpen, Layers } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'junior' | 'senior' | 'teen'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Filter courses by selected age bracket
  const filteredCourses = courses.filter((c) => {
    if (filter === 'junior') return c.min_age <= 6;
    if (filter === 'senior') return c.min_age <= 12 && c.max_age >= 7;
    if (filter === 'teen') return c.max_age >= 13;
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
        // Close modal after successful booking if open
        setSelectedCourse(null);
      } else {
        setBookingError(result.error);
      }
    });
  };

  // Mock syllabus data based on course to enrich the detail modal
  const getSyllabusHighlights = (courseTitle: string) => {
    const titleLower = courseTitle.toLowerCase();
    if (titleLower.includes('code') || titleLower.includes('coding') || titleLower.includes('python')) {
      return [
        'Introduction to Logic Blocks & Sequence Loops',
        'Variables & Simple Arithmetic Calculations',
        'Conditional Branches (If/Else Decisions)',
        'Building a final interactive game program'
      ];
    }
    if (titleLower.includes('astro') || titleLower.includes('space') || titleLower.includes('planet')) {
      return [
        'The Solar System & Planetary Orbits',
        'Understanding Gravity & Atmospheric Pressures',
        'Stars, Supernovas & Black Hole Dynamics',
        'Virtual telescope exploration session'
      ];
    }
    return [
      'Core foundation concepts & terminology',
      'Interactive cohort peer assignments',
      'Practical live laboratory demonstrations',
      'Final certificate capstone challenge'
    ];
  };

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
        <button
          onClick={() => setFilter('teen')}
          className={filter === 'teen' ? 'btn-premium' : 'btn-secondary'}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
        >
          Teen (Ages 13-16)
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
          const isTeenCourse = course.max_age >= 13;

          return (
            <div 
              key={course.id} 
              className="glass-card course-interactive-card" 
              onClick={() => setSelectedCourse(course)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <span className={`badge ${isJuniorCourse ? 'badge-purple' : isTeenCourse ? 'badge-indigo' : 'badge-blue'}`}>
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

              {/* Click to Expand Prompt */}
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'hsl(var(--accent-purple))', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginBottom: '1rem',
                marginTop: 'auto'
              }}>
                <BookOpen style={{ width: '14px', height: '14px' }} /> Click to explore curriculum syllabus
              </div>

              {/* Upcoming Session list inside Card */}
              <div 
                style={{ borderTop: '1px solid hsl(var(--border-soft))', paddingTop: '1.25rem' }}
                onClick={(e) => e.stopPropagation()} // Prevent clicking within form elements from triggering modal
              >
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

      {/* Modern Course Detail Modal */}
      {selectedCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8, 8, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }} onClick={() => setSelectedCourse(null)}>
          <div style={{
            background: 'hsl(var(--bg-secondary))',
            border: '1px solid hsl(var(--border-soft))',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '650px',
            boxShadow: 'var(--glass-shadow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid hsl(var(--border-soft))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start'
            }}>
              <div>
                <span className={`badge ${selectedCourse.min_age <= 6 ? 'badge-purple' : selectedCourse.max_age >= 13 ? 'badge-indigo' : 'badge-blue'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  Ages {selectedCourse.min_age}-{selectedCourse.max_age} Bracket
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                  {selectedCourse.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'background 0.2s'
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Course Description
                </h4>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {selectedCourse.description || 'No description provided for this course. Experience synchronous learning and customized peer assignments guided by our top educators.'}
                </p>
              </div>

              {/* Syllabus Highlights */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid hsl(var(--border-soft))', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'white', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers style={{ width: '16px', height: '16px', color: 'hsl(var(--accent-purple))' }} /> What We Will Learn
                </h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                  {getSyllabusHighlights(selectedCourse.title).map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                      <Check style={{ width: '14px', height: '14px', color: 'hsl(var(--accent-green))', marginTop: '3px', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Course Live Sessions list */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'white', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar style={{ width: '16px', height: '16px', color: 'hsl(var(--accent-pink))' }} /> Available Live Sessions
                </h4>

                {getSessionsForCourse(selectedCourse.id).length === 0 ? (
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    No sessions scheduled for this course yet. Check back soon!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {getSessionsForCourse(selectedCourse.id).map((session) => (
                      <form key={session.id} action={handleBook} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid hsl(var(--border-soft))', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{session.teacher_name}</span>
                          <span style={{ color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                            <Clock style={{ width: '12px', height: '12px' }} />
                            {formatSessionDate(session.scheduled_start)}
                          </span>
                        </div>

                        {students.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select 
                              name="studentId" 
                              required 
                              className="form-select" 
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: '160px', height: 'auto' }}
                            >
                              {students.map((kid) => (
                                <option key={kid.id} value={kid.id}>
                                  {kid.first_name} (Age {calculateAge(kid.date_of_birth)})
                                </option>
                              ))}
                            </select>
                            <SubmitButton 
                              variant="premium" 
                              style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem', height: 'auto' }}
                              loadingText="Booking..."
                            >
                              Book Seat
                            </SubmitButton>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                            Add student on dashboard to book
                          </span>
                        )}
                      </form>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid hsl(var(--border-soft))',
              background: 'rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button 
                type="button" 
                onClick={() => setSelectedCourse(null)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
