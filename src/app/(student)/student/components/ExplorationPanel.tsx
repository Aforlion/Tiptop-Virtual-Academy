import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ExplorationPanelProps {
  isJunior: boolean;
}

export default function ExplorationPanel({ isJunior }: ExplorationPanelProps) {
  return (
    <div className="glass-card">
      <h2 style={{
        fontSize: isJunior ? '1.75rem' : '1.35rem',
        fontWeight: 800,
        marginBottom: '1.25rem',
        fontFamily: 'var(--font-display)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: isJunior ? '#ff7e5f' : '#22d3ee'
      }}>
        <CheckCircle style={{ width: '22px', height: '22px' }} />
        {isJunior ? '🧸 Fun Explorations' : '🛸 Logic Labs Blueprint'}
      </h2>

      <p style={{ 
        color: isJunior ? '#475569' : 'hsl(var(--text-secondary))',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        marginBottom: '1.25rem'
      }}>
        {isJunior 
          ? "Check out these fun challenges to prepare for Ms. Barbara's adventure today!" 
          : 'Core computational models and astrophysics resources mapped to your current syllabus block.'}
      </p>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>{' '}
          {isJunior ? 'Draw a beautiful red square' : 'Explore quantum gravity formulas'}
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>{' '}
          {isJunior ? 'Practice looking at calendar blocks' : 'Read introductory planetary syllabus'}
        </li>
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>{' '}
          {isJunior ? 'Hug your teddy bear for good luck!' : 'Prepare syntax logic equations'}
        </li>
      </ul>
    </div>
  );
}
