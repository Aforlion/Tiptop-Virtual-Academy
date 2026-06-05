'use client';

import React, { useState, useTransition } from 'react';
import { saveAvailability, AvailabilitySlot } from '@/app/teacher/actions';
import { TeacherAvailability } from '@/lib/types';
import { Loader2, Save, RotateCcw } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Generate 30-min time slots from 06:00 to 22:00
const TIME_SLOTS: string[] = [];
for (let h = 6; h < 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

// A slot key is "day-HH:MM"
function slotKey(day: number, time: string) {
  return `${day}-${time}`;
}

function slotsToSet(slots: TeacherAvailability[]): Set<string> {
  const set = new Set<string>();
  for (const s of slots) {
    // start_time from DB is "HH:MM:SS" — trim to "HH:MM"
    const t = s.start_time.substring(0, 5);
    set.add(slotKey(s.day_of_week, t));
  }
  return set;
}

interface Props {
  initialSlots: TeacherAvailability[];
}

export default function AvailabilityClient({ initialSlots }: Props) {
  const [active, setActive] = useState<Set<string>>(slotsToSet(initialSlots));
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean>(true); // true = turning ON, false = turning OFF
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const toggle = (day: number, time: string, force?: boolean) => {
    const key = slotKey(day, time);
    setActive(prev => {
      const next = new Set(prev);
      const turnOn = force !== undefined ? force : !next.has(key);
      if (turnOn) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleMouseDown = (day: number, time: string) => {
    const key = slotKey(day, time);
    const turningOn = !active.has(key);
    setDragValue(turningOn);
    setIsDragging(true);
    toggle(day, time, turningOn);
  };

  const handleMouseEnter = (day: number, time: string) => {
    if (isDragging) toggle(day, time, dragValue);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClearAll = () => {
    setActive(new Set());
    setFeedback(null);
  };

  const handleSave = () => {
    setFeedback(null);
    const slots: AvailabilitySlot[] = [];

    for (const key of active) {
      const [dayStr, time] = key.split('-');
      const day = parseInt(dayStr, 10);
      const [h, m] = time.split(':').map(Number);
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? 0 : 30;
      slots.push({
        day_of_week: day,
        start_time: time,
        end_time: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      });
    }

    startTransition(async () => {
      const result = await saveAvailability(slots);
      setFeedback({
        type: result.success ? 'success' : 'error',
        msg: result.success ? result.message || 'Saved!' : result.error || 'Failed to save.',
      });
    });
  };

  const activeCount = active.size;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Summary Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', margin: 0 }}>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>{activeCount}</span> slot{activeCount !== 1 ? 's' : ''} selected
            {' '}· <span style={{ color: 'hsl(var(--text-muted))' }}>Click or drag to toggle. Hold and drag across multiple slots.</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleClearAll}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
            disabled={isPending}
          >
            <RotateCcw style={{ width: '16px', height: '16px' }} /> Clear All
          </button>
          <button
            onClick={handleSave}
            className="btn-premium"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
            disabled={isPending}
          >
            {isPending
              ? <><Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> Saving...</>
              : <><Save style={{ width: '16px', height: '16px' }} /> Save Schedule</>
            }
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="glass-card" style={{
          padding: '0.875rem 1.25rem',
          borderColor: feedback.type === 'success' ? '#10b981' : '#ef4444',
          background: feedback.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          color: feedback.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
        }}>
          {feedback.type === 'success' ? '✅' : '❌'} {feedback.msg}
        </div>
      )}

      {/* Grid */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto', userSelect: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px', minWidth: '600px' }}>
          <thead>
            <tr>
              {/* Time label column */}
              <th style={{ width: '60px', textAlign: 'right', paddingRight: '0.75rem', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: 500 }} />
              {DAYS.map((d, i) => (
                <th key={i} style={{
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: i === 0 || i === 6 ? 'hsl(var(--text-muted))' : '#fff',
                  paddingBottom: '0.75rem',
                }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time}>
                <td style={{
                  textAlign: 'right',
                  paddingRight: '0.75rem',
                  fontSize: '0.7rem',
                  color: 'hsl(var(--text-muted))',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}>
                  {time.endsWith(':00') ? time : ''}
                </td>
                {DAYS.map((_, day) => {
                  const key = slotKey(day, time);
                  const isOn = active.has(key);
                  return (
                    <td key={day} style={{ padding: 0 }}>
                      <div
                        onMouseDown={() => handleMouseDown(day, time)}
                        onMouseEnter={() => handleMouseEnter(day, time)}
                        style={{
                          height: '20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'background 0.1s, box-shadow 0.1s',
                          background: isOn
                            ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                            : 'rgba(255,255,255,0.04)',
                          boxShadow: isOn ? '0 0 8px rgba(6,182,212,0.35)' : 'none',
                          border: isOn ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.04)',
                        }}
                        title={`${DAY_FULL[day]} ${time}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'inline-block' }} />
          Available
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '3px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-block' }} />
          Unavailable
        </span>
      </div>
    </div>
  );
}
