'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface ClassroomDockProps {
  meetingToken: string;
  studentName: string;
  isJunior: boolean;
}

export default function ClassroomDock({ meetingToken, studentName, isJunior }: ClassroomDockProps) {
  const [joined, setJoined] = useState(false);

  // Clean room name to only allow valid room characters
  const cleanRoomName = meetingToken
    ? meetingToken.replace(/[^a-zA-Z0-9-_]/g, '-')
    : 'TiptopAcademy-DefaultRoom';

  // Construct Jitsi iframe URL with query hashes for customization:
  // - prejoinPageEnabled=false to skip prejoin page
  // - startWithAudioMuted=true/startWithVideoMuted=false
  // - userInfo.displayName to set child's name
  // - toolbar buttons configuration for child-safety
  const jitsiUrl = `https://meet.jit.si/${cleanRoomName}#userInfo.displayName="${encodeURIComponent(studentName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false&config.disableDeepLinking=true&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","chat","raisehand","tileview","hangup"]`;

  if (joined) {
    return (
      <div className="classroom-dock">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-lg)' }}
          title="Tiptop Classroom Live Feed"
        />
      </div>
    );
  }

  return (
    <div className="classroom-dock">
      {/* Classroom header details */}
      <div className="classroom-pulse-indicator">
        <span className="pulse-dot"></span>
        <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          LIVE ROOM ACTIVE
        </span>
      </div>

      {/* Classroom UI placeholder content representing the actual SDK embed */}
      <div className="classroom-placeholder-content">
        <span style={{ fontSize: '5rem' }}>👩‍🏫</span>
        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
          {isJunior ? 'Your Live Playroom is Ready!' : 'Secured Live Session Uplink'}
        </h3>
        <p style={{ color: '#94a3b8', maxWidth: '500px', fontSize: '1rem', lineHeight: '1.6' }}>
          {isJunior 
            ? 'Connect your camera and microphone to jump inside your playroom with Ms. Barbara!' 
            : 'Your live session is currently broadcasting. Connect your camera and microphone below to join.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setJoined(true)}
            className="btn-premium" 
            style={{
              fontSize: '1.1rem',
              padding: '0.85rem 2rem',
              borderRadius: isJunior ? '9999px' : 'var(--radius-md)',
              background: isJunior ? 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            }}
          >
            {isJunior ? 'Enter Playroom Dock' : 'Enter Safe Classroom Dock'} <Play style={{ width: '18px', height: '18px', fill: 'white' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
