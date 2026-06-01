import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import CreditBalance from '../components/CreditBalance';
import { getProfile } from '@/lib/queries';
import { CreditPackage, Profile } from '@/lib/types';
import BillingClient from './components/BillingClient';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const parentId = user?.id || 'parent-mock-1';

  let creditPackages: CreditPackage[] = [];
  let parentProfile: Profile | null = null;
  
  const resolvedParams = await searchParams;

  try {
    const { data: profileData } = await getProfile(parentId);
    parentProfile = profileData;

    const { data: packagesData } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });
      
    if (packagesData) {
      creditPackages = packagesData;
    }
  } catch (error) {
    console.error('Failed to load billing data', error);
  }

  // Fallback Mock Data
  if (creditPackages.length === 0) {
    creditPackages = [
      { id: '1', name: 'Starter Pack', description: 'Get started with 5 flexible class credits', credits: 5, price_cents: 250000, is_active: true, created_at: '' },
      { id: '2', name: 'Growth Pack', description: 'Most popular! 12 flexible class credits', credits: 12, price_cents: 500000, is_active: true, created_at: '' },
      { id: '3', name: 'Academy Pro', description: 'Immersive learning with 30 flexible class credits', credits: 30, price_cents: 1000000, is_active: true, created_at: '' }
    ];
  }

  if (!parentProfile) {
    parentProfile = { id: parentId, flexible_credits: 10 } as Profile;
  }

  return (
    <>
      <PageHeader
        title="Billing & Credits"
        subtitle="Purchase flexible class credits to book live sessions for your children."
        action={<CreditBalance credits={parentProfile.flexible_credits} />}
      />

      {resolvedParams.status === 'success' && (
        <div className="glass-card" style={{ 
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#4ade80', fontSize: '1rem', fontWeight: 600 }}>Payment Successful!</h3>
          <p style={{ color: '#4ade80', fontSize: '0.9rem', opacity: 0.9 }}>
            Your credits have been securely added to your account via the webhook.
          </p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <BillingClient packages={creditPackages} />
      </div>
    </>
  );
}
