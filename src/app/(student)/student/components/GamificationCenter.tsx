'use client';

import React, { useState } from 'react';
import { BADGES } from '@/lib/badges';
import { 
  Award, 
  Flame, 
  Trophy, 
  Target, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';

interface GamificationCenterProps {
  studentName: string;
  studentXp: number;
  earnedBadgeIds: string[];
  challenges: {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    target_count: number;
    completed: boolean;
    progress_count: number;
  }[];
  leaderboard: {
    allTime: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
  };
  streak: {
    currentStreak: number;
    lastSevenDays: { dayName: string; active: boolean; dateString: string }[];
  };
  isJunior: boolean;
}

export default function GamificationCenter({
  studentName,
  studentXp,
  earnedBadgeIds,
  challenges,
  leaderboard,
  streak,
  isJunior
}: GamificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'quests' | 'badges'>('quests');
  const [leaderboardType, setLeaderboardType] = useState<'weekly' | 'allTime'>('weekly');
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // De-duplicate earned badges
  const uniqueEarnedIds = Array.from(new Set(earnedBadgeIds));
  const unlockedCount = BADGES.filter(b => uniqueEarnedIds.includes(b.id)).length;

  // Calculate Level & Progress to next level (e.g. 1000 XP per level)
  const xpPerLevel = 1000;
  const level = Math.floor(studentXp / xpPerLevel) + 1;
  const xpInCurrentLevel = studentXp % xpPerLevel;
  const xpNeededForNextLevel = xpPerLevel - xpInCurrentLevel;
  const levelProgressPercent = (xpInCurrentLevel / xpPerLevel) * 100;

  // Determine League Tier
  const getLeagueDetails = (xp: number) => {
    if (xp >= 7500) return { name: 'Diamond', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', border: '#f43f5e', glow: '0 0 25px rgba(244, 63, 94, 0.4)', desc: 'The elite league of master coders and cosmic calculators!' };
    if (xp >= 3500) return { name: 'Platinum', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: '#d946ef', glow: '0 0 20px rgba(217, 70, 239, 0.3)', desc: 'Brilliant minds performing advanced logic loops.' };
    if (xp >= 1500) return { name: 'Gold', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', border: '#fbbf24', glow: '0 0 15px rgba(251, 191, 36, 0.3)', desc: 'Stellar learners on a gold-star streak!' };
    if (xp >= 500) return { name: 'Silver', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: '#0ea5e9', glow: '0 0 12px rgba(14, 165, 233, 0.2)', desc: 'Rising stars climbing the computational ladders.' };
    return { name: 'Bronze', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: '#ea580c', glow: '0 0 8px rgba(234, 88, 12, 0.15)', desc: 'Welcome! Complete classes and quests to level up!' };
  };

  const league = getLeagueDetails(studentXp);
  const activeLeaderboard = leaderboardType === 'weekly' ? leaderboard.weekly : leaderboard.allTime;

  const tabBtnStyle = (tab: typeof activeTab) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
    background: activeTab === tab 
      ? isJunior ? 'hsl(var(--accent-pink))' : 'rgba(34, 211, 238, 0.15)'
      : 'transparent',
    color: activeTab === tab 
      ? '#fff'
      : isJunior ? '#64748b' : 'hsl(var(--text-secondary))',
    borderColor: activeTab === tab && !isJunior ? 'rgba(34, 211, 238, 0.3)' : 'transparent',
  });

  return (
    <div className="grid-3" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
      
      {/* 1. LEVEL & LEAGUE RING PANEL */}
      <div className="glass-card" style={{ 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${league.border}22`,
        boxShadow: league.glow
      }}>
        {/* Decorative Background Glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: league.color,
          filter: 'blur(80px)',
          opacity: 0.15,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: league.color, fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          <Sparkles style={{ width: '14px', height: '14px' }} />
          <span>{league.name} League</span>
        </div>

        {/* Circular Progress Ring */}
        <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '1.25rem' }}>
          <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle
              cx="65"
              cy="65"
              r="55"
              stroke={isJunior ? '#f1f5f9' : 'rgba(255,255,255,0.03)'}
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="65"
              cy="65"
              r="55"
              stroke={league.color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={345}
              strokeDashoffset={345 - (345 * levelProgressPercent) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          {/* Inner Content */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: isJunior ? '#64748b' : 'hsl(var(--text-secondary))', fontWeight: 650 }}>LEVEL</span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{level}</span>
          </div>
        </div>

        <h4 style={{ fontSize: '1.2rem', fontWeight: 850, margin: '0 0 0.25rem 0', color: '#fff' }}>
          {studentName}
        </h4>

        <div style={{ fontSize: '0.8rem', color: isJunior ? '#475569' : 'hsl(var(--text-secondary))', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 800, color: league.color }}>{studentXp}</span> XP Total
        </div>

        {/* Small Progress Bar details */}
        <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: 'auto' }}>
          <p style={{ fontSize: '0.75rem', color: isJunior ? '#64748b' : 'hsl(var(--text-muted))', margin: 0, lineHeight: 1.4 }}>
            {xpNeededForNextLevel} XP until Level {level + 1}
          </p>
          <p style={{ fontSize: '0.7rem', color: league.color, fontStyle: 'italic', margin: '0.5rem 0 0 0', opacity: 0.8 }}>
            "{league.desc}"
          </p>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE CONTENT AREA (TABS) */}
      <div className="glass-card col-span-2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Tab Headers */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('quests')} style={tabBtnStyle('quests')}>
              🎯 Quests ({challenges.filter(c => c.completed).length}/{challenges.length})
            </button>
            <button onClick={() => setActiveTab('leaderboard')} style={tabBtnStyle('leaderboard')}>
              🏆 Leaderboard
            </button>
            <button onClick={() => setActiveTab('badges')} style={tabBtnStyle('badges')}>
              🏅 Badges ({unlockedCount}/{BADGES.length})
            </button>
          </div>

          {/* STREAK WIDGET IN HEADER */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: streak.currentStreak > 0 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255,255,255,0.02)', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '20px',
            border: streak.currentStreak > 0 ? '1px solid rgba(249, 115, 22, 0.2)' : '1px solid rgba(255,255,255,0.05)'
          }}>
            <Flame style={{ 
              width: '18px', 
              height: '18px', 
              color: streak.currentStreak > 0 ? '#f97316' : 'hsl(var(--text-muted))',
              fill: streak.currentStreak > 0 ? '#f97316' : 'transparent',
              animation: streak.currentStreak > 0 ? 'pulse-streak 1.5s infinite alternate' : 'none'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: streak.currentStreak > 0 ? '#fff' : 'hsl(var(--text-muted))' }}>
              {streak.currentStreak} Day Streak!
            </span>
          </div>
        </div>

        {/* Tab Body: Quests & Challenges */}
        {activeTab === 'quests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {challenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>
                No active quests found. Check back later!
              </div>
            ) : (
              challenges.map(chall => {
                const progressPct = Math.min((chall.progress_count / chall.target_count) * 100, 100);
                return (
                  <div key={chall.id} style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.015)',
                    border: chall.completed ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Status Checkbox */}
                    <div style={{ color: chall.completed ? '#10b981' : 'rgba(255,255,255,0.1)' }}>
                      {chall.completed ? (
                        <CheckCircle2 style={{ width: '26px', height: '26px', fill: 'rgba(16, 185, 129, 0.1)' }} />
                      ) : (
                        <Target style={{ width: '26px', height: '26px' }} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                            {chall.title}
                          </h5>
                          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', margin: '0.15rem 0 0 0', lineHeight: 1.3 }}>
                            {chall.description}
                          </p>
                        </div>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 800, 
                          color: '#fbbf24', 
                          background: 'rgba(251, 191, 36, 0.1)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '8px' 
                        }}>
                          +{chall.xp_reward} XP
                        </span>
                      </div>

                      {/* Quest Progress Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            background: chall.completed ? '#10b981' : 'hsl(var(--accent-cyan))',
                            width: `${progressPct}%`,
                            borderRadius: '10px',
                            transition: 'width 0.5s ease-out'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))', minWidth: '35px', textAlign: 'right' }}>
                          {chall.progress_count} / {chall.target_count}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Streak Grid Checklist */}
            <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame style={{ width: '16px', height: '16px', color: '#f97316', fill: '#f97316' }} />
                Weekly Streak Tracker (Last 7 Days)
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {streak.lastSevenDays.map((day, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.75rem 0.25rem',
                    borderRadius: '10px',
                    background: day.active ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255,255,255,0.01)',
                    border: day.active ? '1px solid rgba(249, 115, 22, 0.2)' : '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: day.active ? '#f97316' : 'hsl(var(--text-muted))', fontWeight: 700, marginBottom: '0.4rem' }}>
                      {day.dayName}
                    </span>
                    <div style={{
                      width: '20px', height: '20px',
                      borderRadius: '50%',
                      background: day.active ? '#f97316' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.75rem', fontWeight: 900
                    }}>
                      {day.active ? '🔥' : '•'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Body: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px' }}>
                <button 
                  onClick={() => setLeaderboardType('weekly')} 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: 'none',
                    background: leaderboardType === 'weekly' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: leaderboardType === 'weekly' ? '#fff' : 'hsl(var(--text-secondary))'
                  }}
                >
                  Weekly Rank
                </button>
                <button 
                  onClick={() => setLeaderboardType('allTime')} 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: 'none',
                    background: leaderboardType === 'allTime' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: leaderboardType === 'allTime' ? '#fff' : 'hsl(var(--text-secondary))'
                  }}
                >
                  All-Time Global
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Users style={{ width: '14px', height: '14px' }} />
                {activeLeaderboard.length} Students Competing
              </span>
            </div>

            {/* Leaderboard Entries List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {activeLeaderboard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>
                  No students in leaderboard.
                </div>
              ) : (
                activeLeaderboard.map((entry, idx) => {
                  const details = getLeagueDetails(entry.total_xp);
                  return (
                    <div 
                      key={entry.student_id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: entry.is_current_student 
                          ? 'rgba(6, 182, 212, 0.08)' 
                          : 'rgba(255,255,255,0.01)',
                        border: entry.is_current_student 
                          ? '1px solid rgba(6, 182, 212, 0.25)' 
                          : '1px solid rgba(255,255,255,0.03)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Rank Badge */}
                        <div style={{
                          width: '28px', height: '28px',
                          borderRadius: '50%',
                          background: entry.rank === 1 ? 'linear-gradient(135deg, #fef08a, #eab308)'
                            : entry.rank === 2 ? 'linear-gradient(135deg, #f1f5f9, #94a3b8)'
                            : entry.rank === 3 ? 'linear-gradient(135deg, #fed7aa, #ea580c)'
                            : 'rgba(255,255,255,0.03)',
                          color: entry.rank <= 3 ? '#1e293b' : 'hsl(var(--text-muted))',
                          fontWeight: 900,
                          fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: entry.rank <= 3 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {entry.rank}
                        </div>

                        {/* Name & League Badge */}
                        <div>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: entry.is_current_student ? 850 : 700, 
                            color: entry.is_current_student ? '#22d3ee' : '#fff' 
                          }}>
                            {entry.first_name} {entry.is_current_student && '(You)'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 700, 
                              color: details.color,
                              background: details.bg,
                              padding: '0.05rem 0.35rem',
                              borderRadius: '4px',
                            }}>
                              {details.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* XP Points */}
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                        {leaderboardType === 'weekly' ? entry.weekly_xp : entry.total_xp} <span style={{ fontSize: '0.75rem', fontWeight: 650, color: 'hsl(var(--text-secondary))' }}>XP</span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab Body: Badges Showcase */}
        {activeTab === 'badges' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
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
                      padding: '1rem 0.5rem',
                      borderRadius: '12px',
                      background: isUnlocked ? 'rgba(255, 255, 255, 0.025)' : 'rgba(255, 255, 255, 0.005)',
                      border: isUnlocked 
                        ? isHovered 
                          ? '1px solid rgba(232, 28, 255, 0.35)' 
                          : '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(255, 255, 255, 0.015)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isHovered && isUnlocked ? 'translateY(-3px)' : 'none'
                    }}
                  >
                    {/* Emoji */}
                    <div style={{
                      fontSize: '2rem',
                      filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.2)',
                      marginBottom: '0.5rem',
                      position: 'relative'
                    }}>
                      {badge.emoji}
                      {!isUnlocked && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          background: 'rgba(13, 13, 18, 0.9)',
                          padding: '2px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Lock style={{ width: '8px', height: '8px', color: 'hsl(var(--text-muted))' }} />
                        </div>
                      )}
                    </div>

                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: isUnlocked ? '#fff' : 'hsl(var(--text-muted))',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {badge.name}
                    </span>

                    {/* Tooltip Card */}
                    {isHovered && (
                      <div style={{
                        position: 'absolute',
                        bottom: '105%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '180px',
                        background: 'rgba(13, 13, 18, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '0.6rem',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                        zIndex: 100,
                        pointerEvents: 'none',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fff', marginBottom: '0.15rem' }}>
                          {badge.name} {isUnlocked ? '🔓' : '🔒'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.2' }}>
                          {badge.description}
                        </div>
                        <div style={{ 
                          position: 'absolute', 
                          top: '100%', 
                          left: '50%', 
                          marginLeft: '-5px', 
                          borderWidth: '5px', 
                          borderStyle: 'solid', 
                          borderColor: 'rgba(13, 13, 18, 0.95) transparent transparent transparent' 
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse-streak {
          from { transform: scale(1); filter: drop-shadow(0 0 0px rgba(249, 115, 22, 0)); }
          to { transform: scale(1.05); filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.5)); }
        }
      `}</style>
    </div>
  );
}
