'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChatMessage } from '@/lib/types';
import { sendChatMessage } from '@/app/admin/actions';
import { Send, MessageCircle, User, ShieldAlert, Sparkles } from 'lucide-react';

interface ChatPanelProps {
  sessionId: string;
  currentUserId: string;
  currentUserRole: string;
}

export default function ChatPanel({ sessionId, currentUserId, currentUserRole }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // 1. Fetch initial chat history & Subscribe to real-time updates
  useEffect(() => {
    async function loadChatHistory() {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data as ChatMessage[]);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadChatHistory();

    // Subscribe to REALTIME insert channel
    const channel = supabase
      .channel(`session-chat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await sendChatMessage(sessionId, textToSend);
      if (!res.success) {
        alert(res.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(217, 119, 6, 0.15)', color: '#f59e0b', label: 'Admin' };
      case 'teacher':
        return { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', label: 'Teacher' };
      case 'parent':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', label: 'Parent' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: 'Student' };
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '550px', padding: 0 }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid hsl(var(--border-soft))',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981',
          animation: 'pulse-dot 1.5s infinite ease-in-out'
        }} />
        <MessageCircle style={{ width: '18px', height: '18px', color: 'hsl(var(--accent-purple))' }} />
        <h3 style={{ fontSize: '1rem', margin: 0 }}>Classroom Live Chat</h3>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.9); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
      `}</style>

      {/* Messages Feed */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'hsl(var(--text-muted))' }}>
            <Sparkles style={{ width: '24px', height: '24px', animation: 'spin 2s linear infinite', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Loading classroom chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '1rem' }}>
            <MessageCircle style={{ width: '32px', height: '32px', marginBottom: '0.5rem', opacity: 0.4 }} />
            <p style={{ fontSize: '0.85rem', margin: 0 }}>No messages yet.</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Be the first to say hi to the class!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const badge = getRoleBadgeStyle(msg.sender_role);

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Sender metadata */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginBottom: '0.2rem',
                  fontSize: '0.75rem',
                }}>
                  <span style={{ fontWeight: 600, color: isMe ? 'hsl(var(--accent-purple))' : 'hsl(var(--text-primary))' }}>
                    {msg.sender_name}
                  </span>
                  <span className="badge" style={{
                    fontSize: '0.55rem',
                    padding: '0 0.25rem',
                    background: badge.bg,
                    color: badge.color,
                    border: 'none',
                  }}>
                    {badge.label}
                  </span>
                </div>

                {/* Message bubble */}
                <div style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: isMe ? 'linear-gradient(135deg, hsla(var(--accent-purple), 0.25) 0%, hsla(var(--accent-pink), 0.2) 100%)' : 'rgba(255, 255, 255, 0.03)',
                  border: isMe ? '1px solid hsla(var(--accent-purple), 0.3)' : '1px solid hsl(var(--border-soft))',
                  color: '#fff',
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}>
                  {msg.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSend} style={{
        padding: '1rem',
        borderTop: '1px solid hsl(var(--border-soft))',
        display: 'flex',
        gap: '0.5rem',
      }}>
        <input
          type="text"
          className="form-input"
          placeholder="Ask a question or announce something..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flexGrow: 1, height: '40px', fontSize: '0.875rem' }}
          maxLength={1000}
          required
        />
        <button
          type="submit"
          className="btn-premium"
          disabled={sending || !inputText.trim()}
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
        >
          <Send style={{ width: '16px', height: '16px' }} />
        </button>
      </form>
    </div>
  );
}
