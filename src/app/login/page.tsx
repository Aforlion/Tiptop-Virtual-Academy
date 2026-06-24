'use client';

import React, { useActionState, Suspense } from 'react';
import { login, signInWithOAuth } from '@/app/auth/actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, ArrowRight } from 'lucide-react';
import SubmitButton from '@/components/ui/SubmitButton';
import FormField from '@/components/ui/FormField';

function LoginForm() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');

  const [state, formAction] = useActionState(login, null);
  const expired = searchParams.get('reason') === 'expired';

  const errorMessage = (state && !state.success ? state.error : null) || oauthError;

  return (
    <main className="auth-wrapper">
      <div className="auth-container">
        
        {/* Logo Section */}
        <div className="auth-logo">
          <GraduationCap style={{ 
            width: '48px', 
            height: '48px', 
            color: 'hsl(var(--accent-purple))', 
            marginBottom: '0.75rem', 
            filter: 'drop-shadow(0 0 10px hsla(var(--accent-purple), 0.3))' 
          }} />
          <h1 className="auth-title">Tiptop Academy</h1>
          <p className="auth-subtitle">Elevating early education for ages 3 to 17</p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
            Welcome Back
          </h2>

          {expired && !errorMessage && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fde047',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              Your session has expired due to inactivity. Please log in again.
            </div>
          )}

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
            <FormField 
              label="Email Address" 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="you@example.com"
            />

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label" htmlFor="password">Password</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'hsl(var(--accent-purple))', fontWeight: 500 }}>
                  Forgot Password?
                </a>
              </div>
              <input 
                className="form-input" 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="••••••••"
              />
            </div>

            <SubmitButton variant="premium" style={{ width: '100%', marginTop: '0.5rem' }}>
              Sign In <ArrowRight style={{ width: '18px', height: '18px' }} />
            </SubmitButton>
          </form>

          {/* Social Sign In */}
          <div style={{ position: 'relative', margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'hsl(var(--border-soft))', zIndex: 1 }}></div>
            <span style={{ position: 'relative', background: '#0a0a0f', padding: '0 0.75rem', color: 'hsl(var(--text-muted))', fontSize: '0.8rem', zIndex: 2, borderRadius: '4px' }}>
              OR CONTINUE WITH
            </span>
          </div>

          <div className="grid-2">
            <button 
              onClick={() => signInWithOAuth('google')}
              className="btn-secondary" 
              style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            >
              <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.728 5.728 0 0 1 8.24 12.8a5.728 5.728 0 0 1 5.75-5.715c1.472 0 2.8.547 3.829 1.442l3.228-3.229A10.145 10.145 0 0 0 13.99 2A10.02 10.02 0 0 0 4 12a10.02 10.02 0 0 0 9.99 10c5.78 0 9.99-4.048 9.99-10c0-.68-.07-1.32-.22-1.715h-11.52z"/>
              </svg>
              Google
            </button>
            <button 
              onClick={() => signInWithOAuth('github')}
              className="btn-secondary" 
              style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            >
              <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

        </div>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'hsl(var(--accent-purple))', fontWeight: 600 }}>
            Sign up now
          </Link>
        </p>

      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="auth-wrapper">
        <div className="auth-container" style={{ textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          <GraduationCap style={{ width: '48px', height: '48px', color: 'hsl(var(--accent-purple))', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Loading Secure Portal...</h2>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
