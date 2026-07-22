'use client';

import React, { useState } from 'react';
import { markNotificationRead } from '@/app/student/actions';
import { Bell, Check, AlertCircle, Info, Calendar, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type?: string | null;
  read: boolean;
  created_at: string;
}

interface Props {
  initialNotifications: NotificationItem[];
}

export default function StudentNotificationsClient({ initialNotifications }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>
          Student Notification Centre
        </h2>
        <p style={{ color: 'hsl(var(--text-secondary))', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
          Teacher announcements, assignment reminders, timetable updates, and school broadcasts.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          You have no notifications or announcements at this time.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => {
            const dateStr = new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={n.id}
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderLeft: n.read ? '1px solid rgba(255,255,255,0.08)' : '4px solid #38bdf8',
                  background: n.read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(56, 189, 248, 0.05)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: n.read ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.15)', color: n.read ? '#888' : '#38bdf8', padding: '0.65rem', borderRadius: '10px' }}>
                    <Bell style={{ width: '20px', height: '20px' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{n.type || 'Announcement'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{dateStr}</span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{n.title}</h4>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{n.body}</p>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                  >
                    <Check style={{ width: '14px', height: '14px' }} /> Mark Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
