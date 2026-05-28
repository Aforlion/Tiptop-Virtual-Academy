import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
}

export default function StatsCard({ label, value, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <div className="glass-card flex-between">
      <div>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', fontWeight: 500, marginBottom: '0.25rem' }}>
          {label}
        </p>
        <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>
          {value}
        </h3>
      </div>
      {Icon && (
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid hsl(var(--border-soft))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon style={{ width: '24px', height: '24px', color: iconColor || 'hsl(var(--accent-purple))' }} />
        </div>
      )}
    </div>
  );
}
