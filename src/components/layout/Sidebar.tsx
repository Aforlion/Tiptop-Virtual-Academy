'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  LogOut,
  CreditCard,
  Users,
  Briefcase,
  MonitorPlay,
  CalendarDays,
  DollarSign,
  Users2,
  MessageSquare,
  Hash,
  ScrollText,
} from 'lucide-react';
import { signout } from '@/app/auth/actions';

interface SidebarProps {
  role: 'admin' | 'parent' | 'student' | 'teacher';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = {
    admin: [
      {
        label: 'Command Center',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Manage Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        label: 'Manage Courses',
        href: '/admin/courses',
        icon: BookOpen,
      },
      {
        label: 'Manage Sessions',
        href: '/admin/sessions',
        icon: MonitorPlay,
      },
      {
        label: 'Finance & Payments',
        href: '/admin/finance',
        icon: Briefcase,
      },
      {
        label: 'Community Hub',
        href: '/admin/community',
        icon: Hash,
      },
      {
        label: 'Certificates',
        href: '/admin/certificates',
        icon: ScrollText,
      },
    ],
    parent: [
      {
        label: 'Dashboard',
        href: '/parent/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Course Catalog',
        href: '/parent/catalog',
        icon: BookOpen,
      },
      {
        label: 'Billing & Credits',
        href: '/parent/billing',
        icon: CreditCard,
      },
      {
        label: 'Community',
        href: '/community',
        icon: MessageSquare,
      },
    ],
    teacher: [
      {
        label: 'Teacher Console',
        href: '/teacher/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Lesson Plans',
        href: '/teacher/lessons',
        icon: BookOpen,
      },
      {
        label: 'My Availability',
        href: '/teacher/availability',
        icon: CalendarDays,
      },
      {
        label: 'Earnings',
        href: '/teacher/earnings',
        icon: DollarSign,
      },
      {
        label: 'Cohort Rosters',
        href: '/teacher/cohorts',
        icon: Users2,
      },
      {
        label: 'Community',
        href: '/community',
        icon: MessageSquare,
      },
    ],
    student: [
      {
        label: 'Academy Nexus',
        href: '/student/dashboard',
        icon: GraduationCap,
      },
      {
        label: 'Certificates',
        href: '/student/certificates',
        icon: ScrollText,
      },
      {
        label: 'Community',
        href: '/community',
        icon: MessageSquare,
      },
    ]
  }[role];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <GraduationCap style={{ 
          width: '28px', 
          height: '28px', 
          color: role === 'admin' 
            ? 'hsl(var(--accent-purple))' 
            : role === 'teacher'
              ? 'hsl(var(--accent-cyan))'
              : 'hsl(var(--accent-pink))',
        }} />
        <span>Tiptop Academy</span>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Controls */}
      <div style={{ marginTop: 'auto' }}>
        <form action={signout}>
          <button type="submit" className="btn-secondary" style={{ width: '100%', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <LogOut style={{ width: '18px', height: '18px' }} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
