'use client';

import React, { useActionState, useRef, useEffect } from 'react';
import { bookSession } from '@/app/parent/actions';
import { Plus } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SubmitButton from '@/components/ui/SubmitButton';
import { Student, LiveSessionWithCourse } from '@/lib/types';
import { calculateAge } from '@/lib/utils';

interface BookSessionFormProps {
  students: Student[];
  liveSessions: LiveSessionWithCourse[];
}

export default function BookSessionForm({ students, liveSessions }: BookSessionFormProps) {
  const [state, formAction] = useActionState(bookSession, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const studentOptions = students.map(s => ({
    value: s.id,
    label: `${s.first_name} (Age ${calculateAge(s.date_of_birth)})`
  }));

  const sessionOptions = liveSessions.map(s => ({
    value: s.id,
    label: `${s.courses?.title || 'Unknown Course'} - ${s.teacher_name} (${s.session_type})`
  }));

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
        <Plus style={{ width: '22px', height: '22px', color: 'hsl(var(--accent-purple))' }} /> Book a Live Seat
      </h2>

      {state && (
        <div style={{
          background: state.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${state.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: state.success ? '#a7f3d0' : '#fca5a5',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {state.success ? state.message : state.error}
        </div>
      )}

      <form ref={formRef} action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {students.length === 0 ? (
          <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
            Please register a child profile first.
          </div>
        ) : (
          <>
            <FormField 
              label="Select Student" 
              id="studentId" 
              name="studentId" 
              as="select"
              required
              options={studentOptions}
            />

            <FormField 
              label="Select Scheduled Class" 
              id="sessionId" 
              name="sessionId" 
              as="select"
              required
              options={sessionOptions}
            />

            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '-0.5rem' }}>
              *Rule 1 Credit Guard: Booking uses 1 Flexible Credit.
            </span>

            <SubmitButton 
              variant="premium" 
              style={{ 
                marginTop: '0.5rem', 
                background: 'linear-gradient(135deg, hsl(var(--accent-purple)) 0%, hsl(var(--accent-pink)) 100%)', 
                boxShadow: '0 4px 15px rgba(186, 85, 211, 0.4)' 
              }}
            >
              Confirm Seat Booking
            </SubmitButton>
          </>
        )}
      </form>
    </div>
  );
}
