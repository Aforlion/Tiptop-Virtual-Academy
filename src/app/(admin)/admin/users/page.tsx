import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/layout/PageHeader';
import UsersClient from './components/UsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      students:students(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch users:', error);
  }

  // Format data
  const formattedUsers = (users || []).map(u => ({
    ...u,
    studentCount: u.students?.[0]?.count || 0
  }));

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage all parents, teachers, and admins on the platform."
      />
      <UsersClient initialUsers={formattedUsers} />
    </>
  );
}
