import React from 'react';
import { Student } from '@/lib/types';

interface WelcomeHeroProps {
  student: Student;
  isJunior: boolean;
}

export default function WelcomeHero({ student, isJunior }: WelcomeHeroProps) {
  const kidAvatarEmoji = isJunior ? '🦁' : '🧑‍🚀';

  return (
    <div className="glass-card" style={{ marginBottom: '3rem', padding: isJunior ? '3rem' : '2.5rem' }}>
      <div style={{
        display: 'flex',
        flexDirection: isJunior ? 'column' : 'row',
        alignItems: 'center',
        gap: '2.5rem',
        textAlign: isJunior ? 'center' : 'left'
      }}>
        {/* Avatar Frame */}
        <div className={isJunior ? 'kid-avatar-frame' : 'older-kid-avatar-frame'}>
          <span className={isJunior ? 'kid-avatar' : 'older-kid-avatar'}>
            {kidAvatarEmoji}
          </span>
        </div>

        <div style={{ flexGrow: 1 }}>
          <span className="badge badge-green" style={{
            fontSize: '0.75rem',
            marginBottom: '0.5rem',
            borderRadius: isJunior ? '9999px' : '4px',
            background: isJunior ? '#d1fae5' : 'rgba(52, 211, 153, 0.15)',
            color: isJunior ? '#065f46' : '#34d399',
            border: isJunior ? 'none' : '1px solid rgba(52, 211, 153, 0.3)'
          }}>
            {isJunior ? '✨ JUNIOR EXPLORER ACTIVE' : '🛰️ NEXUS COMMAND ACTIVE'}
          </span>
          
          <h1 className="page-title" style={{ fontSize: isJunior ? '3.5rem' : '2.5rem' }}>
            Hello, {student.first_name}!
          </h1>
          
          <p style={{ 
            color: isJunior ? '#475569' : 'hsl(var(--text-secondary))',
            fontSize: isJunior ? '1.25rem' : '1rem',
            lineHeight: '1.6'
          }}>
            {isJunior 
              ? 'Yay! It is a beautiful day to play, build, and learn together! Are you ready for an adventure?' 
              : 'Syllabus lock established. Connection terminal online. Prepare for operational onboarding.'}
          </p>
        </div>
      </div>
    </div>
  );
}
