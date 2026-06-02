'use client';

import React, { useState } from 'react';
import { BADGES, getBadgeById } from '@/lib/badges';
import { Award, Lock, HelpCircle } from 'lucide-react';

interface BadgeShowcaseProps {
  earnedBadgeIds: string[];
}

export default function BadgeShowcase({ earnedBadgeIds }: BadgeShowcaseProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // De-duplicate earned badge IDs
  const uniqueEarnedIds = Array.from(new Set(earnedBadgeIds));
  
  // Categorize badges
  const earnedBadges = BADGES.filter(badge => uniqueEarnedIds.includes(badge.id));
  const lockedBadges = BADGES.filter(badge => !uniqueEarnedIds.includes(badge.id));

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(232, 28, 255, 0.15)', color: '#e81cff', padding: '0.6rem', borderRadius: '10px' }}>
            <Award style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#fff', margin: 0 }}>
              Achievement Badge Nexus
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', margin: '0.2rem 0 0 0' }}>
              Showcase of your computational and academic milestones!
            </p>
          </div>
        </div>

        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          padding: '0.4rem 0.8rem', 
          borderRadius: '20px', 
          background: 'rgba(232, 28, 255, 0.1)', 
          color: '#e81cff',
          border: '1px solid rgba(232, 28, 255, 0.2)'
        }}>
          {earnedBadges.length} / {BADGES.length} Unlocked
        </div>
      </div>

      {/* Grid of Badges */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
        gap: '1.25rem' 
      }}>
        {BADGES.map((badge) => {
          const isUnlocked = uniqueEarnedIds.includes(badge.id);
          const isHovered = hoveredBadge === badge.id;

          return (
            <div
              key={badge.id}
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1.25rem 0.75rem',
                borderRadius: '16px',
                background: isUnlocked 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : 'rgba(255, 255, 255, 0.01)',
                border: isUnlocked 
                  ? isHovered 
                    ? '1px solid rgba(232, 28, 255, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isUnlocked && isHovered 
                  ? '0 0 20px rgba(232, 28, 255, 0.15)' 
                  : 'none',
                transform: isHovered && isUnlocked ? 'translateY(-4px)' : 'none'
              }}
            >
              {/* Badge Icon / Emoji */}
              <div 
                style={{
                  fontSize: '2.5rem',
                  filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.25)',
                  marginBottom: '0.75rem',
                  transition: 'filter 0.3s ease',
                  position: 'relative'
                }}
              >
                {badge.emoji}
                
                {/* Lock Overlay */}
                {!isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    background: 'rgba(13, 13, 18, 0.85)',
                    padding: '3px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Lock style={{ width: '10px', height: '10px', color: 'hsl(var(--text-muted))' }} />
                  </div>
                )}
              </div>

              {/* Badge Name */}
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: isUnlocked ? '#fff' : 'hsl(var(--text-muted))',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {badge.name}
              </span>

              {/* Category Label */}
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: isUnlocked 
                  ? badge.category === 'coding' ? '#38bdf8' 
                    : badge.category === 'science' ? '#10b981'
                    : badge.category === 'math' ? '#fbbf24'
                    : badge.category === 'reading' ? '#f472b6'
                    : 'hsl(var(--text-secondary))'
                  : 'hsl(var(--text-muted))',
                marginTop: '0.4rem'
              }}>
                {badge.category}
              </span>

              {/* Floating Tooltip Card */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '105%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  background: 'rgba(13, 13, 18, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  pointerEvents: 'none',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem' }}>
                    {badge.name} {isUnlocked ? '🔓' : '🔒'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.3' }}>
                    {badge.description}
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: '50%', 
                    marginLeft: '-6px', 
                    borderWidth: '6px', 
                    borderStyle: 'solid', 
                    borderColor: 'rgba(13, 13, 18, 0.95) transparent transparent transparent' 
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Styles for animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
