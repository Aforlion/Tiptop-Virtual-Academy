'use client';

import React, { useActionState, useRef, useEffect } from 'react';
import { addChild } from '@/app/parent/actions';
import { Plus } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SubmitButton from '@/components/ui/SubmitButton';

export default function AddChildForm() {
  const [state, formAction] = useActionState(addChild, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
        <Plus style={{ width: '22px', height: '22px', color: 'hsl(var(--accent-pink))' }} /> Register Student Profile
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
          label="Child's First Name" 
          type="text" 
          id="firstName" 
          name="firstName" 
          required 
          placeholder="First Name" 
        />
        
        <div className="form-group">
          <label className="form-label" htmlFor="dob">Date of Birth</label>
          <input required className="form-input" type="date" id="dob" name="dob" />
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
            Used to auto-adapt the dashboard layout (Playful 3-6 vs. Advanced 7-12 theme).
          </span>
        </div>

        <FormField 
          label="Pedagogical Notes (Optional)" 
          type="text" 
          id="notes" 
          name="notes" 
          placeholder="e.g. loves astronauts, visual learner" 
        />

        <SubmitButton variant="premium" style={{ marginTop: '0.5rem' }}>
          Add Child Profile
        </SubmitButton>
      </form>
    </div>
  );
}
