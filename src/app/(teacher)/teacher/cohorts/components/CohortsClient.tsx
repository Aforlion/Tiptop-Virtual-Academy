'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { enrollStudentInCohort, removeStudentFromCohort } from '@/app/teacher/actions';
import { Users, UserPlus, Trash2, Loader2, GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  min_age: number;
  max_age: number;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  students: { id: string; first_name: string; date_of_birth: string } | null;
  courses: { id: string; title: string } | null;
}

interface SimpleStudent {
  id: string;
  first_name: string;
  date_of_birth: string;
}

interface Props {
  courses: Course[];
  enrollments: Enrollment[];
  allStudents: SimpleStudent[];
}

function calcAge(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function CohortsClient({ courses, enrollments, allStudents }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const courseEnrollments = enrollments.filter(e => e.course_id === selectedCourse);
  const enrolledStudentIds = new Set(courseEnrollments.map(e => e.student_id));

  // Students not yet enrolled in selected course (and within age range if possible)
  const activeCourse = courses.find(c => c.id === selectedCourse);
  const eligibleStudents = allStudents.filter(s => {
    if (enrolledStudentIds.has(s.id)) return false;
    if (!activeCourse) return true;
    const age = calcAge(s.date_of_birth);
    return age >= activeCourse.min_age && age <= activeCourse.max_age;
  });

  const handleEnrol = () => {
    if (!selectedStudent || !selectedCourse) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await enrollStudentInCohort(selectedStudent, selectedCourse);
      setFeedback({ type: result.success ? 'success' : 'error', msg: result.success ? result.message! : result.error! });
      if (result.success) {
        setSelectedStudent('');
        router.refresh();
      }
    });
  };

  const handleRemove = (enrollmentId: string) => {
    if (!confirm('Remove this student from the cohort?')) return;
    setFeedback(null);
    setRemovingId(enrollmentId);
    startTransition(async () => {
      const result = await removeStudentFromCohort(enrollmentId);
      setRemovingId(null);
      setFeedback({ type: result.success ? 'success' : 'error', msg: result.success ? result.message! : result.error! });
      if (result.success) router.refresh();
    });
  };

  if (courses.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
        <GraduationCap style={{ width: '40px', height: '40px', color: 'hsl(var(--text-muted))', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Cohort Courses Assigned</h3>
        <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '420px', margin: '0 auto' }}>
          You haven't been assigned to any cohort-type sessions yet. Ask an admin to assign you to a cohort class.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Course Selector */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Users style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
          Viewing Cohort:
        </div>
        <select
          value={selectedCourse}
          onChange={e => { setSelectedCourse(e.target.value); setFeedback(null); }}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '0.95rem',
          }}
        >
          {courses.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#0d0d12' }}>
              {c.title} (Ages {c.min_age}–{c.max_age})
            </option>
          ))}
        </select>
        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>
          {courseEnrollments.length} student{courseEnrollments.length !== 1 ? 's' : ''} enrolled
        </span>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="glass-card" style={{
          padding: '0.875rem 1.25rem', fontSize: '0.9rem',
          borderColor: feedback.type === 'success' ? '#10b981' : '#ef4444',
          background: feedback.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          color: feedback.type === 'success' ? '#34d399' : '#f87171',
        }}>
          {feedback.type === 'success' ? '✅' : '❌'} {feedback.msg}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>

        {/* Roster Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Current Roster</h2>
          {courseEnrollments.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Users style={{ width: '32px', height: '32px', color: 'hsl(var(--text-muted))', margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'hsl(var(--text-secondary))' }}>No students enrolled yet.</p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--text-muted))', textAlign: 'left' }}>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Student</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Age</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Enrolled</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courseEnrollments.map(e => {
                    const student = e.students;
                    const age = student?.date_of_birth ? calcAge(student.date_of_birth) : null;
                    const enrolledDate = new Date(e.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.9rem', color: '#fff',
                            }}>
                              {(student?.first_name ?? '?').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{student?.first_name ?? 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'hsl(var(--text-secondary))' }}>
                          {age !== null ? `${age} yrs` : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'hsl(var(--text-secondary))' }}>{enrolledDate}</td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <button
                            onClick={() => handleRemove(e.id)}
                            disabled={removingId === e.id || isPending}
                            style={{
                              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#f87171', borderRadius: '8px', padding: '0.35rem 0.6rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem',
                            }}
                            title="Remove from cohort"
                          >
                            {removingId === e.id
                              ? <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                              : <Trash2 style={{ width: '14px', height: '14px' }} />
                            }
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enrol New Student */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
            Enrol a Student
          </h2>
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeCourse && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
                fontSize: '0.8rem', color: '#c4b5fd',
              }}>
                📚 Showing students aged <strong>{activeCourse.min_age}–{activeCourse.max_age}</strong> who aren't already enrolled.
                {eligibleStudents.length === 0 && ' No eligible students found.'}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Select Student</label>
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                style={{
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: selectedStudent ? '#fff' : 'hsl(var(--text-muted))', fontSize: '0.95rem', width: '100%',
                }}
              >
                <option value="" style={{ background: '#0d0d12' }}>— Choose a student —</option>
                {eligibleStudents.map(s => {
                  const age = calcAge(s.date_of_birth);
                  return (
                    <option key={s.id} value={s.id} style={{ background: '#0d0d12' }}>
                      {s.first_name} (Age {age})
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handleEnrol}
              disabled={!selectedStudent || isPending}
              className="btn-premium"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                opacity: !selectedStudent ? 0.5 : 1,
              }}
            >
              {isPending
                ? <><Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> Enrolling...</>
                : <><UserPlus style={{ width: '16px', height: '16px' }} /> Enrol in Cohort</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
