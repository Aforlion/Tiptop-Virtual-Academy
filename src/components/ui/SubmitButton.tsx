'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  variant?: 'premium' | 'secondary' | 'danger';
}

export default function SubmitButton({ 
  children, 
  loadingText = 'Submitting...', 
  variant = 'premium',
  className = '',
  style,
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const buttonClass = {
    premium: 'btn-premium',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  }[variant];

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin 1s linear infinite;
        }
      `}} />
      <button 
        type="submit" 
        disabled={pending} 
        className={`${buttonClass} ${className}`}
        style={style}
        {...props}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin-custom" style={{ width: '18px', height: '18px' }} />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </button>
    </>
  );
}
