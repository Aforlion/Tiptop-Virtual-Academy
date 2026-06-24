'use client';

import React, { useActionState, useRef, useEffect } from 'react';
import { createCourse } from '@/app/admin/actions';
import { Plus } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SubmitButton from '@/components/ui/SubmitButton';

export default function CreateCourseForm() {
  const [state, formAction] = useActionState(createCourse, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
        <Plus style={{ width: '22px', height: '22px', color: 'hsl(var(--accent-purple))' }} /> Add Course Blueprint
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
          label="Course Title" 
          type="text" 
          id="title" 
          name="title" 
          required 
          placeholder="e.g. Logic Labs & Scratch Loops" 
        />
        
        <FormField 
          label="Short Syllabus Description" 
          as="textarea" 
          id="description" 
          name="description" 
          placeholder="Provide a brief outline of curriculum content and goals..." 
        />

        <div className="grid-2" style={{ gap: '1rem' }}>
          <FormField
            label="Curriculum Type"
            id="curriculumType"
            name="curriculumType"
            required
            as="select"
            options={[
              { value: 'custom', label: 'Custom/Internal' },
              { value: 'eyfs', label: 'EYFS (Early Years)' },
              { value: 'cambridge', label: 'Cambridge Curriculum' }
            ]}
            defaultValue="custom"
          />
          <FormField
            label="Key Stage / Stage"
            type="text"
            id="keyStage"
            name="keyStage"
            placeholder="e.g. Stage 1, Early Years, KS3"
          />
        </div>

        <div className="grid-2">
          <FormField 
            label="Minimum Age" 
            type="number" 
            id="minAge" 
            name="minAge" 
            min="3" 
            max="17" 
            defaultValue="5" 
            required
          />
          <FormField 
            label="Maximum Age" 
            type="number" 
            id="maxAge" 
            name="maxAge" 
            min="3" 
            max="17" 
            defaultValue="8" 
            required
          />
        </div>

        <SubmitButton variant="premium" style={{ marginTop: '0.5rem' }}>
          Create Curriculum
        </SubmitButton>
      </form>
    </div>
  );
}
