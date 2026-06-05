'use client';

import React, { useState } from 'react';
import { TeacherEarning } from '@/lib/types';
import { DollarSign, TrendingUp, Clock, CheckCircle, Calculator } from 'lucide-react';

interface Props {
  earnings: TeacherEarning[];
}

const BASE_FEE_DEFAULT = 500000;      // 5,000 NGN in kobo
const CREDIT_PRICE    = 250000;       // 2,500 NGN per credit in kobo
const SHARE_RATE      = 0.30;         // 30%

function koboToNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function EarningsClient({ earnings }: Props) {
  // Calculator state
  const [calcSessions,  setCalcSessions]  = useState(1);
  const [calcCredits,   setCalcCredits]   = useState(5);
  const [calcBaseFee,   setCalcBaseFee]   = useState(5000);   // user enters in NGN
  const [calcShareRate, setCalcShareRate] = useState(30);     // %

  // Derived totals
  const totalEarned  = earnings.reduce((s, e) => s + (e.total_cents  || 0), 0);
  const totalPaidOut = earnings.reduce((s, e) => s + (e.paid_out ? (e.total_cents || 0) : 0), 0);
  const totalPending = totalEarned - totalPaidOut;

  const paidCount    = earnings.filter(e => e.paid_out).length;
  const pendingCount = earnings.length - paidCount;

  // Calculator result
  const calcBase        = calcSessions * calcBaseFee * 100;                  // kobo
  const calcShare       = calcSessions * calcCredits * CREDIT_PRICE * (calcShareRate / 100);
  const calcTotal       = calcBase + calcShare;

  const stats = [
    {
      label: 'Total Earned',
      value: koboToNaira(totalEarned),
      sub: `${earnings.length} session${earnings.length !== 1 ? 's' : ''}`,
      icon: DollarSign,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.12)',
    },
    {
      label: 'Paid Out',
      value: koboToNaira(totalPaidOut),
      sub: `${paidCount} payment${paidCount !== 1 ? 's' : ''}`,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
    },
    {
      label: 'Pending Payout',
      value: koboToNaira(totalPending),
      sub: `${pendingCount} awaiting`,
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
    },
    {
      label: 'Avg. Per Session',
      value: earnings.length ? koboToNaira(Math.round(totalEarned / earnings.length)) : '₦0.00',
      sub: 'base + credit share',
      icon: TrendingUp,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.12)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Stat Cards ── */}
      <div className="grid-4" style={{ gap: '1.25rem' }}>
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ background: bg, color, padding: '0.75rem', borderRadius: '12px', flexShrink: 0 }}>
              <Icon style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', marginTop: '0.25rem' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column: Table + Calculator ── */}
      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>

        {/* Earnings Breakdown Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>Session Breakdown</h2>

          {earnings.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <DollarSign style={{ width: '36px', height: '36px', color: 'hsl(var(--text-muted))', margin: '0 auto 1rem' }} />
              <p style={{ color: 'hsl(var(--text-secondary))' }}>
                No earnings yet. They appear automatically when a session you teach is marked complete.
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--text-muted))', textAlign: 'left' }}>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Course</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Date</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Base Fee</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Credit Share</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Total</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => {
                    const session = e.live_sessions as any;
                    const courseTitle = session?.courses?.title ?? 'Unknown Course';
                    const date = session?.scheduled_start
                      ? new Date(session.scheduled_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—';
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#fff' }}>{courseTitle}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'hsl(var(--text-secondary))' }}>{date}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: 'hsl(var(--text-secondary))' }}>{koboToNaira(e.base_fee_cents)}</td>
                        <td style={{ padding: '0.875rem 1.25rem', color: '#a78bfa' }}>{koboToNaira(e.credit_share_cents)}</td>
                        <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#06b6d4' }}>{koboToNaira(e.total_cents)}</td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: e.paid_out ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: e.paid_out ? '#10b981' : '#f59e0b',
                          }}>
                            {e.paid_out ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Earnings Split Calculator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
            Earnings Calculator
          </h2>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', margin: 0 }}>
              Estimate your earnings based on sessions taught, credits consumed, and rates.
            </p>

            {[
              { label: 'Sessions Taught', value: calcSessions, setter: setCalcSessions, min: 1, max: 50, step: 1 },
              { label: 'Credits Used Per Session', value: calcCredits, setter: setCalcCredits, min: 0, max: 30, step: 1 },
              { label: 'Base Fee Per Session (₦)', value: calcBaseFee, setter: setCalcBaseFee, min: 0, max: 50000, step: 500 },
              { label: 'Your Credit Share Rate (%)', value: calcShareRate, setter: setCalcShareRate, min: 0, max: 100, step: 5 },
            ].map(({ label, value, setter, min, max, step }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>{label}</label>
                  <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                    {label.includes('₦') ? `₦${value.toLocaleString()}` : label.includes('%') ? `${value}%` : value}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={e => setter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
                />
              </div>
            ))}

            {/* Result */}
            <div style={{
              marginTop: '0.5rem',
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.1) 100%)',
              border: '1px solid rgba(6,182,212,0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))', fontSize: '0.8rem' }}>
                <span>Base ({calcSessions} × ₦{calcBaseFee.toLocaleString()})</span>
                <span>{koboToNaira(calcBase)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'hsl(var(--text-secondary))', fontSize: '0.8rem' }}>
                <span>Credit share ({calcSessions} × {calcCredits} credits × {calcShareRate}%)</span>
                <span style={{ color: '#a78bfa' }}>{koboToNaira(calcShare)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>Estimated Total</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#06b6d4' }}>{koboToNaira(calcTotal)}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', margin: 0 }}>
              * Actual amounts are set by the admin and may differ. This calculator uses standard platform rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
