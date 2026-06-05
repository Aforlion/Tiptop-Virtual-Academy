import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import AvailabilityClient from './components/AvailabilityClient';
import { redirect } from 'next/navigation';
import { TeacherAvailability } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TeacherAvailabilityPage() {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    redirect('/login');
  }

  const { data: slots, error } = await supabase
    .from('teacher_availability')
    .select('*')
    .eq('teacher_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Failed to fetch availability:', error);
  }

  return (
    <>
      <PageHeader
        title="My Availability"
        subtitle="Set your weekly teaching schedule. Students and admins use this to know when you're free to teach."
      />
      <AvailabilityClient initialSlots={(slots as TeacherAvailability[]) || []} />
    </>
  );
}
