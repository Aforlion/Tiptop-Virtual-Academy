import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getStudentById } from '@/lib/queries';
import StudentNavHeader from '../components/StudentNavHeader';
import StudentNotificationsClient from './components/StudentNotificationsClient';
import { calculateAge, getAgeBracket } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentNotificationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const studentId = params.studentId as string | undefined;

  if (!studentId) redirect('/parent/dashboard');

  const supabase = await createClient();
  const { data: student } = await getStudentById(studentId);
  if (!student) redirect('/parent/dashboard');

  const age = calculateAge(student.date_of_birth);
  const ageBracket = getAgeBracket(age);
  const isJunior = ageBracket === 'junior';
  const isTeen = ageBracket === 'teen';

  // Fetch notifications for student's parent profile or student system broadcasts
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .or(`profile_id.eq.${student.parent_id}`)
    .order('created_at', { ascending: false });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <StudentNavHeader
        studentName={student.first_name}
        studentId={student.id}
        isJunior={isJunior}
        isTeen={isTeen}
        unreadNotificationsCount={unreadCount}
      />

      <StudentNotificationsClient
        initialNotifications={notifications || []}
      />
    </div>
  );
}
