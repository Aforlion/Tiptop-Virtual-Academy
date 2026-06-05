import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Link from 'next/link';
import { MessageSquare, ArrowRight, Star, MessagesSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CommunityChannelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all forum channels
  const { data: channels, error } = await supabase
    .from('forum_channels')
    .select('*')
    .order('channel_type', { ascending: true })
    .order('name', { ascending: true });

  const safeChannels = channels || [];

  return (
    <>
      <PageHeader
        title="Tiptop Community Hub"
        subtitle="Connect with other students & teachers, ask questions, and join your Tribe channels!"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '900px' }}>
        {safeChannels.map((channel) => (
          <div key={channel.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                fontSize: '2rem',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {channel.emoji || '💬'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>{channel.name}</h3>
                  <span className="badge" style={{
                    fontSize: '0.65rem',
                    background: channel.channel_type === 'announcements' ? 'rgba(239, 68, 68, 0.15)' : channel.channel_type === 'course_qa' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                    color: channel.channel_type === 'announcements' ? '#f87171' : channel.channel_type === 'course_qa' ? '#60a5fa' : '#a78bfa',
                    border: '1px solid currentColor',
                  }}>
                    {channel.channel_type}
                  </span>
                </div>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: 0 }}>
                  {channel.description || 'Join the discussion!'}
                </p>
              </div>
            </div>

            <Link href={`/community/${channel.id}`} className="btn-premium" style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}>
              Enter Channel
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
