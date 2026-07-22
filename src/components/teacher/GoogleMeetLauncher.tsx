'use client';

import React, { useState } from 'react';
import { Video, RefreshCw, CheckCircle2, AlertTriangle, Play, Square, ExternalLink } from 'lucide-react';
import { startLiveSession, generateGoogleMeetLink } from '@/app/teacher/actions';

interface GoogleMeetLauncherProps {
  sessionId: string;
  meetingToken: string;
  existingMeetUrl?: string | null;
  syncStatus?: string | null;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
}

export default function GoogleMeetLauncher({
  sessionId,
  meetingToken,
  existingMeetUrl,
  syncStatus = 'synced',
  status,
  startedAt,
  endedAt
}: GoogleMeetLauncherProps) {
  const [loading, setLoading] = useState(false);
  const [meetUrl, setMeetUrl] = useState<string | null>(existingMeetUrl || null);
  const [currentStatus, setCurrentStatus] = useState<string>(status);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cleanRoom = meetingToken.replace(/[^a-zA-Z0-9-_]/g, '-');
  const googleMeetLink = meetUrl || `https://meet.google.com/lookup/${cleanRoom}`;

  const handleGenerateLink = async () => {
    setLoading(true);
    setMessage(null);
    const res = await generateGoogleMeetLink(sessionId);
    setLoading(false);
    if (res.success) {
      setMeetUrl(googleMeetLink);
      setMessage({ type: 'success', text: res.message || 'Google Meet link synchronized.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to sync Meet link.' });
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    const res = await startLiveSession(sessionId);
    setLoading(false);
    if (res.success) {
      setCurrentStatus('live');
      setMessage({ type: 'success', text: 'Live lesson launched. Session start time logged.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Could not launch session.' });
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.6rem', borderRadius: '10px' }}>
            <Video style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Google Meet Classroom Launcher</h4>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
              Google Workspace Integration Service • Room: <code>{cleanRoom}</code>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {syncStatus === 'synced' ? (
            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
              <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Workspace Synced
            </span>
          ) : (
            <span className="badge badge-yellow" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
              <AlertTriangle style={{ width: '12px', height: '12px' }} /> Queue Retry Pending
            </span>
          )}
        </div>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <a
          href={googleMeetLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStartSession}
          className="btn-premium"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '0.65rem 1.25rem' }}
        >
          <Play style={{ width: '16px', height: '16px' }} /> Launch Google Meet <ExternalLink style={{ width: '14px', height: '14px' }} />
        </a>

        {!existingMeetUrl && (
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem' }}
          >
            <RefreshCw style={{ width: '16px', height: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Sync Calendar Event
          </button>
        )}
      </div>

      {/* Metadata Log */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
        <div>
          <strong>Session Status:</strong> <span style={{ textTransform: 'capitalize', color: currentStatus === 'live' ? '#10b981' : '#38bdf8' }}>{currentStatus}</span>
        </div>
        <div>
          <strong>Start Logged:</strong> {startedAt ? new Date(startedAt).toLocaleTimeString() : 'Not started'}
        </div>
        <div>
          <strong>End Logged:</strong> {endedAt ? new Date(endedAt).toLocaleTimeString() : 'In progress'}
        </div>
      </div>
    </div>
  );
}
