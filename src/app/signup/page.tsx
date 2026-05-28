'use client';

import React, { useActionState } from 'react';
import { signup } from '@/app/auth/actions';
import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';
import SubmitButton from '@/components/ui/SubmitButton';
import FormField from '@/components/ui/FormField';

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, null);

  const errorMessage = state && !state.success ? state.error : null;

  return (
    <main className="auth-wrapper">
      <div className="auth-container">
        
        {/* Logo Section */}
        <div className="auth-logo">
          <GraduationCap style={{ 
            width: '48px', 
            height: '48px', 
            color: 'hsl(var(--accent-pink))', 
            marginBottom: '0.75rem', 
            filter: 'drop-shadow(0 0 10px hsla(var(--accent-pink), 0.3))' 
          }} />
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Tiptop Academy to begin your learning journey</p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
            Get Started
          </h2>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              {errorMessage}
            </div>
          )}

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="grid-2" style={{ gap: '1rem' }}>
              <FormField 
                label="First Name" 
                type="text" 
                id="firstName" 
                name="firstName" 
                required 
                placeholder="First"
              />
              <FormField 
                label="Last Name" 
                type="text" 
                id="lastName" 
                name="lastName" 
                required 
                placeholder="Last"
              />
            </div>

            <FormField 
              label="Email Address" 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="you@example.com"
            />

            <FormField 
              label="Password" 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="Minimum 6 characters"
              minLength={6}
            />

            <FormField
              label="I am registering as a..."
              id="role"
              name="role"
              required
              as="select"
              options={[
                { value: 'parent', label: 'Parent (Manage children & book classes)' },
                { value: 'student', label: 'Student (Age-adapted kid dashboard)' }
              ]}
            />

            <SubmitButton variant="premium" style={{ width: '100%', marginTop: '0.5rem' }}>
              Register Account <ArrowRight style={{ width: '18px', height: '18px' }} />
            </SubmitButton>
          </form>

        </div>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'hsl(var(--accent-pink))', fontWeight: 600 }}>
            Sign in instead
          </Link>
        </p>

      </div>
    </main>
  );
}
