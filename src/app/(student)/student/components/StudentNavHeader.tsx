'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, BookOpen, FileText, Award, Calendar, Bell, ArrowLeft, LogOut } from 'lucide-react';

interface StudentNavHeaderProps {
  studentName: string;
  studentId: string;
  isJunior?: boolean;
  isTeen?: boolean;
  unreadNotificationsCount?: number;
}

export default function StudentNavHeader({
  studentName,
  studentId,
  isJunior,
  isTeen,
  unreadNotificationsCount = 0
}: StudentNavHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = studentId ? `?studentId=${studentId}` : '';

  const navItems = [
    { label: 'Dashboard', href: `/student/dashboard${queryParam}`, icon: LayoutDashboard },
    { label: 'Learning Hub', href: `/student/learning${queryParam}`, icon: BookOpen },
    { label: 'Assignments', href: `/student/dashboard/assignments${queryParam}`, icon: FileText },
    { label: 'Progress & Badges', href: `/student/progress${queryParam}`, icon: Award },
    { label: 'Timetable', href: `/student/calendar${queryParam}`, icon: Calendar },
    { label: 'Notifications', href: `/student/notifications${queryParam}`, icon: Bell, badge: unreadNotificationsCount },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          href="/parent/dashboard"
          className="btn-secondary"
          style={{
            borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
            background: isJunior ? '#fff' : isTeen ? '#111827' : 'rgba(255,255,255,0.02)',
            borderColor: isJunior ? '#e2e8f0' : isTeen ? '#1f2937' : 'rgba(6, 182, 212, 0.2)',
            color: isJunior ? '#475569' : '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} /> Parent Room
        </Link>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: isJunior ? '1.5rem' : '1.25rem',
            color: isJunior ? '#1e1b4b' : isTeen ? '#818cf8' : '#22d3ee'
          }}>
            {isJunior ? `🌟 ${studentName}'s Learning World` : isTeen ? `${studentName}'s Terminal` : `${studentName}'s Digital Classroom`}
          </h2>
        </div>

        <Link
          href="/login"
          className="btn-secondary"
          style={{
            borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
            color: '#ef4444',
            borderColor: isJunior ? '#fca5a5' : isTeen ? '#ef4444' : 'rgba(220, 38, 38, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} /> Exit Workspace
        </Link>
      </div>

      {/* Navigation Pills */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '0.5rem',
        padding: '0.5rem',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href.split('?')[0]);

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isActive ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
                color: isActive ? '#fff' : 'hsl(var(--text-secondary))',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon style={{ width: '16px', height: '16px' }} />
              {item.label}
              {!!item.badge && item.badge > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 800
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
