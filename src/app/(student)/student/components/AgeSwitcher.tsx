import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AgeSwitcherProps {
  studentId: string;
  isJunior: boolean;
}

export default function AgeSwitcher({ studentId, isJunior }: AgeSwitcherProps) {
  return (
    <div style={{
      background: isJunior ? '#fef3c7' : '#0f172a',
      borderBottom: isJunior ? '3px dashed #fcd34d' : '1px solid rgba(6, 182, 212, 0.3)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles style={{ width: '18px', height: '18px', color: isJunior ? '#ff7e5f' : '#22d3ee' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isJunior ? '#1e1b4b' : '#22d3ee' }}>
          Interactive Demo Controller
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: isJunior ? '#475569' : '#9ca3af' }}>Preview layout:</span>
        <Link 
          href={`/student/dashboard?studentId=${studentId}&testAge=younger`}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: isJunior ? '#ff7e5f' : 'transparent',
            color: isJunior ? '#fff' : '#9ca3af',
            border: isJunior ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Junior Portal (Ages 3-6)
        </Link>
        <Link 
          href={`/student/dashboard?studentId=${studentId}&testAge=older`}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: !isJunior ? '#06b6d4' : 'transparent',
            color: !isJunior ? '#fff' : '#475569',
            border: !isJunior ? '2px solid #22d3ee' : '1px solid rgba(0,0,0,0.1)',
          }}
        >
          Senior Portal (Ages 7-12)
        </Link>
      </div>
    </div>
  );
}
