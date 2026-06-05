import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import EarningsClient from './components/EarningsClient';
import { redirect } from 'next/navigation';
import { TeacherEarning } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TeacherEarningsPage() {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    redirect('/login');
  }

  const { data: earnings, error } = await supabase
    .from('teacher_earnings')
    .select(`
      *,
      live_sessions (
        scheduled_start,
        session_type,
        courses ( title )
      )
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch earnings:', error);
  }

  return (
    <>
      <PageHeader
        title="Earnings & Payouts"
        subtitle="Track your class fees, credit-share income, and payout status."
      />
      <EarningsClient earnings={(earnings as unknown as TeacherEarning[]) || []} />
    </>
  );
}
