import React from 'react';
import { TrendingUp } from 'lucide-react';

interface CreditBalanceProps {
  credits: number;
}

export default function CreditBalance({ credits }: CreditBalanceProps) {
  return (
    <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid hsl(var(--accent-pink))' }}>
      <div>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
          Flex Credits
        </p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--accent-pink))' }}>
          {credits}
        </h3>
      </div>
      <TrendingUp style={{ color: 'hsl(var(--accent-pink))', width: '24px', height: '24px' }} />
    </div>
  );
}
