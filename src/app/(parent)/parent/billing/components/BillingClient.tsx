'use client';

import React, { useState, useTransition } from 'react';
import { CreditPackage } from '@/lib/types';
import { initializePaystackCheckout } from '@/app/parent/actions/billing';
import { Sparkles, Coins } from 'lucide-react';

interface BillingClientProps {
  packages: CreditPackage[];
}

export default function BillingClient({ packages }: BillingClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

  const formatNaira = (cents: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(cents / 100);
  };

  const handleCheckout = (pkg: CreditPackage) => {
    setActivePackageId(pkg.id);
    setError(null);
    startTransition(async () => {
      const result = await initializePaystackCheckout(pkg.id);
      if (result.success) {
        if (result.data?.url) {
          window.location.href = result.data.url;
        } else {
          setError('Failed to initialize checkout');
          setActivePackageId(null);
        }
      } else {
        setError(result.error || 'Failed to initialize checkout');
        setActivePackageId(null);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '1rem',
          borderRadius: 'var(--radius-md)'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {packages.map(pkg => (
          <div key={pkg.id} className="glass-card" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            border: pkg.credits > 10 ? '1px solid hsla(var(--accent-pink), 0.3)' : undefined
          }}>
            {pkg.credits > 10 && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '1rem',
                background: 'hsl(var(--accent-pink))',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} /> Best Value
              </div>
            )}
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '0.5rem' }}>
              {pkg.name}
            </h3>
            <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
              {pkg.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                {formatNaira(pkg.price_cents)}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '1.5rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <Coins size={18} style={{ color: 'hsl(var(--accent-cyan))' }} />
              <span style={{ fontWeight: 500 }}>{pkg.credits} Flexible Credits</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              onClick={() => handleCheckout(pkg)}
              disabled={isPending}
            >
              {isPending && activePackageId === pkg.id ? 'Processing...' : 'Purchase Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
