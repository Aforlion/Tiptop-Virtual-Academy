'use client';

import React, { useActionState } from 'react';
import { signup } from '@/app/auth/actions';
import Link from 'next/link';
import { GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import SubmitButton from '@/components/ui/SubmitButton';
import FormField from '@/components/ui/FormField';

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, null);
  const errorMessage = state && !state.success ? state.error : null;

  return (
    <main className="auth-wrapper" style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem' }}>
      <div className="auth-container" style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Logo Section */}
        <div className="auth-logo" style={{ textAlign: 'center' }}>
          <GraduationCap style={{ 
            width: '48px', 
            height: '48px', 
            color: '#e81cff', 
            marginBottom: '0.75rem', 
            filter: 'drop-shadow(0 0 10px rgba(232, 28, 255, 0.35))' 
          }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.02em', margin: 0 }}>Create Parent Account</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
            Set up your parent controller hub to register children and manage tuition.
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
            <ShieldCheck style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>Parents will configure child profiles & live calendar credits inside.</span>
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              {errorMessage}
            </div>
          )}

          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              placeholder="parent@example.com"
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

            {/* Locked to parent role to align with intake funnel design */}
            <input type="hidden" name="role" value="parent" />

            <SubmitButton variant="premium" style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #e81cff 0%, #7c3aed 100%)', height: '48px', fontWeight: 700 }}>
              Register & Launch Setup <ArrowRight style={{ width: '18px', height: '18px', marginLeft: '0.5rem' }} />
            </SubmitButton>
          </form>

        </div>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', marginTop: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#e81cff', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>

      </div>
    </main>
  );
}
