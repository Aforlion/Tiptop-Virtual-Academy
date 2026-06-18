'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Users, Volume2, Sparkles, Terminal, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ClassroomDockProps {
  meetingToken: string;
  studentName: string;
  isJunior: boolean;
  isTeen?: boolean;
}

export default function ClassroomDock({ meetingToken, studentName, isJunior, isTeen = false }: ClassroomDockProps) {
  const [joined, setJoined] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [classmates, setClassmates] = useState([
    { name: 'Chloe', avatar: '🐱', status: 'In Lobby', isMe: false, ping: '12ms' },
    { name: 'Liam', avatar: '🦊', status: 'Offline', isMe: false, ping: '--' },
    { name: 'Aria', avatar: '🐼', status: 'Offline', isMe: false, ping: '--' },
    { name: 'Leo', avatar: '🦁', status: 'In Lobby', isMe: false, ping: '15ms' },
    { name: 'Ethan', avatar: '🐨', status: 'Offline', isMe: false, ping: '--' },
  ]);
  const [timeLeft, setTimeLeft] = useState(45); // Start at 45 seconds for demonstration
  const [bellPlayed, setBellPlayed] = useState(false);

  // Clean room name to only allow valid room characters
  const cleanRoomName = meetingToken
    ? meetingToken.replace(/[^a-zA-Z0-9-_]/g, '-')
    : 'TiptopAcademy-DefaultRoom';

  const jitsiUrl = `https://meet.jit.si/${cleanRoomName}#userInfo.displayName="${encodeURIComponent(studentName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false&config.disableDeepLinking=true&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","chat","raisehand","tileview","hangup"]`;

  // Real-time Supabase Presence integration if available
  useEffect(() => {
    if (!checkedIn) return;

    try {
      const supabase = createClient();
      const channel = supabase.channel(`classroom:${cleanRoomName}`);

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Realtime Presence Synced:', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('Join event:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('Leave event:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user: studentName,
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        channel.unsubscribe();
      };
    } catch (e) {
      console.warn('Supabase realtime presence client skipped (fallback to simulated mode):', e);
    }
  }, [checkedIn, cleanRoomName, studentName]);

  // Simulate classmates checking in one by one every few seconds
  useEffect(() => {
    if (!checkedIn) return;

    const interval = setInterval(() => {
      setClassmates((prev) => {
        const offlineClassmates = prev.filter((c) => c.status === 'Offline');
        if (offlineClassmates.length === 0) {
          clearInterval(interval);
          return prev;
        }
        // Randomly check in one classmate
        const randomTarget = offlineClassmates[Math.floor(Math.random() * offlineClassmates.length)];
        return prev.map((c) =>
          c.name === randomTarget.name
            ? { ...c, status: 'In Lobby', ping: `${Math.floor(Math.random() * 20) + 8}ms` }
            : c
        );
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [checkedIn]);

  // Countdown timer logic
  useEffect(() => {
    if (!checkedIn) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerBellNotification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checkedIn]);

  const triggerBellNotification = () => {
    if (bellPlayed) return;
    setBellPlayed(true);
    // Web Audio Synthesizer for School Bell (Ding-Dong chime)
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playNote(523.25, ctx.currentTime, 1.0); // C5
      playNote(659.25, ctx.currentTime + 0.25, 1.0); // E5
      playNote(783.99, ctx.currentTime + 0.5, 1.5); // G5
    } catch (e) {
      console.error('Web Audio API not supported/interrupted:', e);
    }
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    // Add current user to classmates list
    setClassmates((prev) => [
      { name: `${studentName} (You)`, avatar: isJunior ? '🐹' : '🦊', status: 'In Lobby', isMe: true, ping: '8ms' },
      ...prev,
    ]);
  };

  if (joined) {
    return (
      <div className="classroom-dock" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Tiptop Classroom Live Feed"
        />
      </div>
    );
  }

  // Render check-in setup
  if (!checkedIn) {
    return (
      <div style={{
        background: isJunior ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : isTeen ? '#0f172a' : '#070f1e',
        borderRadius: isJunior ? '32px' : '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        border: isJunior ? '4px solid #fff' : isTeen ? '1px solid #334155' : '1px solid rgba(6, 182, 212, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ fontSize: isJunior ? '5rem' : '4rem', animation: 'bounce 3s infinite ease-in-out' }}>
          {isJunior ? '🧑‍🚀' : isTeen ? '💻' : '🚀'}
        </div>
        <h3 style={{
          fontSize: isJunior ? '2.25rem' : '1.75rem',
          fontWeight: 800,
          color: isJunior ? '#1e1b4b' : '#fff',
          fontFamily: 'var(--font-display)',
          margin: 0
        }}>
          {isJunior ? 'Ready for Playground check-in?' : isTeen ? 'LMS Terminal Synchronization' : 'Secure Lobby Presence check-in'}
        </h3>
        <p style={{
          color: isJunior ? '#475569' : '#94a3b8',
          maxWidth: '500px',
          fontSize: '1rem',
          lineHeight: '1.6',
          margin: 0
        }}>
          {isJunior
            ? 'Put on your virtual play helmet! Click below to check-in and see which of your classmates have arrived.'
            : 'Initialize your presence broadcast to synchronize timetables and notify the teacher of your entry.'}
        </p>
        <button
          onClick={handleCheckIn}
          className="btn-premium"
          style={{
            fontSize: '1.2rem',
            padding: '1rem 2.5rem',
            borderRadius: isJunior ? '9999px' : '8px',
            background: isJunior ? 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' : isTeen ? '#4f46e5' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            border: isJunior ? '3px solid #fff' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}
        >
          {isJunior ? '🚀 Check-In to Playground' : isTeen ? 'npm run checkin' : '🛰️ Signal Presence & Join Lobby'}
        </button>
      </div>
    );
  }

  // Render Check-In Lobby (Playground)
  return (
    <div style={{
      background: isJunior ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : isTeen ? '#0f172a' : '#081325',
      borderRadius: isJunior ? '32px' : '16px',
      padding: '2rem',
      border: isJunior ? '4px solid #fff' : isTeen ? '1px solid #1f2937' : '1px solid rgba(6, 182, 212, 0.3)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
    }}>
      
      {/* Header and Countdown */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1.5rem',
        borderBottom: isJunior ? '2px dashed #fcd34d' : '1px solid rgba(255,255,255,0.08)',
        marginBottom: '1.5rem',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="pulse-dot"></span>
            <span style={{
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Lobby Presence Active
            </span>
          </div>
          <h4 style={{ margin: 0, fontSize: '1.3rem', color: isJunior ? '#1e1b4b' : '#fff' }}>
            {isJunior ? '🎈 Classroom Playground' : '🛰️ Cohort Assembly Lobby'}
          </h4>
        </div>

        {/* Countdown display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: isJunior ? '#fff' : 'rgba(255,255,255,0.03)',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          border: isJunior ? '1px solid #fcd34d' : '1px solid rgba(255,255,255,0.1)'
        }}>
          <Clock style={{ width: '18px', height: '18px', color: isJunior ? '#ff7e5f' : '#22d3ee' }} />
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: isJunior ? '#1e1b4b' : '#fff',
            fontFamily: 'var(--font-mono)'
          }}>
            {timeLeft > 0 ? `Uplink in ${timeLeft}s` : 'Session is Live!'}
          </span>
        </div>
      </div>

      {/* Main split: classmates online presence & classroom action */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', minHeight: '220px' }} className="grid-2">
        
        {/* Classmates Presence Checklist */}
        <div style={{
          background: isJunior ? '#fff' : 'rgba(0,0,0,0.2)',
          padding: '1.25rem',
          borderRadius: isJunior ? '24px' : '10px',
          border: isJunior ? '1px solid #fef3c7' : '1px solid rgba(255,255,255,0.05)'
        }}>
          <h5 style={{
            margin: '0 0 1rem 0',
            fontSize: '0.9rem',
            color: isJunior ? '#475569' : '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Users style={{ width: '16px', height: '16px' }} />
            {isJunior ? 'Classmates Checked-in' : 'Presence Roster Sync'}
          </h5>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {classmates.map((c, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: c.isMe 
                  ? (isJunior ? '#fffbeb' : 'rgba(79, 70, 229, 0.1)') 
                  : (c.status === 'In Lobby' ? (isJunior ? '#f0fdf4' : 'rgba(16, 185, 129, 0.05)') : 'transparent'),
                border: c.isMe ? `1px solid ${isJunior ? '#fcd34d' : 'rgba(79, 70, 229, 0.3)'}` : '1px solid transparent',
                transition: 'all 0.5s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{c.avatar || '👤'}</span>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: c.isMe ? (isJunior ? '#b45309' : '#818cf8') : (isJunior ? '#1e293b' : '#fff')
                    }}>
                      {c.name}
                    </div>
                    {isTeen && <div style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>ping: {c.ping}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: c.status === 'In Lobby' ? '#10b981' : '#6b7280',
                    boxShadow: c.status === 'In Lobby' ? '0 0 8px #10b981' : 'none'
                  }}></span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: c.status === 'In Lobby' ? '#10b981' : '#6b7280'
                  }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launcher status & Audio chime test */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem',
          background: isJunior ? '#fff' : 'rgba(255,255,255,0.01)',
          borderRadius: isJunior ? '24px' : '10px',
          border: isJunior ? '1px solid #fef3c7' : '1px solid rgba(255,255,255,0.05)'
        }}>
          <div>
            <h5 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1rem',
              fontWeight: 800,
              color: isJunior ? '#1e1b4b' : '#fff'
            }}>
              {isJunior ? '🔔 School Bell Check' : '🔊 Chime Diagnostics'}
            </h5>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: isJunior ? '#475569' : '#94a3b8',
              lineHeight: '1.5',
              marginBottom: '1rem'
            }}>
              Verify system audio. Test the assembly bell to prepare for synchronized entry.
            </p>
            <button
              onClick={() => triggerBellNotification()}
              style={{
                background: 'transparent',
                border: isJunior ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: isJunior ? '#475569' : '#fff',
                cursor: 'pointer'
              }}
            >
              <Volume2 style={{ width: '14px', height: '14px' }} /> Play Test Bell
            </button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={() => setJoined(true)}
              disabled={timeLeft > 0}
              className="btn-premium"
              style={{
                width: '100%',
                fontSize: '1.1rem',
                padding: '0.85rem',
                borderRadius: isJunior ? '9999px' : '8px',
                background: timeLeft > 0 
                  ? '#475569' 
                  : (isJunior ? 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' : isTeen ? '#4f46e5' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'),
                cursor: timeLeft > 0 ? 'not-allowed' : 'pointer',
                opacity: timeLeft > 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                animation: timeLeft === 0 ? 'pulse-border 2s infinite ease-in-out' : 'none'
              }}
            >
              <Play style={{ width: '18px', height: '18px', fill: 'white' }} />
              {timeLeft > 0 ? `Waiting for Bell...` : (isJunior ? 'Enter Playroom Dock' : 'Enter Live Assembly')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
