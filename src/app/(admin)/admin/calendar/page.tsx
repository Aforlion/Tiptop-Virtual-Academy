import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import AdminNavHeader from '../components/AdminNavHeader';
import SchoolCalendarManagerClient from './components/SchoolCalendarManagerClient';

export const dynamic = 'force-dynamic';

export default async function SchoolCalendarManagerPage() {
  const supabase = await createClient();

  // Fetch notifications tagged as calendar events or system alerts
  const { data: events } = await supabase
    .from('notifications')
    .select('*')
    .eq('type', 'calendar_event')
    .order('created_at', { ascending: false });

  return (
    <>
      <AdminNavHeader />

      <PageHeader
        title="School Calendar & Operations Manager"
        subtitle="Centralized management for Academic Terms, Holiday Schedules, Exam Windows, Parent Meetings, and Google Calendar sync."
      />

      <SchoolCalendarManagerClient initialEvents={events || []} />
    </>
  );
}
