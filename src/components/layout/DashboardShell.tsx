import React from 'react';
import Sidebar from './Sidebar';

interface DashboardShellProps {
  children: React.ReactNode;
  role: 'admin' | 'parent' | 'student' | 'teacher' | 'head_of_school';
}

export default function DashboardShell({ children, role }: DashboardShellProps) {
  return (
    <div className="dashboard-container">
      <Sidebar role={role} />
      <main className="content-area">
        {children}
      </main>
    </div>
  );
}
