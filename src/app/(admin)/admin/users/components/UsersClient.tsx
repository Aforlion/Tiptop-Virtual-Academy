'use client';

import React from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  flexible_credits: number;
  studentCount: number;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: UserData[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin': return 'rgba(168, 85, 247, 0.2)'; // purple
      case 'teacher': return 'rgba(56, 189, 248, 0.2)'; // blue
      case 'parent': return 'rgba(232, 28, 255, 0.2)'; // pink
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };
  
  const getRoleTextColor = (role: string) => {
    switch(role) {
      case 'admin': return '#c084fc';
      case 'teacher': return '#7dd3fc';
      case 'parent': return '#f472b6';
      default: return '#fff';
    }
  };

  const columns: Column<UserData>[] = [
    {
      header: 'Name',
      accessor: (user) => <span style={{ fontWeight: 500 }}>{user.first_name} {user.last_name}</span>,
    },
    {
      header: 'Role',
      accessor: (user) => (
        <span style={{
          background: getRoleBadgeColor(user.role),
          color: getRoleTextColor(user.role),
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          {user.role}
        </span>
      ),
    },
    {
      header: 'Children',
      accessor: (user) => user.role === 'parent' ? user.studentCount : '-',
      align: 'center'
    },
    {
      header: 'Credits',
      accessor: (user) => (
        <span style={{ fontWeight: 600, color: 'hsl(var(--accent-cyan))' }}>
          {user.flexible_credits}
        </span>
      ),
      align: 'center'
    },
    {
      header: 'Joined',
      accessor: (user) => new Date(user.created_at).toLocaleDateString(),
    }
  ];

  return (
    <div className="glass-card">
      <DataTable columns={columns} data={initialUsers} emptyMessage="No users found." />
    </div>
  );
}
