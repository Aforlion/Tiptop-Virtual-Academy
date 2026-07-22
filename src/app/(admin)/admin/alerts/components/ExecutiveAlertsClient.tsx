'use client';

import React, { useState } from 'react';
import { resolveGoogleSyncJob } from '@/app/admin/actions';
import { AlertTriangle, CheckCircle2, ShieldAlert, Filter, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExecutiveAlert {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  created_at: string;
  status: string;
}

interface Props {
  initialAlerts: ExecutiveAlert[];
}

export default function ExecutiveAlertsClient({ initialAlerts }: Props) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>(initialAlerts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleResolve = async (alert: ExecutiveAlert) => {
    if (alert.category === 'platform') {
      await resolveGoogleSyncJob(alert.id);
    }
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
    router.refresh();
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Category Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter style={{ width: '16px', height: '16px' }} /> Filter Category:
        </span>
        {['all', 'platform', 'financial', 'academic', 'operational'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              border: `1px solid ${selectedCategory === cat ? '#e81cff' : 'rgba(255,255,255,0.1)'}`,
              background: selectedCategory === cat ? 'rgba(232, 28, 255, 0.15)' : 'transparent',
              color: selectedCategory === cat ? '#e81cff' : 'hsl(var(--text-secondary))',
              borderRadius: '20px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
          No active alerts in this category. All operational systems operating normally!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlerts.map(a => {
            let priorityBg = 'rgba(56, 189, 248, 0.15)';
            let priorityColor = '#38bdf8';
            if (a.priority === 'critical') { priorityBg = 'rgba(239, 68, 68, 0.2)'; priorityColor = '#ef4444'; }
            if (a.priority === 'high') { priorityBg = 'rgba(245, 158, 11, 0.2)'; priorityColor = '#f59e0b'; }

            return (
              <div
                key={a.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderLeft: `4px solid ${priorityColor}`
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: priorityBg, color: priorityColor, padding: '0.65rem', borderRadius: '10px' }}>
                    <ShieldAlert style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge" style={{ background: priorityBg, color: priorityColor, fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800 }}>
                        {a.priority} priority
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        {a.category}
                      </span>
                    </div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{a.title}</h4>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>{a.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleResolve(a)}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  <Check style={{ width: '14px', height: '14px' }} /> Mark Resolved
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
