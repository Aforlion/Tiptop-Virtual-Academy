import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.app_metadata?.role as 'admin' | 'head_of_school') || (user?.user_metadata?.role as 'admin' | 'head_of_school') || 'admin';

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
