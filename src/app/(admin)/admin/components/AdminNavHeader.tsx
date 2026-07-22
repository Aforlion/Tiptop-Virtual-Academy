'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GraduationCap, Users, DollarSign, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AdminNavHeaderProps {
  role?: string;
  userName?: string;
  alertsCount?: number;
}

export default function AdminNavHeader({ role = 'admin', userName = 'Barbara', alertsCount = 0 }: AdminNavHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Executive Command', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Academics & Teaching', href: '/admin/academics', icon: GraduationCap },
    { label: 'Admissions Pipeline', href: '/admin/admissions-pipeline', icon: Users },
    { label: 'Finance & Invoicing', href: '/admin/finance', icon: DollarSign },
    { label: 'School Calendar', href: '/admin/calendar', icon: Calendar },
    { label: 'Executive Alerts', href: '/admin/alerts', icon: AlertTriangle, badge: alertsCount },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.65rem', borderRadius: '12px' }}>
            <ShieldCheck style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>
              Tiptop Executive Command Center
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
              Welcome back, {userName} • Role: <strong style={{ color: '#e81cff', textTransform: 'uppercase' }}>{role}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/parent/dashboard" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            View Parent Portal
          </Link>
          <Link href="/teacher/dashboard" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            View Teacher Workspace
          </Link>
        </div>
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
          const isActive = pathname === item.href;

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
                background: isActive ? 'linear-gradient(135deg, #e81cff 0%, #7c3aed 100%)' : 'transparent',
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
