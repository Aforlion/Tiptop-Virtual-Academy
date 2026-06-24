'use client';

import React, { useActionState, useRef, useEffect, useState } from 'react';
import DataTable, { Column } from '@/components/ui/DataTable';
import FormField from '@/components/ui/FormField';
import SubmitButton from '@/components/ui/SubmitButton';
import { createTeacherAccountAction } from '@/app/admin/actions';
import { UserPlus, X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createTeacherAccountAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      // Delay closing to let them see success message if any
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

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
      accessor: (user) => user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-premium" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <UserPlus style={{ width: '18px', height: '18px' }} /> Create Teacher Account
        </button>
      </div>

      <div className="glass-card">
        <DataTable columns={columns} data={initialUsers} emptyMessage="No users found." />
      </div>

      {/* Inviting Teacher Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            padding: '2.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--text-secondary))',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '22px', height: '22px' }} />
            </button>

            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-display)',
              color: '#fff'
            }}>
              Register New Teacher
            </h3>
            <p style={{
              color: 'hsl(var(--text-secondary))',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              marginBottom: '1.5rem'
            }}>
              A temporary password will be auto-generated and emailed to the teacher with instructions to update their credentials.
            </p>

            {state && (
              <div style={{
                background: state.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${state.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: state.success ? '#a7f3d0' : '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}>
                {state.success ? state.message : state.error}
              </div>
            )}

            <form ref={formRef} action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <FormField 
                  label="First Name" 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  required 
                  placeholder="Ms. Barbara" 
                />
                <FormField 
                  label="Last Name" 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  required 
                  placeholder="Smith" 
                />
              </div>

              <FormField 
                label="Email Address" 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="barbara@tiptopacademy.com" 
              />

              <FormField 
                label="Phone Number (Optional)" 
                type="text" 
                id="phoneNumber" 
                name="phoneNumber" 
                placeholder="+234..." 
              />

              <SubmitButton variant="premium" style={{ marginTop: '0.5rem', width: '100%' }}>
                Provision Account & Send Welcome
              </SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
