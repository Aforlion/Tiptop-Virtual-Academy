import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AgeSwitcherProps {
  studentId: string;
  ageBracket: 'junior' | 'senior' | 'teen';
}

export default function AgeSwitcher({ studentId, ageBracket }: AgeSwitcherProps) {
  const isJunior = ageBracket === 'junior';
  const isSenior = ageBracket === 'senior';
  const isTeen = ageBracket === 'teen';

  return (
    <div style={{
      background: isJunior ? '#fef3c7' : isTeen ? '#0f172a' : '#030712',
      borderBottom: isJunior ? '3px dashed #fcd34d' : isTeen ? '1px solid #1f2937' : '1px solid rgba(6, 182, 212, 0.3)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles style={{ width: '18px', height: '18px', color: isJunior ? '#ff7e5f' : isTeen ? '#818cf8' : '#22d3ee' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isJunior ? '#1e1b4b' : isTeen ? '#f1f5f9' : '#22d3ee' }}>
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
            color: isJunior ? '#fff' : isTeen ? '#9ca3af' : '#9ca3af',
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
            background: isSenior ? '#06b6d4' : 'transparent',
            color: isSenior ? '#fff' : '#475569',
            border: isSenior ? '2px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Senior Portal (Ages 7-12)
        </Link>
        <Link 
          href={`/student/dashboard?studentId=${studentId}&testAge=teen`}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: isTeen ? '#4f46e5' : 'transparent',
            color: isTeen ? '#fff' : '#475569',
            border: isTeen ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Teen Portal (Ages 13-16)
        </Link>
      </div>
    </div>
  );
}
