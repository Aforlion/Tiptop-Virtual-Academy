'use client';

import React, { useActionState, useRef, useEffect } from 'react';
import { createLiveSession } from '@/app/admin/actions';
import { Plus } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SubmitButton from '@/components/ui/SubmitButton';
import { Course } from '@/lib/types';

interface ScheduleSessionFormProps {
  courses: Course[];
}

export default function ScheduleSessionForm({ courses }: ScheduleSessionFormProps) {
  const [state, formAction] = useActionState(createLiveSession, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const courseOptions = courses.map(c => ({
    value: c.id,
    label: `${c.title} (Ages ${c.min_age}-${c.max_age})`
  }));

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
        <Plus style={{ width: '22px', height: '22px', color: 'hsl(var(--accent-pink))' }} /> Schedule Live Session
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
        <FormField 
          label="Course Association" 
          id="courseId" 
          name="courseId" 
          as="select"
          required
          options={courseOptions}
        />

        <div className="grid-2">
          <FormField 
            label="Teacher Name" 
            type="text" 
            id="teacherName" 
            name="teacherName" 
            placeholder="e.g. Ms. Barbara" 
            required
          />
          <FormField 
            label="Session Mode" 
            id="sessionType" 
            name="sessionType" 
            as="select"
            required
            options={[
              { value: 'flexible', label: 'Flexible (Consumes Credit)' },
              { value: 'cohort', label: 'Cohort (Fixed Term Pass)' }
            ]}
          />
        </div>

        <div className="grid-2">
          <FormField 
            label="Start Date & Time" 
            type="datetime-local" 
            id="scheduledStart" 
            name="scheduledStart" 
            required
          />
          <FormField 
            label="End Date & Time" 
            type="datetime-local" 
            id="scheduledEnd" 
            name="scheduledEnd" 
            required
          />
        </div>

        <SubmitButton 
          variant="premium" 
          style={{ 
            marginTop: '0.5rem', 
            background: 'linear-gradient(135deg, hsl(var(--accent-pink)) 0%, hsl(var(--accent-purple)) 100%)', 
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' 
          }}
        >
          Add Scheduled Session
        </SubmitButton>
      </form>
    </div>
  );
}
